// @flow strict

import { service } from "../@reflex/Service.js"

/*::
import type {ServiceExecution} from "../@reflex/Service.js"
*/

class KeyboardService /*::<a> implements ServiceExecution<a>*/ {
  /*::
  type:string
  toMessage: KeyboardEvent => ?a
  succeed: null | ({done:false, value:a} | {done:true, value:void}) => void
  fail: Error => void
  handleEvent:Event => mixed
  */
  constructor(type /*: string*/, toMessage /*:KeyboardEvent => ?a*/) {
    this.type = type
    this.toMessage = toMessage
  }
  static spawn(
    type /*: string*/,
    toMessage /*:KeyboardEvent => ?a*/
  ) /*: ServiceExecution<a>*/ {
    const service = new KeyboardService(type, toMessage)
    document.addEventListener(type, service)
    return service
  }
  static presses /*::<a>*/(
    toMessage /*:KeyboardEvent => ?a*/
  ) /*: ServiceExecution<a>*/ {
    return KeyboardService.spawn("keypress", toMessage)
  }
  static ups /*::<a>*/(
    toMessage /*:KeyboardEvent => ?a*/
  ) /*: ServiceExecution<a>*/ {
    return KeyboardService.spawn("keydown", toMessage)
  }
  static downs /*::<a>*/(
    toMessage /*:KeyboardEvent => ?a*/
  ) /*: ServiceExecution<a>*/ {
    return KeyboardService.spawn("keyup", toMessage)
  }
  handleEvent(event /*:KeyboardEvent*/) {
    const { succeed, type } = this
    if (event.type === type) {
      const message = this.toMessage(event)
      if (message && succeed) {
        succeed({ done: false, value: message })
      }
    }
  }

  next() /*: Promise<IteratorResult<a, void>>*/ {
    return new Promise((resolve, reject) => {
      this.succeed = resolve
      this.fail = reject
    })
  }
  exit(error /*::?:Error*/) {
    window.removeEventListener(this.type, this)
    const { fail, succeed } = this
    const done = { done: true, value: undefined }
    if (error) {
      if (fail) {
        fail(error)
      }
    } else {
      if (succeed) {
        succeed(done)
      }
    }
    return done
  }
  async return() /*: Promise<IteratorResult<a, void>>*/ {
    return this.exit()
  }
  async throw(error /*::?: Error*/) /*: Promise<IteratorResult<a, void>>*/ {
    return this.exit(error)
  }
}

export const presses = service(KeyboardService.presses)
export const downs = service(KeyboardService.downs)
export const ups = service(KeyboardService.ups)
