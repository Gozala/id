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
  ul,
  li,
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
      return page("Loading...", viewLoadingProfile())
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
  name = "",
  about = "",
  avatarURL = "",
  isEditable = false
) /*:Node<Message>*/ => {
  const view = isEditable ? viewOwnProfile : viewOtherProfile
  return view(status, viewCard(name, about, avatarURL, isEditable))
}

const viewOwnProfile = (status, card) =>
  main(
    [
      className(`own profile layer ${status}`),
      on("dragstart", Decoder.dragStart),
      on("dragenter", Decoder.dragEnter),
      on("dragover", Decoder.dragOver),
      on("dragend", Decoder.dragEnd),
      on("dragleave", Decoder.dragLeave),
      on("drop", Decoder.drop)
    ],
    [card]
  )

const viewOtherProfile = (status, card) =>
  main([className(`profile layer ${status}`)], [card])

const viewCard = (name, about, avatarURL, isEditable) =>
  article(
    [className("card")],
    [
      viewAvatar(avatarURL, isEditable),
      viewName(name, isEditable),
      viewAbout(about, isEditable),
      viewProofs(),
      button(
        [className("save button"), on("click", Decoder.saveChanges)],
        [text("Save")]
      )
    ]
  )

const viewAvatar = (avatarURL, isEditable) =>
  label(
    [
      For(isEditable ? PICKER_ID : ""),
      className(`picker ${isEditable ? "editable" : ""}`),
      tabIndex(1)
    ],
    [
      input([
        id(PICKER_ID),
        className("avatar-upload"),
        type("file"),
        on("change", Decoder.pickedImages),
        accept("image/*")
      ]),
      img([
        className("avatar"),
        alt(),
        src(avatarURL),
        on("load", Decoder.avatarLoaded)
      ])
    ]
  )

const viewName = (name, isEditable) =>
  h3([
    tabIndex(2),
    className("name field"),
    placeholder("Name"),
    contentEditable(isEditable),
    on("input", Decoder.editName),
    textContent(name)
  ])

const viewAbout = (about, isEditable) =>
  p([
    tabIndex(3),
    className("about field"),
    placeholder("About"),
    contentEditable(isEditable),
    on("input", Decoder.editAbout),
    textContent(about)
  ])

const viewProofs = () =>
  ul(
    [className("identities proofs")],
    [
      li([className("identity pgp")], []),
      li([className("identity github")], []),
      li([className("identity twitter")], []),
      li([className("identity fritter")], []),
      li([className("identity reddit")], []),
      li([className("identity web")], []),
      li([className("identity bitcoin")], []),
      li([className("identity dat")], [])
    ]
  )

const viewLoadedProfile = (state) /*:Node<Message>*/ =>
  viewProfile(
    `${state.showDragZone ? "dragover" : ""} ${
      Data.isEdited(state) ? "edited" : ""
    }`,
    state.edit.name,
    state.edit.about,
    new URL(state.edit.avatarURL, `dat://${state.id}/`).href,
    state.data.isOwner
  )

const viewLoadingProfile = () => viewProfile("loading")

const viewFailedProfile = ({ error }) =>
  viewProfile("failure", "", error.toString())

const viewNotFound = state =>
  main(
    [],
    [
      h3([], [text("Unknown state encountered")]),
      pre([], [text(JSON.stringify(state, null, 2))])
    ]
  )
