// @flow strict

export const identity = /*::<a>*/ (value /*:a*/) /*:a*/ => value
export const always = /*::<a>*/ (value /*:a*/) /*:<b>(b) => a*/ => /*::<b>*/ (
  _ /*:b*/
) /*:a*/ => value
export const never = /*::<a>*/ (value /*:empty*/) /*:a*/ => {
  console.error(`value passed to never`, value)
  throw TypeError(
    `never was supposed to be unreachable but it was called with ${value}`
  )
}
export const nothing = /*::<a>*/ (_ /*:a*/) /*:void*/ => void _
