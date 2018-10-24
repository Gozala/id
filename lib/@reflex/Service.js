// @flow strict

import { nothing } from "./basics.js"
import { Tagged } from "./fx.js"

/*::
import type { Main, Port, ThreadID, Thread } from "./widget.js"
import type { Effect } from "./fx.js"

interface AsyncService<+Yield,+Return,-Next> {
  next(value?: Next): Promise<IteratorResult<Yield,Return>>;
  return<R>(value: R): Promise<IteratorResult<Yield,R|Return>>;
  throw(error?: any): Promise<IteratorResult<Yield,Return>>;
}

export type ServiceExecution<message> = AsyncService<message, void, Error>

export interface Service<a> {
  perform(): ServiceExecution<a>
}

*/

class Subscription /*::<message>*/ {
  /*::
  service: Service<message>
  onSpawn: ThreadID => ?message
  onExit: (?Error) => ?message
  */
  constructor(
    service /*: Service<message>*/,
    onSpawn /*: ThreadID => ?message*/,
    onExit /*: (?Error) => ?message*/
  ) {
    this.service = service
    this.onSpawn = onSpawn
    this.onExit = onExit
  }
  map /*::<b>*/(tag /*:message => b*/) /*:Effect<b>*/ {
    return new Tagged(this, tag)
  }
  perform(main /*: Main<message>*/) {
    const thread = new ServiceThread(this.service.perform(), main, this.onExit)
    const threadID = main.link(thread)
    const spawnMessage = this.onSpawn(threadID)
    if (spawnMessage != null) {
      main.send(spawnMessage)
    }
  }
}

class Termination /*::<message>*/ {
  /*::
  id: ThreadID
  reason:?Error
  */
  constructor(id /*: ThreadID*/, reason /*:?Error*/) {
    this.id = id
    this.reason = reason
  }
  map /*::<b>*/(tag /*:message => b*/) /*:Effect<b>*/ {
    return new Tagged(this, tag)
  }
  perform(main /*: Main<message>*/) {
    const thread = main.linked(this.id)
    if (thread) {
      thread.exit(this.reason)
    }
  }
}

class ServiceThread /*::<message>*/ {
  /*::
  return: ({ done: true, value?: void }) => void
  throw: Error => void
  result: Promise<{ done: true, value?: void }>
  service: ServiceExecution<message>
  main: Main<message>
  onExit: (?Error) => ?message
  */
  constructor(
    service /*: ServiceExecution<message>*/,
    main /*: Main<message>*/,
    onExit /*: (?Error) => ?message*/
  ) {
    this.result = new Promise((succeed, fail) => {
      this.return = succeed
      this.throw = fail
    })
    this.service = service
    this.main = main
    this.onExit = onExit
    this.run()
  }
  exit(error /*: ?Error*/) {
    this.main.unlink(this)
    const exitMessage = this.onExit(error)
    if (error != null) {
      this.throw(error)
    } else {
      this.return({ done: true })
    }
    if (exitMessage) {
      this.main.send(exitMessage)
    }
  }
  async run() {
    const { main, service, result } = this
    try {
      await 0
      while (true) {
        const next = await Promise.race([service.next(), result])
        if (next.done === true) {
          return this.exit()
        } else {
          this.main.send(next.value)
        }
      }
    } catch (error) {
      this.throw(error)
    }
  }
}

class ServiceInstance /*::<message, a, b, c, d, e, f, g, h>*/ {
  /*::
  execute: (a, b, c, d, e, f, g, h) => ServiceExecution<message>
  params:[a, b, c, d, e, f, g, h]
  */
  constructor(
    execute /*: (a, b, c, d, e, f, g, h) => ServiceExecution<message>*/,
    params /*: [a, b, c, d, e, f, g, h]*/
  ) {
    this.execute = execute
    this.params = params
  }
  perform() /*:ServiceExecution<message>*/ {
    return this.execute(...this.params)
  }
}

/*::
type ServiceFactory<fn: Function> = $Call<
  {
    <a, b, c, $>((a, b, c) => ServiceExecution<$>): (a, b, c) => Service<$>,
    <a, b, $>((a, b) => ServiceExecution<$>): (a, b) => Service<$>,
    <a, $>((a) => ServiceExecution<$>): a => Service<$>,
    <$>(() => ServiceExecution<$>): () => Service<$>
  },
  fn
>

type $Service = <fn>(fn) => ServiceFactory<fn>
*/

const $service /*:any*/ = execute => (...params) =>
  new ServiceInstance(execute, params)

export const service /*:$Service*/ = $service

export const subscribe = /*::<data, message>*/ (
  service /*:Service<message>*/,
  onSpawn /*:ThreadID => ?message*/ = nothing,
  onExit /*:?Error => ?message*/ = nothing
) /*:Effect<message>*/ => new Subscription(service, onSpawn, onExit)

export const unsubscribe = /*::<message>*/ (
  id /*:ThreadID*/
) /*:Effect<message>*/ => new Termination(id, null)
