// @flow strict

import { on } from "../elm/virtual-dom.js"
import {
  doc,
  body,
  text,
  main,
  h3,
  pre,
  a,
  img,
  input,
  article,
  p,
  basefont
} from "../elm/element.js"
import {
  src,
  alt,
  href,
  className,
  id,
  accept,
  placeholder,
  contentEditable,
  type
} from "../elm/attribute.js"
import { navigate } from "../elm/navigation.js"
import { fx, nofx } from "../elm/fx.js"
import { storage } from "../async-local-storage.js"
import { never } from "../elm/basics.js"
import * as ProfileFX from "../Request/Profile.js"

import { node } from "../elm/virtual-dom.js"
/*::
import type { Doc, Node } from "../elm/virtual-dom.js"

export type Message =
  | { tag:"pickImage" }
  | { tag: "pickedImages", value:FileList }
  | { tag: "load", value:string }
  | { tag: "loadError", value:Error }
  | { tag: "showDragZone" }
  | { tag: "hideDragZone" }
  | { tag: "dropFiles", value:FileList }
  | { tag: "updateAvatar", value:string }
  | { tag: "avatarLoaded", value:string }


export type Profile =
  | LoadingProfile
  | LoadedProfile
  | FailedProfile

export type Model = Profile

export type FailedProfile = {
  tag:"FailedProfile";
  id:string;
  error:Error;
}

export type LoadingProfile = {
  tag:"LoadingProfile";
  id:string;
}

export type ProfileData = {
  id:string;
  avatarURL:string;
  name:string;
  about:string;
}

export type LoadedProfile = {
  tag:"LoadedProfile";
  id:string;
  showDragZone:boolean;
  data:ProfileData;
}
*/

const PICKER_ID = "profile-avatar-upload"

class Data {
  static new(id) {
    return { tag: "LoadingProfile", id }
  }
  static loaded(data) /*:Model*/ {
    return { tag: "LoadedProfile", id: data.id, showDragZone: false, data }
  }
  static load(id, input) /*:Model*/ {
    const { avatarURL, name, about } = JSON.parse(input)
    return Data.loaded({
      id,
      avatarURL: String(avatarURL || ""),
      name: String(name || ""),
      about: String(about || "")
    })
  }
  static failed(id, error) {
    return { tag: "FailedProfile", id, error }
  }
  static updateAvatar(state, url) {
    if (state.tag === "LoadedProfile") {
      return {
        ...state,
        data: { ...state.data, avatarURL: url }
      }
    } else {
      return state
    }
  }
  static updateDragZoneState(state, showDragZone) {
    if (state.tag === "LoadedProfile" && state.showDragZone != showDragZone) {
      return { ...state, showDragZone }
    } else {
      return state
    }
  }
}

export const load = (id /*:string*/) => {
  return [
    Data.new(id),
    fx(ProfileFX.loadProfile(id), Route.load, Route.loadError)
  ]
}

export const init = (data /*:ProfileData*/) => {
  const state = Data.loaded(data)
  return [state, nofx]
}

export const update = (message /*:Message*/, state /*:Profile*/) => {
  switch (message.tag) {
    case "load": {
      return [Data.load(state.id, message.value), nofx]
    }
    case "loadError": {
      return [Data.failed(state.id, message.value), nofx]
    }
    case "pickImage": {
      return [state, fx(ProfileFX.pickFiles(PICKER_ID), Route.pickedImages)]
    }
    case "pickedImages": {
      return [
        state,
        fx(ProfileFX.createObjectURL(message.value[0]), Route.updateAvatar)
      ]
    }
    case "showDragZone": {
      return [Data.updateDragZoneState(state, true), nofx]
    }
    case "hideDragZone": {
      return [Data.updateDragZoneState(state, false), nofx]
    }
    case "dropFiles": {
      return [
        Data.updateDragZoneState(state, false),
        fx(ProfileFX.createObjectURL(message.value[0]), Route.updateAvatar)
      ]
    }
    case "avatarLoaded": {
      return [state, fx(ProfileFX.revokeObjectURL(message.value))]
    }
    case "updateAvatar": {
      return [Data.updateAvatar(state, message.value), nofx]
    }
    default: {
      return never(message)
    }
  }
}

const page = (title /*:string*/, main /*:Node<Message>*/) /*:Doc<Message>*/ =>
  doc(title, body([], [main]))

export const view = (state /*:Profile*/) /*:Doc<Message>*/ => {
  switch (state.tag) {
    case "LoadingProfile": {
      return page("Loading...", viewLoadingProfile(state))
    }
    case "LoadedProfile": {
      return page(
        `${state.data.name}`,
        viewLoadedProfile(state.showDragZone, state.data)
      )
    }
    case "FailedProfile": {
      return page("Failure", viewFailedProfile(state))
    }
    default: {
      return page("Not Found", viewNotFound(state))
    }
  }
}

const viewLoadedProfile = (
  showDragZone,
  data,
  editable = true
) /*:Node<Message>*/ =>
  main(
    [
      id("profile"),
      className("center"),
      on("dragstart", Decode.dragStart),
      on("dragenter", Decode.dragEnter),
      on("dragover", Decode.dragOver),
      on("dragend", Decode.dragEnd),
      on("dragleave", Decode.dragLeave),
      on("drop", Decode.drop)
    ],
    [
      img([
        id("profile-avatar"),
        alt(),
        className(showDragZone ? "dragover" : ""),
        src(new URL(data.avatarURL, `dat://${data.id}/`).href),
        on("click", Decode.pickImage),
        on("load", Decode.avatarLoaded)
      ]),
      input([id(PICKER_ID), type("file"), accept("image/*")]),
      article(
        [id("profile-summary")],
        [
          h3(
            [
              id("profile-name"),
              className("field"),
              placeholder("Name"),
              contentEditable(editable)
            ],
            [text(data.name)]
          ),
          p(
            [
              id("profile-about"),
              className("field"),
              placeholder("About"),
              contentEditable(editable)
            ],
            [text(data.about)]
          )
        ]
      )
    ]
  )

const viewLoadingProfile = ({ id }) => main([], [text(`Loading profile ${id}`)])

const viewFailedProfile = ({ id, error }) =>
  main(
    [],
    [
      h3([], [text("Failed to load profile")]),
      pre([], [text(error.toString())])
    ]
  )

const viewNotFound = state =>
  main(
    [],
    [
      h3([], [text("Unknown state encountered")]),
      pre([], [text(JSON.stringify(state, null, 2))])
    ]
  )

class Route {
  static load(input) /*:Message*/ {
    return { tag: "load", value: input }
  }
  static loadError(error) /*:Message*/ {
    return { tag: "loadError", value: error }
  }
  static pickedImages(files) /*:Message*/ {
    return { tag: "pickedImages", value: files }
  }
  static updateAvatar(url) {
    return { tag: "updateAvatar", value: url }
  }
}

const Decode = {
  pickImage: {
    decode() {
      return {
        preventDefault: true,
        message: { tag: "pickImage" }
      }
    }
  },
  dragStart: {
    decode(event) {
      return {
        message: { tag: "showDragZone" },
        preventDefault: true,
        stopPropagation: true
      }
    }
  },
  dragOver: {
    decode(event) {
      return {
        message: { tag: "showDragZone" },
        preventDefault: true,
        stopPropagation: true
      }
    }
  },
  dragEnter: {
    decode(event) {
      return {
        message: { tag: "showDragZone" },
        preventDefault: true,
        stopPropagation: true
      }
    }
  },
  dragEnd: {
    decode(event) {
      return {
        message: { tag: "hideDragZone" },
        preventDefault: true,
        stopPropagation: true
      }
    }
  },
  dragLeave: {
    decode(event) {
      return {
        message: { tag: "hideDragZone" },
        preventDefault: true,
        stopPropagation: true
      }
    }
  },
  drop: {
    decode(event) {
      const files =
        event.dataTransfer instanceof top.DataTransfer
          ? event.dataTransfer.files
          : null
      const message = files
        ? { tag: "dropFiles", value: files }
        : { tag: "hideDragZone" }

      return {
        message,
        preventDefault: true,
        stopPropagation: true
      }
    }
  },
  avatarLoaded: {
    decode(event) {
      return {
        message: {
          tag: "avatarLoaded",
          value: getAttribute(event.target, "src")
        }
      }
    }
  }
}

const getAttribute = (target /*:EventTarget*/, name /*:string*/) =>
  target instanceof top.Node ? target.getAttribute(name) : ""
