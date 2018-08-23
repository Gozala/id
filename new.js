import { on } from "./lib/elm/virtual-dom.js"
import { text, body, main, article, a, img, span } from "./lib/elm/element.js"
import { src, alt, href, className } from "./lib/elm/attribute.js"
import { Widget } from "./lib/elm/widget.js"
import { navigate } from "./lib/elm/navigation.js"
import { storage } from "./async-local-storage.js"

const voidFX = {
  perform(main) {}
}

class FX {
  constructor(task) {
    this.task = task
  }
  async execute(main) {
    const message = await this.task()
    if (message != null) {
      main.send(message)
    }
  }
  perform(main) {
    this.execute(main)
  }
}

class BatchFX {
  constructor(effects) {
    this.effects = effects
  }
  perform(main) {
    for (const fx of this.effects) {
      fx.perform(main)
    }
  }
}

const nofx = state => ({ state, fx: voidFX })
const fx = (state, task) => ({ state, fx: new FX(task) })
const batch = (...tasks) => new BatchFX(tasks)

const { DatArchive } = window.top

class ProfileSelector {
  static decode(input) {
    const { profiles } = JSON.parse(input)
    return new ProfileSelector(profiles)
  }
  static init(main) {
    if (main) {
      return nofx(ProfileSelector.decode(main.state.encode()))
    } else {
      return fx(new ProfileSelector([]), fetchProfiles)
    }
  }
  static onURLRequest(url, isExternal) {
    return { type: "navigate", url: url, isExternal }
  }
  static onURLChange(url) {
    return { type: "navigated", url }
  }
  static update(message, state) {
    switch (message.type) {
      case "fetchedProfiles": {
        return nofx(state.setProfiles(message.fetchedProfiles))
      }
      case "addProfile": {
        return fx(state, addProfile)
      }
      case "addedProfile": {
        return nofx(state.addProfile(message.addedProfile))
      }
      case "startProfile": {
        console.log("Start profile")
        return nofx(state)
      }
      case "navigate": {
        return fx(state, () => navigate(message.url))
      }
      case "noop": {
        return nofx(state)
      }
      default: {
        console.warn(message)
        return nofx(state)
      }
    }
  }
  static view(state) {
    return {
      title: "Select your user profile",
      body: body(
        [],
        [
          main(
            [className("main layer profile-selector")],
            [
              article(
                [className("selector")],
                [...state.profiles.map(viewSelectProfile), viewAddProfile()]
              )
            ]
          )
        ]
      )
    }
  }

  constructor(profiles) {
    this.profiles = profiles
  }
  setProfiles(profiles) {
    return new ProfileSelector(profiles)
  }
  addProfile(newProfile) {
    for (const [index, profile] of this.profiles.entries()) {
      if (profile.profileURL === newProfile.profileURL) {
        const newProfiles = this.profiles.slice(0)
        newProfiles[index] = profile
        return this.setProfiles(newProfiles)
      }
    }
    return this.setProfiles([...this.profiles, newProfile])
  }
  encode() {
    return JSON.stringify(this)
  }
  toJSON() {
    const { profiles } = this
    return { profiles }
  }
}

const viewAddProfile = () =>
  a(
    [className("select new profile"), on("click", decodeAddProfile)],
    [
      img([className("avatar"), alt(" "), src("")]),
      span([className("label")], [text("Add Profile")])
    ]
  )

const viewSelectProfile = ({ name, about, profileURL, avatarURL }) =>
  a(
    [className("select profile"), href(`${profileURL.replace("dat://", "")}`)],
    [
      img([className("avatar"), alt(""), src(`${profileURL}/${avatarURL}`)]),
      span([className("label")], [text(name)])
    ]
  )

const fetchProfiles = async () => {
  const profiles = await storage.get("profiles")
  const entries = []
  for (const id of profiles || []) {
    const result = await fetchProfile(id)
    if (result instanceof top.Error) {
      console.error(result)
    } else {
      entries.push(result)
    }
  }
  return { type: "fetchedProfiles", fetchedProfiles: entries }
}

const fetchProfile = async id => {
  try {
    const identity = await DatArchive.load(`dat://${id}`)
    const content = await identity.readFile("profile.json", {
      encoding: "utf-8"
    })
    const profile = JSON.parse(content)
    profile.profileURL = identity.url
    return profile
  } catch (error) {
    return error
  }
}

const selectProfileArchive = async () => {
  try {
    const archive = await DatArchive.selectArchive({
      title: "Select an archive to use as your user profile",
      buttonLabel: "Select profile",
      filters: {
        isOwner: true,
        type: ["identity", "profile", "id"]
      }
    })
    return archive
  } catch (error) {
    return error
  }
}

const addProfile = async () => {
  const identity = await selectProfileArchive()

  if (identity instanceof top.Error) {
    return { type: "noop" }
  }

  try {
    const content = await identity.readFile("profile.json", {
      encoding: "utf-8"
    })
    const profile = JSON.parse(content)
    profile.profileURL = identity.url
    const id = identity.url.replace("dat://", "")

    const profiles = await storage.get("profiles")
    const updateProfiles = profiles ? [...profile, id] : [id]
    await storage.set("profiles", updateProfiles)

    return { type: "addedProfile", addedProfile: profile }
  } catch (error) {
    return { type: "startProfile", startProfile: identity.url }
  }
}

class Message {
  constructor(message) {
    this.message = message
  }
  decode() {
    return { value: this.message }
  }
}

const decodeAddProfile = new Message({ type: "addProfile" })

if (location.protocol === "dat:") {
  window.top.main = Widget.application(
    ProfileSelector,
    window.top.main,
    window.top.document
  )
}
