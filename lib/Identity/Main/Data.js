// @flow strict

/*::
import * as Index from "../Index.js"
import * as Profile from "../Profile.js"

export type Model =
  | { tag: "Index", value:Index.Model }
  | { tag: "Profile", value:Profile.Model }
*/

export const profile = (value /*:Profile.Model*/) /*:Model*/ => ({
  tag: "Profile",
  value
})

export const index = (value /*:Index.Model*/) /*:Model*/ => ({
  tag: "Index",
  value
})
