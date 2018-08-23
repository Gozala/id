// @flow strict

/*::
export type Task <a> = () => Promise<?a>

export interface Port<a> {
  send(a):mixed
}

export interface Effect <a> {
  perform(Port<a>):mixed
}

export type Transaction<message, model> = {
  state:model;
  fx:Effect<message>;
}
*/

const none /*:Effect<any>*/ = {
  perform(main) {}
}

class Unit /*::<a> implements Effect<a>*/ {
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
}

class Batch /*::<a> implements Effect<a>*/ {
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
}

export const nofx = /*::<model, a>*/ (
  state /*:model*/
) /*:Transaction<a, model>*/ => ({
  state,
  fx: none
})

export const fx = /*::<model, a>*/ (
  state /*:model*/,
  task /*:Task<a>*/
) /*:Transaction<a, model>*/ => ({ state, fx: new Unit(task) })

export const batch = /*::<model, a>*/ (
  state /*:model*/,
  ...fx /*:Effect<a>[]*/
) /*:Transaction<a, model>*/ => ({ state, fx: new Batch(fx) })
