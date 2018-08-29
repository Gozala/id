// @flow strict

import { always } from "../elm/basics.js"

/*::
export type Message =
  | { tag: "pickedImages", value: FileList }
  | { tag: "load", value: string }
  | { tag: "loadError", value: Error }
  | { tag: "showDragZone" }
  | { tag: "hideDragZone" }
  | { tag: "dropFiles", value: FileList }
  | { tag: "updateAvatar", value: string }
  | { tag: "avatarLoaded", value: string }
*/

export const load = (input /*:string*/) /*:Message*/ => ({
  tag: "load",
  value: input
})

export const loadError = (error /*:Error*/) /*:Message*/ => ({
  tag: "loadError",
  value: error
})

export const pickedImages = (files /*:FileList*/) /*:Message*/ => ({
  tag: "pickedImages",
  value: files
})

export const updateAvatar = (url /*:string*/) => ({
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
