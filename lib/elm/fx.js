// @flow strict

/*::
import type { IO } from "./Widget"

export type Task <a> = () => Promise<?a>

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

class FX /*::<a>*/ {
  /*::
  task:Task<a>
  */
  constructor(task /*:Task<a>*/) {
    this.task = task
  }
  async execute(main /*:Port<a>*/) {
    const message = await this.task()
    if (message != null) {
      main.send(message)
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

export const fx = /*::<a>*/ (task /*:Task<a>*/) /*:Effect<a>*/ => new FX(task)

export const batch = /*::<a>*/ (...fx /*:Effect<a>[]*/) /*:Effect<a>*/ =>
  new Batch(fx)
