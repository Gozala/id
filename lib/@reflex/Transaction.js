// @flow strict

import type { Effect } from "./fx.js"
import { batch, nofx } from "./fx.js"

class Transaction<message, state> {
  state: state
  effect: Effect<message>
  constructor(model: state, fx: Effect<message>) {
    this.state = model
    this.effect = fx
  }
  within<innerMessage, innerState>(
    updateInner: (
      innerMessage,
      innerState
    ) => [innerState, Effect<innerMessage>],
    payload: innerMessage,
    getInner: state => innerState,
    setInner: (state, innerState) => state,
    tagInner: innerMessage => message
  ): Transaction<message, state> {
    const [inner, fx] = updateInner(payload, getInner(this.state))
    return new Transaction(
      setInner(this.state, inner),
      batch(this.effect, fx.map(tagInner))
    )
  }
  to(model: state): Transaction<message, state> {
    return new Transaction(model, nofx)
  }
}

class Transactor<message, state, innerState, innerMessage> {
  update: (innerMessage, innerState) => [innerState, Effect<innerMessage>]
  get: state => innerState
  set: (state, innerState) => state
  tag: innerMessage => message
  constructor(
    update: (innerMessage, innerState) => [innerState, Effect<innerMessage>],
    get: state => innerState,
    set: (state, innerState) => state,
    tag: innerMessage => message
  ) {
    this.update = update
    this.get = get
    this.set = set
    this.tag = tag
  }
  step(
    transaction: Transaction<message, state>,
    payload: innerMessage
  ): Transaction<message, state> {
    return transaction.within(
      this.update,
      payload,
      this.get,
      this.set,
      this.tag
    )
  }
}
