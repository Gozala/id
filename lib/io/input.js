// @flow strict

import { future } from "../@reflex/Future.js"

export const focus = future(async (id /*:string*/) => {
  const element = document.getElementById(id)
  if (element != null) {
    element.focus()
  } else {
    throw Error(`Element with #${id} not found`)
  }
})

export const blur = future(async (id /*:string*/) => {
  const element = document.getElementById(id)
  if (element != null) {
    element.blur()
  } else {
    throw Error(`Element with #${id} not found`)
  }
})

/*::
export type Direction = 'backward'|'forward'
*/
export const setSelection = future(async (
  id /*:string*/,
  start /*:number*/,
  end /*:number*/,
  direction /*:Direction*/ = "backward"
) /*:Promise<void>*/ => {
  const element = document.getElementById(id)
  if (element instanceof HTMLInputElement) {
    const value = element.value
    const length = value.length
    const selectionStart = Math.min(start, length)
    const selectionEnd = Math.min(end, length)

    const isUpdateRequired =
      element.selectionStart !== selectionStart ||
      element.selectionEnd !== selectionEnd ||
      element.selectionDirection !== direction

    if (isUpdateRequired) {
      element.setSelectionRange(selectionStart, selectionEnd, direction)
    }
  } else {
    throw Error(`Element with #${id} not found`)
  }
})

export const setValue = future(async (
  id /*:string*/,
  value /*:string*/
) /*:Promise<void>*/ => {
  const element = document.getElementById(id)
  if (element instanceof HTMLInputElement) {
    if (value !== element.value) {
      const { length } = value
      const { selectionDirection, selectionStart, selectionEnd } = element
      const start = Math.min(length, selectionStart)
      const end = Math.min(length, selectionEnd)
      element.value = value
      element.setSelectionRange(start, end, selectionDirection)
    }
  } else {
    throw Error(`Element with #${id} not found`)
  }
})
