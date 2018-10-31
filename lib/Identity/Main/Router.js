// @flow strict

import { always } from "../../@reflex/basics.js"
import { profile } from "./Inbox.js"
import * as Router from "../../router.flow/Router.js"

type Claim = { tag: "github", value: { id: string, code: string } }

type Route =
  | { tag: "index", value: null }
  | { tag: "profile", value: string }
  | { tag: "claim", value: Claim }
  | { tag: "unknown", value: string }

const index = always({ tag: "index", value: null })

class RouteMatch<message, a> {
  route: Router.Route<a>
  toMessage: a => message
  constructor(route: Router.Route<a>, toMessage: a => message) {
    this.route = route
    this.toMessage = toMessage
  }
  match(url: URL): ?message {
    const result = this.route.parsePath(url)
    if (result) {
      return this.toMessage(result)
    }
  }
}

interface URLMatcher<a> {
  match(URL): ?a;
}

class RouteMatcher<message> {
  options: URLMatcher<message>[]
  match<a>(
    route: Router.Route<a>,
    toMessage: a => message
  ) /*:RouteMatcher<message>*/ {
    this.options.push(new RouteMatch(route, toMessage))
    return this
  }
  select(url: URL) /*:?message*/ {
    for (const option of this.options) {
      const result = option.match(url)
      if (result) {
        return result
      }
    }
  }
}

const router = new RouteMatcher()
  .match(Router.route`/`, index)
  .match(Router.route`/`(Router.String)`/`, ([id]) => ({
    tag: "profile",
    value: id
  }))
  .match(
    Router.route`/claim/github/`
      .query("code", Router.String)
      .query("state", Router.String),
    ([code, id]) => ({
      tag: "claim",
      value: { tag: "github", value: { id, code } }
    })
  )

// export const parse = (url /*:URL*/) /*:Route*/ => {
//   if (url.pathname === "/") {
//     return index()
//   } else {
//     if (url.pathname.startsWith("/claim/")) {
//       const value = claim(url)
//       if (value) {
//         return { tag: "claim", value }
//       } else {
//         return unknown(url)
//       }
//     } else {
//       return profile(url)
//     }
//   }
// }

// const claim = url => {
//   const [, , provider] = url.pathname.split("/")
//   switch (provider) {
//     case "github": {
//       return { tag: "github", value: {} }
//     }
//   }
// }
