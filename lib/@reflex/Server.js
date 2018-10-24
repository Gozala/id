// @flow strict

import { nothing } from "../@reflex/basics.js"
import { spawn, exit } from "./Actor.js"

/*::
import type {Actor, Effect} from "./Actor.js"
*/

export { spawn, exit }

class Events /*::<Event>*/ {
  /*::
  target:Node
  type:string
  capture:boolean
  listener:?EventListener
  handleEvent:any => mixed
  deliver:?(IteratorResult<Event, void>) => void
  */
  constructor(
    target /*:Node*/,
    type /*:string*/,
    capture /*:boolean*/ = false
  ) {
    this.target = target
    this.type = type
    this.capture = capture
    this.listener = null
  }
  next() /*:Promise<IteratorResult<Event, void>>*/ {
    if (!this.listener) {
      this.listener = this
      this.target.addEventListener(this.type, this.listener, this.capture)
    }

    return new Promise(deliver => (this.deliver = deliver))
  }
  exit() {
    const { type, target, capture, listener } = this
    if (listener) {
      target.removeEventListener(type, listener, capture)
      this.listener = null
    }
    if (this.deliver) {
      this.deliver({ done: true, value: undefined })
      this.deliver = null
    }
  }
  handleEvent(value /*:Event*/) {
    if (this.deliver) {
      this.deliver({ done: false, value })
      this.deliver = null
    }
  }
}

const keyboard = (type /*:string*/) => /*::<a>*/ (
  toMessage /*:KeyboardEvent => ?a*/,
  onSpawn /*:Actor<empty> => ?a*/ = nothing,
  onExit /*:?mixed => ?a*/ = nothing
) /*:Effect<a>*/ =>
  spawn(
    async self => {
      const events = new Events(document, type, false)
      while (self.result == null) {
        const next = await events.next()
        if (next.done) {
          break
        } else {
          const message = toMessage(next.value)
          if (message) {
            self.send(message)
          }
        }
      }
      events.exit()
    },
    onSpawn,
    onExit
  )

export const presses = keyboard("keypress")
export const downs = keyboard("keydown")
export const ups = keyboard("keyup")
