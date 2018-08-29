// @flow strict

import { always } from "../elm/basics.js"

/*::
export type Message =
  | { tag: "changeName", value:string }
  | { tag: "changeAbout", value:string }
  | { tag: "changeAvatar", value:?File }
  | { tag: "save" }
*/

export const changeName = (value /*:string*/) /*:Message*/ => ({
  tag: "changeName",
  value
})

export const changeAbout = (value /*:string*/) /*:Message*/ => ({
  tag: "changeAbout",
  value
})

export const changeAvatar = (value /*:?File*/) /*:Message*/ => ({
  tag: "changeAvatar",
  value
})

export const save = always({ tag: "save" })
