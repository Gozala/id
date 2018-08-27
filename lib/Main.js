// @flow strict

import { spawn } from "./elm/application.js"
import { navigate, load } from "./elm/navigation.js"
import { nofx, fx, batch } from "./elm/fx.js"
import { text, h3, pre, main, doc, body } from "./elm/element.js"
import * as Index from "./Page/Index.js"
import * as Profile from "./Page/Profile.js"
import { never } from "./elm/basics.js"

/*::
import type {Node, Doc} from "./elm/virtual-dom.js"
import type {Effect} from "./elm/fx.js"
type Inbox =
  | { tag:"Self", value:Message }
  | { tag:"Index", value:Index.Message }
  | { tag:"Profile", value:Profile.Message }

type Message =
  | { type:"navigate", url:URL }
  | { type:"load", url:URL }
  | { type:"navigated", url:URL }

type Model =
  | { tag:"Index", value:Index.Model }
  | { tag: "Profile", value:Profile.Model }
*/

export const onInternalURLRequest = (url /*:URL*/) =>
  Route.Self({ type: "navigate", url })

export const onExternalURLRequest = (url /*:URL*/) =>
  Route.Self({ type: "load", url })

export const onURLChange = (url /*:URL*/) =>
  Route.Self({ type: "navigated", url })

export const init = (options /*:Object*/, url /*:URL*/) => {
  const [, id] = url.pathname.split("/")
  if (id) {
    const [profile, fx] = Profile.load(id)
    return [Page.Profile(profile), fx.map(Route.Profile)]
  } else {
    const [index, fx] = Index.init(options)
    return [Page.Index(index), fx.map(Route.Index)]
  }
}

export const update = (message /*:Inbox*/, state /*:Model*/) => {
  switch (message.tag) {
    case "Index": {
      if (state.tag === "Index") {
        const [index, fx] = Index.update(message.value, state.value)
        return [Page.Index(index), fx.map(Route.Index)]
      } else {
        return [state, nofx]
      }
    }
    case "Profile": {
      if (state.tag === "Profile") {
        const [profile, fx] = Profile.update(message.value, state.value)
        return [Page.Profile(profile), fx.map(Route.Profile)]
      } else {
        return [state, nofx]
      }
    }
    case "Self": {
      return receive(message.value, state)
    }
    default: {
      return never(message)
    }
  }
}

const receive = (message, state) => {
  switch (message.type) {
    case "navigate": {
      return [state, fx(navigate(message.url))]
    }
    case "navigated": {
      const [, id] = message.url.pathname.split("/")
      if (id) {
        const [profile, fx] = Profile.load(id)
        return [Page.Profile(profile), fx.map(Route.Profile)]
      } else {
        const [index, fx] = Index.init()
        return [Page.Index(index), fx.map(Route.Index)]
      }
    }
    case "load": {
      return [state, fx(load(message.url))]
    }
    case "none": {
      return [state, nofx]
    }
    default: {
      throw Error(`Unknown message ${message.tag}`)
    }
  }
}

class Page {
  static Profile(page) {
    return { tag: "Profile", value: page }
  }
  static Index(page) {
    return { tag: "Index", value: page }
  }
}

class Route {
  static Profile(value /*:Profile.Message*/) /*:Inbox*/ {
    return { tag: "Profile", value }
  }
  static Index(value /*:Index.Message*/) /*:Inbox*/ {
    return { tag: "Index", value }
  }
  static Self(value /*:Message*/) /*:Inbox*/ {
    return { tag: "Self", value }
  }
}

const view = (state /*:Model*/) => {
  switch (state.tag) {
    case "Index": {
      return Index.view(state.value).map(Route.Index)
    }
    case "Profile": {
      return Profile.view(state.value).map(Route.Profile)
    }
    default: {
      return viewNotFound(state)
    }
  }
}

const viewNotFound = state =>
  doc(
    "Page not found",
    body(
      [],
      [
        main(
          [],
          [
            h3([], [text("Unknown state encountered")]),
            pre([], [text(JSON.stringify(state, null, 2))])
          ]
        )
      ]
    )
  )

if (location.protocol === "dat:") {
  window.top.main = spawn(
    {
      onExternalURLRequest,
      onInternalURLRequest,
      onURLChange,
      init,
      update,
      view
    },
    window.top.main,
    window.top.document
  )
}
