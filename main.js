import { spawn } from "./application.js"
import { fx, nofx, chain } from "./fx.js"
import { storage } from "./async-local-storage.js"

const createBlobURL = main => {
  if (main.state.file) {
    const url = URL.createObjectURL(main.state.file)
    main.send("setAvatar", url)
  }
}

const readAsDataURL = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = event => resolve(event.target.result)
    reader.onerror = event => reject(event.target.result)
    reader.readAsDataURL(file)
  })

const readAsArrayBuffer = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = event => resolve(event.target.result)
    reader.onerror = event => reject(event.target.result)
    reader.readAsArrayBuffer(file)
  })

const setAvatarURL = ({ document, state }) =>
  document.querySelector("#profile-avatar").setAttribute("src", state.avatarURL)

const pickFile = ({ document }) =>
  document.querySelector("#profile-avatar-upload").click()

const focusNameField = ({ document }) =>
  document.querySelector("#profile-name").focus()

const setCopyDropEffect = main => {
  preventEvent(main)
  main.event.dataTransfer.dropEffect = "copy"
}

const preventEvent = ({ event }) => {
  event.preventDefault()
  event.stopPropagation()
}

const activateDragZone = ({ document }) =>
  document.querySelector("#profile-avatar").classList.add("dragover")

const deactivateDragZone = ({ document }) =>
  document.querySelector("#profile-avatar").classList.remove("dragover")

const enableEditing = ({ document }) => {
  document.body.innerHTML = renderMain()
  document.querySelector("#profile-name").focus()
}

const updateButton = ({ document, state }) => {
  if (state.file != null && state.name !== "" && state.about !== "") {
    document.querySelector("#create-profile").classList.remove("hidden")
  } else {
    document.querySelector("#create-profile").classList.add("hidden")
  }
}

const readFile = async main => {
  if (main.state.file) {
    const url = await readAsDataURL(main.state.file)
    main.send("setAvatar", url)
  }
}

const renderProfileHTML = ({ name, about, avatarURL }) =>
  `<!doctype html>
<html>

<head>
  <link rel="icon" href="./icons/fontawesome/svgs/solid/fingerprint.svg" type="image/png" />
  <link rel="icon" type="image/x" href="./icons/fontawesome/svgs/solid/fingerprint.svg" />
  <link rel="stylesheet" href="styles.css" type="text/css" />
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="" />
  <title>${name}</title>
</head>

<body>
  <div id="profile" class="center">
    <img id="profile-avatar" alt="" src="${avatarURL}" />
    <input id="profile-avatar-upload" type="file" accept="image/*" />
    <div id="profile-summary">
      <h3 id="profile-name" class="field" placeholder="name">${name}</h3>
      <p id="profile-about" class="field" placeholder="about">${about}</p>
    </div>
  </div>
</body>
<script type="module" src="dat://id.hashbase.io/profile.js"></script>
</html>`

const renderMain = () =>
  `<div id="profile" class="center">
<img id="profile-avatar" alt="" src="" />
<input id="profile-avatar-upload" type="file" accept="image/*" />
<div id="profile-summary">
  <h3 id="profile-name" class="field" placeholder="Name" contentEditable="true"></h3>
  <p id="profile-about" class="field" placeholder="About" contentEditable="true"></p>
</div>
<button id="create-profile" class="button hidden">Create</button>
</div>`

const renederAddProfile = () =>
  `<li class="select profile">
      <img class="avatar" alt="" src="icons/font-awesome/" />
      <span class="label">Add Profile</span>
  </li>`

const renderProfile = ({ name, about, profileURL, avatarURL }) =>
  `<a class="select-profile" href="${profileURL.replace("dat://", "")}">
    <img id="profile-avatar alt="" src="${profileURL}/${avatarURL}" />
    <span id="profile-name"></span>
  </a>`

const createProfile = async ({ state, document }) => {
  const source = await DatArchive.load(`dat://${document.location.host}`)
  const { name, about } = state
  const target = await DatArchive.create({
    title: `profile: ${name}`,
    description: `User profile`,
    type: ["identity", "profile", "id", "id.hashbase.io"],
    prompt: false
  })

  const extension = state.file.name.split(".").pop()
  const avatarURL = `avatar.${extension}`
  const avatar = await readAsArrayBuffer(state.file)
  const profile = { avatarURL, name, about }

  await createPath(target, "icons/fontawesome/svgs/solid")
  await writeFiles(target, {
    "profile.json": JSON.stringify(profile, null, 2),
    "index.html": renderProfileHTML(profile),
    [avatarURL]: avatar
  })

  await copyFiles(source, target, [
    "styles.css",
    "icons/fontawesome/svgs/solid/user-circle.svg",
    "icons/fontawesome/svgs/solid/plus-circle.svg",
    "icons/fontawesome/svgs/solid/fingerprint.svg"
  ])

  document.location.href = target.url
}

const createPath = async (target, path) => {
  const entries = path.split("/")
  let entry = ""
  while (entries.length) {
    entry = `${entry}${entries.shift()}/`
    try {
      await target.mkdir(entry)
    } catch (_) {}
  }
}

const writeFiles = async (target, entries) =>
  Promise.all(
    Object.entries(entries).map(([path, content]) =>
      target.writeFile(path, content)
    )
  )

const copyFile = async (source, target, path) => {
  const file = await source.readFile(path, { encoding: "binary" })
  return await target.writeFile(path, file)
}

const copyFiles = async (source, target, paths) =>
  Promise.all(paths.map(path => copyFile(source, target, path)))

const renderProileSelector = ({ document }) => {
  document.body.innerHTML = `<main class="main profile-selector">
    <aside class="left"></aside>
    <article class="selector">
      <selection class="profiles"></selection>
      <selection class="new">${renederAddProfile()}</selection>
    </article>
    <aside class="right">
</div>
`
}

const loadProfiles = async main => {
  const profiles = await storage.get("profiles")
  if (profiles != null) {
    for (const profile of profiles) {
      await loadProfiles(profiles)
    }
    main.send("profilesLoaded")
  }
}

const loadProfile = async (main, name) => {
  try {
    const identity = await DatArchive.load(`dat://${name}`)
    const profile = await readProfile(identity)
    main.send("profileLoaded", { ...profile, profileURL: identity.url })
  } catch (error) {
    console.log(error)
  }
}

const readProfile = async identity => {
  const profile = await identity.readFile("profile.json", { encoding: "utf-8" })
  return JSON.parse(profile)
}

const renderProfiles = ({ document, state }) => {
  let html = ""
  for (const profile of Object.values(state.profiles)) {
    html += renderProfile(profile)
  }
  document.querySelector(".profile-selector").innerHTML = html
}

const initUI = async main => {
  const { protocol } = main.document.location
  if (protocol === "dat:") {
    main.send("selectProfile")
  }
}

class Profile {
  static profileLoaded({ detail }, state) {
    return nofx(state.addProfile(detail))
  }
  static profilesLoaded(event, state) {
    return fx(state, renderProfiles)
  }
  static selectProfile(event, state) {
    return fx(state, chain(renderProileSelector, loadProfiles))
  }
  static enableEditing({ detail }, state) {
    return fx(state, enableEditing)
  }
  static setAvatar(event, state) {
    return fx(state.setAvatar(event.detail), chain(setAvatarURL, updateButton))
  }
  static click(event, state) {
    switch (event.target.id) {
      case "profile-avatar":
        return fx(state, pickFile)
      case "create-profile":
        return fx(state, createProfile)
      default:
        return nofx(state)
    }
  }
  static change(event, state) {
    return fx(
      state.setFile(event.target.files && event.target.files[0]),
      createBlobURL
    )
  }
  static input(event, state) {
    switch (event.target.id) {
      case "profile-name": {
        return fx(state.setName(event.target.textContent), updateButton)
      }
      case "profile-about": {
        return fx(state.setAbout(event.target.textContent), updateButton)
      }
    }
  }
  static drag(event, state) {
    return fx(state, setCopyDropEffect)
  }
  static dragstart(event, state) {
    return fx(state, setCopyDropEffect)
  }
  static dragover(event, state) {
    return fx(state, chain(setCopyDropEffect, activateDragZone))
  }
  static dragenter(event, state) {
    return fx(state, chain(setCopyDropEffect, activateDragZone))
  }
  static dragend(event, state) {
    return fx(state, chain(setCopyDropEffect, deactivateDragZone))
  }
  static dragleave(event, state) {
    return fx(state, chain(setCopyDropEffect, deactivateDragZone))
  }
  static drop(event, state) {
    return fx(
      state.setFile(event.dataTransfer.files[0]),
      chain(setCopyDropEffect, deactivateDragZone, createBlobURL)
    )
  }
  static new() {
    return fx(new Profile("", "", "", null, {}), initUI)
  }

  constructor(avatarURL, name, about, file, profiles) {
    this.file = file
    this.avatarURL = avatarURL
    this.name = name
    this.about = about
    this.profiles = profiles
  }
  setAvatar(url) {
    return new Profile(url, this.name, this.about, this.file, this.profiles)
  }
  setName(name) {
    return new Profile(
      this.avatarURL,
      name,
      this.about,
      this.file,
      this.profiles
    )
  }
  setAbout(about) {
    return new Profile(
      this.avatarURL,
      this.name,
      about,
      this.file,
      this.profiles
    )
  }
  setFile(file) {
    return new Profile(
      this.avatarURL,
      this.name,
      this.about,
      file,
      this.profiles
    )
  }
  addProfile(id, profile) {
    const profiles = { ...this.profiles, [profile.profileURL]: profile }
    return new Profile(
      this.avatarURL,
      this.name,
      this.about,
      this.file,
      profiles
    )
  }
}

window.main = spawn(Profile)
