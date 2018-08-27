// @flow strict

import { nothing } from "./basics.js"

/*::
import type { Task } from "./fx"
*/

const STATE = {}
const NAV = { type: "navigate" }

const { history, location } = window.top
const dispatch = _ => {
  if (window.top.onnavigate) {
    window.top.onnavigate.handleEvent(NAV)
  }
}

export const navigate = (url /*:URL*/) /*:() => Promise<void>*/ => async () => {
  if (location.href != url.href) {
    dispatch(history.pushState(STATE, "", url))
  }
}

export const replaceURL = (url /*:URL*/) /*:Task<void>*/ => async () => {
  if (location.href != url.href) {
    dispatch(history.replaceState(STATE, "", url))
  }
}

export const back = (n /*:number*/) /*:Task<void>*/ => async () => {
  window.top.history.go(-1 * n)
}

export const forward = (n /*:number*/) /*:Task<void>*/ => async () => {
  window.top.history.go(n)
}

export const load = (url /*:URL*/) /*:Task<void>*/ => async () => {
  try {
    window.top.location = url
  } catch (error) {
    window.top.location.reload(false)
  }
}

export const reload /*:Task<void>*/ = async () => {
  window.top.location.reload(false)
}

export const reloadAndSkipCache /*:Task<void>*/ = async () => {
  window.top.location.reload(true)
}
