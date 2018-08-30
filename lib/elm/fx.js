// @flow strict

import { nothing } from "./basics.js"

/*::
import type { IO } from "./Widget"
import type { Task } from "./Future"

export interface Port<a> {
  send(a):mixed
}

export interface Effect <a> extends IO<a> {
  map <b>(a => b):Effect<b>;
}
*/

const none /*:Effect<any>*/ = {
  perform(main) {},
  map(f) {
    return this
  }
}

class FX /*::<a, value>*/ {
  /*::
  task:Task<value>
  onOk: value => ?a
  onError: Error => ?a
  */
  constructor(
    task /*:Task<value>*/,
    onOk /*: value => ?a*/,
    onError /*: Error => ?a*/
  ) {
    this.task = task
    this.onOk = onOk
    this.onError = onError
  }
  async execute(main /*:Port<a>*/) {
    try {
      const value = await this.task.perform()
      const message = this.onOk(value)
      if (message != null) {
        main.send(message)
      }
    } catch (error) {
      const message = this.onError(error)
      if (message != null) {
        main.send(message)
      }
    }
  }
  perform(main /*:Port<a>*/) {
    this.execute(main)
  }
  map /*::<b>*/(tag /*:a => b*/) /*:Effect<b>*/ {
    return new Tagged(this, tag)
  }
}

class Batch /*::<a>*/ {
  /*::
  effects:Effect<a>[]
  */
  constructor(effects /*:Effect<a>[]*/) {
    this.effects = effects
  }
  perform(main /*:Port<a>*/) {
    for (const fx of this.effects) {
      fx.perform(main)
    }
  }
  map /*::<b>*/(tag /*:a => b*/) /*:Effect<b>*/ {
    return new Tagged(this, tag)
  }
}

class Tagged /*::<a, b>*/ {
  /*::
  fx: Effect<a>
  tag: a => b
  port:Port<b>
  */
  constructor(fx /*:Effect<a>*/, tag /*:a => b*/) {
    this.fx = fx
    this.tag = tag
  }
  perform(main /*:Port<b>*/) {
    this.port = main
    this.fx.perform(this)
  }
  send(message /*:a*/) {
    return this.port.send(this.tag(message))
  }
  map /*::<c>*/(tag /*:b => c*/) /*:Effect<c>*/ {
    return new Tagged(this, tag)
  }
}

export const nofx = none

export const fx = /*::<value, message>*/ (
  task /*:Task<value>*/,
  ok /*:value => ?message*/ = nothing,
  error /*:Error => ?message*/ = warn
) /*:Effect<message>*/ => new FX(task, ok, error)

export const batch = /*::<a>*/ (...fx /*:Effect<a>[]*/) /*:Effect<a>*/ =>
  new Batch(fx)

const warn = (error /*:Error*/) /*:void*/ => {
  console.warn("Task failed but error was not handled", error)
}
