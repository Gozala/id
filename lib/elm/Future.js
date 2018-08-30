// @noflow

export class Future {
  constructor(execute, params) {
    this.execute = execute
    this.params = params
  }
  then(onResolve, onReject) {
    return this.perform().then(onResolve, onReject)
  }
  perform() {
    return this.execute(...this.params)
  }
}
Object.setPrototypeOf(Future.prototype, Promise.prototype)

export const future = fn => (...params) => new Future(fn, params)
