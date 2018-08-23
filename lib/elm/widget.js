// @flow strict

import { diff, patch, virtualize } from "./virtual-dom.js"

/*::
import type {Transaction, Port} from "./fx.js"
import type {Node} from "./virtual-dom.js"

export type App<message, state, widget, options> = {
  init: (options) => Transaction<message, state>,
  update: (message, state) => Transaction<message, state>,
  view: (state) => widget
}

export type DocumentNode<a> = {
  title:string;
  body:Node<a>
}

export type Doc = Document & {body:HTMLBodyElement}
*/

export class Widget /*::<a, model, widget, target, config>*/ {
  /*::
  state:model;
  init:config => Transaction<a, model>;
  update:(a, model) =>Transaction<a, model>;
  view:model => widget
  root:target
  node:widget
  */
  async send(message /*:a*/) {
    await 0
    this.sync(message)
  }
  sync(message /*:a*/) {
    this.transact(this.update(message, this.state))
  }
  transact({ state, fx } /*:Transaction<a, model>*/) {
    this.state = state
    this.render(state)
    fx.perform(this)
  }
  render(state /*:model*/) {}
  mount(root /*:target*/) /*:widget*/ {
    return this.node
  }
  static new(
    { init, update, view } /*:App<a, model, widget, config>*/,
    options /*:config*/,
    root /*:target*/
  ) {
    const self = new this()
    self.init = init
    self.update = update
    self.view = view
    self.root = root
    self.node = self.mount(root)
    self.transact(init(options))
    return self
  }
}

class ElementWidget /*::<a, model, config> extends Widget<a, model, Node<a>, Element, config>*/ {
  mount(root /*:Element*/) /*:Node<a>*/ {
    return virtualize(root)
  }
  render(state /*:model*/) {
    const newNode = this.view(state)
    const renderedNode = this.node
    const delta = diff(renderedNode, newNode)
    patch(this.root, renderedNode, delta, this)
    this.node = newNode
  }
}

class DocumentWidget /*::<a, model, config>*/ extends Widget /*::<a, model, DocumentNode<a>, Document, config>*/ {
  /*::
  body:HTMLBodyElement
  */
  mount(document /*:Document*/) /*:DocumentNode<a>*/ {
    const body =
      document.body || document.appendChild(document.createElement("body"))
    this.body = body

    return {
      title: document.title,
      body: virtualize(body)
    }
  }
  render(state /*:model*/) {
    const newDocument = this.view(state)
    const renderedDocument = this.node
    const delta = diff(renderedDocument.body, newDocument.body)
    patch(this.body, newDocument.body, delta, this)
    this.node = newDocument
    if (renderedDocument.title !== newDocument.title) {
      this.root.title = newDocument.title
    }
  }
}

// class ApplicationWidget extends DocumentWidget {
//   spawn({ init, update, view, onURLRequest, onURLChange }, options, root) {
//     this.init = init
//     this.update = update
//     this.view = view
//     this.onURLRequest = onURLRequest
//     this.onURLChange = onURLChange
//     this.root = root
//     this.node = this.mount(root)
//     this.setup(root)

//     this.transact(init(options, this.getURL()))

//     return this
//   }
//   getURL() {
//     return new URL(this.root.location.href)
//   }
//   handleEvent(event) {
//     switch (event.type) {
//       case "popstate":
//       case "hashchange":
//         return this.send(this.onURLChange(this.getURL()))
//       case "click": {
//         if (
//           !event.ctrlKey &&
//           !event.metaKey &&
//           !event.shiftKey &&
//           event.button < 1 &&
//           !event.target.target &&
//           !event.target.download
//         ) {
//           event.preventDefault()
//           const current = this.getURL()
//           const next = new URL(event.currentTarget.href, current.href)

//           const isInternal =
//             current.protocol === next.protocol &&
//             current.host === next.host &&
//             current.port === next.port

//           return this.send(this.onURLRequest(next, !isInternal))
//         }
//       }
//     }
//   }
//   setup(document) {
//     const top = document.defaultView
//     top.addEventListener("popstate", this)
//     top.addEventListener("hashchange", this)
//     top.onnavigate = this
//   }
// }

export const widget = /*::<a, model, config>*/ (
  app /*:App<a, model, Node<a>, config>*/,
  options /*:config*/,
  root /*:Element*/
): Port<a> => ElementWidget.new(app, options, root)

// export const document = /*::<a, model, config>*/ (app, options, document) =>
//   new DocumentWidget().spawn(app, options, document)

// export const application = (app, options, document) =>
//   new ApplicationWidget().spawn(app, options, document)
