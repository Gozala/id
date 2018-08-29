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
  type
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
        state,
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
        Data.updateDragZoneState(state, false),
        fx(ProfileFX.createObjectURL(message.value[0]), Inbox.updateAvatar)
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

const viewProfile = (
  status,
  profileID,
  name,
  about,
  avatarURL,
  editable
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
          input([
            id(PICKER_ID),
            className("avatar-upload"),
            type("file"),
            on("change", Decoder.pickedImages),
            accept("image/*")
          ]),
          h3(
            [
              tabIndex(2),
              className("name field"),
              placeholder("Name"),
              contentEditable(editable)
            ],
            [text(name)]
          ),
          p(
            [
              tabIndex(3),
              className("about field"),
              placeholder("About"),
              contentEditable(editable)
            ],
            [text(about)]
          ),
          button([className("button")], [text("Save")])
        ]
      )
    ]
  )

const viewLoadedProfile = (
  showDragZone,
  data,
  editable = true
) /*:Node<Message>*/ =>
  viewProfile(
    showDragZone ? "dragover" : "",
    data.id,
    data.name,
    data.about,
    data.avatarURL,
    editable
  )

const viewLoadingProfile = ({ id }) =>
  viewProfile("loading", id, "", "", "", false)

const viewFailedProfile = ({ id, error }) =>
  viewProfile("failure", id, "", error.toString(), "", false)

const viewNotFound = state =>
  main(
    [],
    [
      h3([], [text("Unknown state encountered")]),
      pre([], [text(JSON.stringify(state, null, 2))])
    ]
  )
