// @noflow strict

import { always } from "../../@reflex/basics.js"
import { profile } from "./Inbox.js"

type Claim = { tag: "github", value: { id: string, code: string } }

type Route =
  | { tag: "index", value: null }
  | { tag: "profile", value: string }
  | { tag: "claim", value: Claim }
  | { tag: "unknown", value: string }

const index = always({ tag: "index", value: null })

export const parse = (url /*:URL*/) /*:Route*/ => {
  if (url.pathname === "/") {
    return index()
  } else {
    if (url.pathname.startsWith("/claim/")) {
      const value = claim(url)
      if (value) {
        return { tag: "claim", value }
      } else {
        return unknown(url)
      }
    } else {
      return profile(url)
    }
  }
}

const claim = url => {
  const [, , provider] = url.pathname.split("/")
  switch (provider) {
    case "github": {
      return { tag: "github", value: {} }
    }
  }
}
