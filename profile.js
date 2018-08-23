import { spawn } from "./application.js"
import { fx, nofx, chain } from "./fx.js"

const createBlobURL = ({ state }) => {
  if (state.file) {
    const url = URL.createObjectURL(state.file)
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
  document.querySelector("#profile").classList.add("editable")
  document.querySelector("#profile-name").contentEditable = true
  document.querySelector("#profile-bio").contentEditable = true
  document.querySelector("#profile-name").focus()
}

const readFile = async ({ state }) => {
  if (state.file) {
    const url = await readAsDataURL(state.file)
    main.send("setAvatar", url)
  }
}

const initUI = async main => {
  const { protocol, host } = main.document.location
  if (protocol === "dat:") {
    const archive = await DatArchive.load(`dat://${host}`)
    const info = await archive.getInfo()
    main.send("setArchive", { archive, info })
  }
}

class Profile {
  static setArchive({ detail }, state) {
    if (detail.info.isOwner) {
      return fx(state.setArchive(detail.archive), enableEditing)
    } else {
      return nofx(state.setArchive(detail.archive))
    }
  }
  static setAvatar(event, state) {
    return fx(state.setAvatar(event.detail), setAvatarURL)
  }
  static click(event, state) {
    if (event.target.id === "profile-avatar") {
      return fx(state, pickFile)
    } else {
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
        return nofx(state.setName(event.target.textContent))
      }
      case "profile-bio": {
        return nofx(state.setBio(event.target.textContent))
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
    return fx(new Profile("", "", "", null), initUI)
  }

  constructor(avatarURL, name, bio, file, archive) {
    this.file = file
    this.avatarURL = avatarURL
    this.name = name
    this.bio = bio
    this.archive = archive
  }
  setAvatar(url) {
    return new Profile(url, this.name, this.bio, this.file, this.archive)
  }
  setName(name) {
    return new Profile(this.avatarURL, name, this.bio, this.file, this.archive)
  }
  setBio(bio) {
    return new Profile(this.avatarURL, this.name, bio, this.file, this.archive)
  }
  setFile(file) {
    return new Profile(this.avatarURL, this.name, this.bio, file, this.archive)
  }
  setArchive(archive) {
    return new Profile(this.avatarURL, this.name, this.bio, this.file, archive)
  }
}

window.main = spawn(Profile)
