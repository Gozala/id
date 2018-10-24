// @flow strict

import { nofx, fx, batch } from "../@reflex/fx.js"
import { text, h3, pre, main, doc, body } from "../@reflex/element.js"
import * as Index from "./Index.js"
import * as Profile from "./Profile.js"
import * as Effect from "./Main/Effect.js"
import { never } from "../@reflex/basics.js"
import * as Data from "./Main/Data.js"
import * as Inbox from "./Main/Inbox.js"

/*::
export type Message = Inbox.Message
export type Model = Data.Model
*/

export const { onInternalURLRequest, onExternalURLRequest, onURLChange } = Inbox

export const init = (options /*:Object*/, url /*:URL*/) => {
  const [, id] = url.pathname.split("/")
  if (id) {
    const [profile, fx] = Profile.load(id)
    return [Data.profile(profile), fx.map(Inbox.profile)]
  } else {
    const [index, fx] = Index.init(options)
    return [Data.index(index), fx.map(Inbox.index)]
  }
}

export const update = (message /*:Message*/, state /*:Model*/) => {
  switch (message.tag) {
    case "index": {
      if (state.tag === "Index") {
        const [index, fx] = Index.update(message.value, state.value)
        return [Data.index(index), fx.map(Inbox.index)]
      } else {
        return [state, nofx]
      }
    }
    case "profile": {
      if (state.tag === "Profile") {
        const [profile, fx] = Profile.update(message.value, state.value)
        return [Data.profile(profile), fx.map(Inbox.profile)]
      } else {
        return [state, nofx]
      }
    }
    case "router": {
      return route(message.value, state)
    }
    default: {
      return never(message)
    }
  }
}

const route = (message, state) => {
  switch (message.tag) {
    case "navigate": {
      return [state, fx(Effect.navigate(message.value))]
    }
    case "navigated": {
      const [, id] = message.value.pathname.split("/")
      if (id) {
        const [profile, fx] = Profile.load(id)
        return [Data.profile(profile), fx.map(Inbox.profile)]
      } else {
        const [index, fx] = Index.init()
        return [Data.index(index), fx.map(Inbox.index)]
      }
    }
    case "load": {
      return [state, fx(Effect.load(message.value))]
    }
    default: {
      return never(message)
    }
  }
}

export const view = (state /*:Model*/) => {
  switch (state.tag) {
    case "Index": {
      return Index.view(state.value).map(Inbox.index)
    }
    case "Profile": {
      return Profile.view(state.value).map(Inbox.profile)
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
