// @flow strict

/*::
import * as Index from "../Index.js"
import * as Profile from "../Profile.js"

export type Route =
  | { tag: "navigate", value: URL }
  | { tag: "load", value: URL }
  | { tag: "navigated", value: URL }

export type Message =
  | { tag: "router", value: Route }
  | { tag: "index", value: Index.Message }
  | { tag: "profile", value: Profile.Message }
*/

export const profile = (message /*:Profile.Message*/) /*:Message*/ => ({
  tag: "profile",
  value: message
})

export const index = (message /*:Index.Message*/) /*:Message*/ => ({
  tag: "index",
  value: message
})

export const router = (message /*:Route*/) /*:Message*/ => ({
  tag: "router",
  value: message
})

export const onInternalURLRequest = (value /*:URL*/) =>
  router({ tag: "navigate", value })

export const onExternalURLRequest = (value /*:URL*/) =>
  router({ tag: "load", value })

export const onURLChange = (value /*:URL*/) =>
  router({ tag: "navigated", value })
