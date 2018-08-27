// @flow strict

import { on, doc } from "../elm/virtual-dom.js"
import { text, body, main, article, a, img, span } from "../elm/element.js"
import { src, alt, href, className } from "../elm/attribute.js"
import { spawn } from "../elm/application.js"
import { navigate } from "../elm/navigation.js"
import { storage } from "../async-local-storage.js"
import { fx, nofx, batch } from "../elm/fx.js"
import { identity, never } from "../elm/basics.js"
import * as IndexFX from "../Request/Index.js"
import * as Profile from "../Page/Profile.js"

/*::
import type {Node, Doc} from "../elm/virtual-dom.js"
import type {Effect} from "../elm/fx.js"


export type Model = Index

export type Message =
  | { type: "fetchedProfiles", fetchedProfiles:string[] }
  | { type: "updateProfile", id:string, message:Profile.Message }
  | { type: "addProfile" }
  | { type: "addedProfile", addedProfile:Profile.Model }
  | { type: "startProfile", startProfile:string }
*/

class Index {
  static decode(input /*:Object*/) {
    const { profiles } = JSON.parse(JSON.stringify(input))
    return new Index(profiles)
  }

  /*::
  profiles:Profile.Model[]
  */
  constructor(profiles /*:Profile.Model[]*/) {
    this.profiles = profiles
  }
  setProfiles(profiles /*:Profile.Model[]*/) {
    return new Index(profiles)
  }
  addProfile(newProfile /*:Profile.Model*/) {
    for (const [index, profile] of this.profiles.entries()) {
      if (profile.id === newProfile.id) {
        const newProfiles = this.profiles.slice(0)
        newProfiles[index] = profile
        return this.setProfiles(newProfiles)
      }
    }
    return this.setProfiles([...this.profiles, newProfile])
  }
  toJSON() {
    const { profiles } = this
    return { profiles }
  }
}

export const init = (main /*:?Object*/) /*:[Model, Effect<Message>]*/ => {
  if (main) {
    return [Index.decode(main), nofx]
  } else {
    return [new Index([]), fx(IndexFX.listProfiles(Route.fetchedProfiles))]
  }
}

export const update = (message /*:Message*/, state /*:Index*/) => {
  switch (message.type) {
    case "fetchedProfiles": {
      const profiles = []
      const effects = []
      for (const id of message.fetchedProfiles) {
        const [profile, fx] = Profile.load(id)
        profiles.push(profile)
        effects.push(fx.map(Route.updateProfile(profile.id)))
      }

      return [state.setProfiles(profiles), batch(...effects)]
    }
    case "addProfile": {
      // return [state, fx(addProfile, Route.addProfile)]
      throw 1
    }
    case "addedProfile": {
      return [state.addProfile(message.addedProfile), nofx]
    }
    case "startProfile": {
      console.log("Start profile")
      return [state, nofx]
    }
    case "updateProfile": {
      const profiles = []
      const effects = []
      for (const profile of state.profiles) {
        if (profile.id === message.id) {
          const [state, fx] = Profile.update(message.message, profile)
          profiles.push(state)
          effects.push(fx.map(Route.updateProfile(profile.id)))
        } else {
          profiles.push(profile)
        }
      }
      return [state.setProfiles(profiles), batch(...effects)]
    }
    default: {
      return never(message)
    }
  }
}

export const view = (state /*:Index*/) /*:Doc<Message>*/ => {
  return doc(
    "Select your user profile",
    body(
      [],
      [
        main(
          [className("main layer profile-selector")],
          [
            article(
              [className("selector")],
              [...state.profiles.map(viewProfile), viewAddProfile()]
            )
          ]
        )
      ]
    )
  )
}

const viewAddProfile = () =>
  a(
    [className("select new profile"), on("click", Decode.addProfile)],
    [
      img([className("avatar"), alt(" "), src("")]),
      span([className("label")], [text("Add Profile")])
    ]
  )

const viewProfile = (profile /*:Profile.Model*/) => {
  switch (profile.tag) {
    case "LoadingProfile":
      return viewProfileState("loading", profile.id, ".....", "")
    case "LoadedProfile":
      return viewProfileState(
        "ready",
        profile.id,
        profile.data.name,
        new URL(profile.data.avatarURL, `dat://${profile.id}/`).href
      )
    case "FailedProfile":
      return viewProfileState("error", profile.id, profile.error.message, "")
    default:
      return viewProfileState("error", profile.id, "", "")
  }
}

const viewProfileState = (status, id, label, url) =>
  a(
    [className("select profile status-${status}"), href(id)],
    [
      img([className("avatar"), alt(""), src(url)]),
      span([className("label")], [text(label)])
    ]
  )

class Route {
  static fetchedProfiles(entries) {
    return { type: "fetchedProfiles", fetchedProfiles: entries }
  }
  static addProfile(profile) {
    if (typeof profile === "string") {
      return { type: "startProfile", startProfile: profile }
    } else {
      return { type: "addedProfile", addedProfile: profile }
    }
  }
  static updateProfile(id) {
    return message => ({
      type: "updateProfile",
      id,
      message
    })
  }
}

const Decode = {
  addProfile: {
    decode() {
      return { type: "addProfile", message: null }
    }
  }
}
