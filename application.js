export class Application {
  send(type, detail) {
    document.dispatchEvent(new CustomEvent(type, { detail }))
  }

  handleEvent(event) {
    this.event = event
    const [state, fx] = this.actor[event.type](event, this.state)
    this.state = state
    fx(this)
  }

  constructor(actor, state) {
    this.actor = actor
    this.state = state
    this.event = new CustomEvent("new")
    this.document = document
  }
  static spawn(Actor, config) {
    const [state, fx] = Actor.new(config)
    const application = new Application(Actor, state)
    for (const event of Object.getOwnPropertyNames(Actor)) {
      const handler = Actor[event]
      if (typeof handler === "function") {
        document.addEventListener(event, application)
      }
    }
    fx(application)
    return application
  }
}

export const spawn = Application.spawn
