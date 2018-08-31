// @flow strict

import { always } from "../elm/basics.js"

/*::
import type {ProfileData} from "../Data/Profile"

export type Message =
  | { tag: "pickedImages", value: FileList }
  | { tag: "load", value: Object }
  | { tag: "loadError", value: Error }
  | { tag: "showDragZone" }
  | { tag: "hideDragZone" }
  | { tag: "dropFiles", value: FileList }
  | { tag: "updateAvatar", value: string }
  | { tag: "avatarLoaded", value: string }
  | { tag: "editName", value: string }
  | { tag: "editAbout", value: string }
  | { tag: "saveChanges" }
  | { tag: "savedChanges", value:Object }
*/

export const load = (value /*:Object*/) /*:Message*/ => ({
  tag: "load",
  value
})

export const loadError = (error /*:Error*/) /*:Message*/ => ({
  tag: "loadError",
  value: error
})

export const pickedImages = (files /*:FileList*/) /*:Message*/ => ({
  tag: "pickedImages",
  value: files
})

export const updateAvatar = (url /*:string*/) /*:Message*/ => ({
  tag: "updateAvatar",
  value: url
})

export const showDragZone = always({ tag: "showDragZone" })
export const hideDragZone = always({ tag: "hideDragZone" })
export const dropFiles = (files /*:FileList*/) /*:Message*/ => ({
  tag: "dropFiles",
  value: files
})

export const avatarLoaded = (value /*:string*/) => ({
  tag: "avatarLoaded",
  value
})

export const editName = (value /*:string*/) => ({
  tag: "editName",
  value
})

export const editAbout = (value /*:string*/) => ({
  tag: "editAbout",
  value
})

export const saveChanges = always({ tag: "saveChanges" })
export const savedChanges = (value /*:Object*/) /*:Message*/ => ({
  tag: "savedChanges",
  value
})
