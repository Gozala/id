// @flow strict

import { diff, patch, virtualize } from "./virtual-dom.js"

/*::
import type { Node, Port } from "./virtual-dom.js"

export type { Node }

export interface IO<message> {
  perform(Port<message>):mixed;
}
export type Transaction<message, state> = [state, IO<message>]

export type Program<message, state, widget, options> = {
  init: (options) => Transaction<message, state>,
  update: (message, state) => Transaction<message, state>,
  view: (state) => widget
}

export type Application<message, state, widget, options> = {
  onExternalURLRequest: (URL) => message;
  onInternalURLRequest: (URL) => message;
  onURLChange: (URL) => message;

  init: (options, URL) => Transaction<message, state>;
  update: (message, state) => Transaction<message, state>;
  view: (state) => widget;
}

export type Doc<a> = {
  title:string;
  body:Node<a>
}
*/

export class Widget /*::<a, model, widget, target, config>*/ {
  /*::
  state:model;
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
  transact([state, fx] /*:Transaction<a, model>*/) {
    this.state = state
    this.render(state)
    fx.perform(this)
  }
  render(state /*:model*/) {}
  mount(root /*:target*/) /*:widget*/ {
    return this.node
  }
  toJSON() {
    return this.state
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

export const spawn = /*::<a, model, config>*/ (
  { init, update, view } /*:Program<a, model, Node<a>, config>*/,
  options /*:config*/,
  root /*:Element*/
) /*:Widget<a, model, Node<a>, Element, config>*/ => {
  const self = new ElementWidget()
  self.update = update
  self.view = view
  self.root = root
  self.node = self.mount(root)
  self.transact(init(options))
  return self
}
