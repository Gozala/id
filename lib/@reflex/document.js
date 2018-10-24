// @flow strict

import { virtualize, diff, patch, doc } from "./virtual-dom.js"
import { Widget } from "./widget.js"

/*::
import type { Program, Transaction } from "./widget.js"
import type { Node, Doc } from "./virtual-dom.js"

export type { Node, Doc, Program, Widget, Transaction }

export type Root = {body:Element, title:string, location:Location}
*/

export class DocumentWidget /*::<a, model, config>*/ extends Widget /*::<a, model, Doc<a>, Root, config>*/ {
  static root(document /*:Document*/) /*:Root*/ {
    const root /*:any*/ = document
    if (!document.body) {
      document.appendChild(document.createElement("body"))
    }
    return root
  }
  mount(document /*:Root*/) /*:Doc<a>*/ {
    return doc(document.title, virtualize(document.body))
  }
  render(state /*:model*/) {
    const newDocument = this.view(state)
    const renderedDocument = this.node
    const delta = diff(renderedDocument.body, newDocument.body)
    patch(this.root.body, renderedDocument.body, delta, this)
    this.node = newDocument
    if (renderedDocument.title !== newDocument.title) {
      this.root.title = newDocument.title
    }
  }
}

export const spawn = /*::<a, model, config>*/ (
  { init, update, view } /*:Program<a, model, Doc<a>, config>*/,
  options /*:config*/,
  document /*:Document*/
) /*:Widget<a, model, Doc<a>, Root, config>*/ => {
  const self = new DocumentWidget()
  const root = DocumentWidget.root(document)
  self.update = update
  self.view = view
  self.root = root
  self.node = self.mount(root)
  self.transact(init(options))
  return self
}
