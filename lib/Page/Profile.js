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
  label,
  p,
  basefont,
  button
} from "../elm/element.js"
import {
  src,
  alt,
  href,
  className,
  For,
  id,
  accept,
  placeholder,
  contentEditable,
  tabIndex,
  type,
  textContent
} from "../elm/attribute.js"
import { navigate } from "../elm/navigation.js"
import { fx, nofx } from "../elm/fx.js"
import { storage } from "../async-local-storage.js"
import { never } from "../elm/basics.js"
import * as ProfileFX from "../Request/Profile.js"
import * as Data from "../Data/Profile.js"
import * as Inbox from "../Inbox/Profile.js"
import * as Decoder from "../Decoder/Profile.js"

import { node } from "../elm/virtual-dom.js"
/*::
import type { Doc, Node } from "../elm/virtual-dom.js"
export type Profile = Data.Profile
export type Model = Data.Model
export type ProfileData = Data.ProfileData

export type Message = Inbox.Message
*/

const PICKER_ID = "profile-avatar-upload"

export const load = (id /*:string*/) => {
  return [
    Data.init(id),
    fx(ProfileFX.loadProfile(id), Inbox.load, Inbox.loadError)
  ]
}

export const init = (data /*:ProfileData*/) => {
  const state = Data.loaded(data)
  return [state, nofx]
}

export const update = (message /*:Message*/, state /*:Profile*/) => {
  switch (message.tag) {
    case "load": {
      return [Data.decode(state.id, message.value), nofx]
    }
    case "loadError": {
      return [Data.failed(state.id, message.value), nofx]
    }
    case "pickedImages": {
      return [
        Data.changeAvatar(state, message.value[0]),
        fx(ProfileFX.createObjectURL(message.value[0]), Inbox.updateAvatar)
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
        Data.changeAvatar(state, message.value[0]),
        fx(ProfileFX.createObjectURL(message.value[0]), Inbox.updateAvatar)
      ]
    }
    case "avatarLoaded": {
      return [state, fx(ProfileFX.revokeObjectURL(message.value))]
    }
    case "updateAvatar": {
      return [Data.updateAvatar(state, message.value), nofx]
    }
    case "editName": {
      return [Data.editName(state, message.value), nofx]
    }
    case "editAbout": {
      return [Data.editAbout(state, message.value), nofx]
    }
    case "saveChanges": {
      const changes = Data.edits(state)
      if (changes) {
        return [
          state,
          fx(ProfileFX.saveChanges(state.id, changes), Inbox.savedChanges)
        ]
      } else {
        return [state, nofx]
      }
    }
    case "savedChanges": {
      return [Data.decode(state.id, message.value), nofx]
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
      return page(`${state.edit.name}`, viewLoadedProfile(state))
    }
    case "FailedProfile": {
      return page("Failure", viewFailedProfile(state))
    }
    default: {
      return page("Not Found", viewNotFound(state))
    }
  }
}

const viewProfile = (
  status,
  profileID,
  name,
  about,
  avatarURL,
  isEditable = false
) /*:Node<Message>*/ =>
  main(
    [
      className(`profile layer ${status}`),
      on("dragstart", Decoder.dragStart),
      on("dragenter", Decoder.dragEnter),
      on("dragover", Decoder.dragOver),
      on("dragend", Decoder.dragEnd),
      on("dragleave", Decoder.dragLeave),
      on("drop", Decoder.drop)
    ],
    [
      article(
        [className("card")],
        [
          input([
            id(PICKER_ID),
            className("avatar-upload"),
            type("file"),
            on("change", Decoder.pickedImages),
            accept("image/*")
          ]),
          label(
            [For(PICKER_ID), className("picker"), tabIndex(1)],
            [
              img([
                className("avatar"),
                alt(),
                src(new URL(avatarURL, `dat://${profileID}/`).href),
                on("load", Decoder.avatarLoaded)
              ])
            ]
          ),
          h3([
            tabIndex(2),
            className("name field"),
            placeholder("Name"),
            contentEditable(isEditable),
            on("input", Decoder.editName),
            textContent(name)
          ]),
          p([
            tabIndex(3),
            className("about field"),
            placeholder("About"),
            contentEditable(isEditable),
            on("input", Decoder.editAbout),
            textContent(about)
          ]),
          button(
            [className("save button"), on("click", Decoder.saveChanges)],
            [text("Save")]
          )
        ]
      )
    ]
  )

const viewLoadedProfile = (state, editable = true) /*:Node<Message>*/ =>
  viewProfile(
    `${state.showDragZone ? "dragover" : ""} ${
      Data.isEdited(state) ? "edited" : ""
    }`,
    state.id,
    state.edit.name,
    state.edit.about,
    state.edit.avatarURL,
    editable
  )

const viewLoadingProfile = ({ id }) => viewProfile("loading", id, "", "", "")

const viewFailedProfile = ({ id, error }) =>
  viewProfile("failure", id, "", error.toString(), "")

const viewNotFound = state =>
  main(
    [],
    [
      h3([], [text("Unknown state encountered")]),
      pre([], [text(JSON.stringify(state, null, 2))])
    ]
  )
