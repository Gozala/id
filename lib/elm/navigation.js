// @flow strict

import { nothing } from "./basics.js"

const STATE = {}
const NAV = { type: "navigate" }

const { history, location } = window.top
const dispatch = _ => {
  if (window.top.onnavigate) {
    window.top.onnavigate.handleEvent(NAV)
  }
}

export const navigate = /*::<a>*/ (
  url /*:URL*/,
  toMessage /*:() => ?a*/ = nothing
) /*:() => Promise<?a>*/ => async () => {
  if (location.href != url.href) {
    dispatch(history.pushState(STATE, "", url))
  }
  return toMessage()
}

export const replaceURL = /*::<a>*/ (
  url /*:URL*/,
  toMessage /*:() => ?a*/ = nothing
) /*:() => Promise<?a>*/ => async () => {
  if (location.href != url.href) {
    dispatch(history.replaceState(STATE, "", url))
  }
  return toMessage()
}

export const back = /*::<a>*/ (
  n /*:number*/,
  toMessage /*:() => ?a*/ = nothing
) /*:() => Promise<?a>*/ => async () => {
  window.top.history.go(-1 * n)
  return toMessage()
}

export const forward = /*::<a>*/ (
  n /*:number*/,
  toMessage /*:() => ?a*/ = nothing
) /*:() => Promise<?a>*/ => async () => {
  window.top.history.go(n)
  return toMessage()
}

export const load = /*::<a>*/ (
  url /*:URL*/,
  toMessage /*:() => ?a*/ = nothing
) /*:() => Promise<?a>*/ => async () => {
  try {
    window.top.location = url
  } catch (error) {
    window.top.location.reload(false)
  }
  return toMessage()
}

export const reload = /*::<a>*/ (
  message /*:a*/,
  toMessage /*:() => ?a*/ = nothing
) /*:() => Promise<?a>*/ => async () => {
  window.top.location.reload(false)
  return toMessage()
}

export const reloadAndSkipCache = /*::<a>*/ (
  message /*:a*/,
  toMessage /*:() => ?a*/ = nothing
) /*:() => Promise<?a>*/ => async () => {
  window.top.location.reload(true)
  return toMessage()
}
