// @flow strict

import * as Inbox from "../Inbox/Profile.js"
import { always } from "../elm/basics.js"

/*::
import type {EncodedEvent} from "../elm/virtual-dom.js"
*/

const decoder = decode => ({ decode })

export const pickedImages = decoder((event /*:EncodedEvent*/) => {
  const files =
    event.target instanceof top.HTMLInputElement ? event.target.files : null
  const message = files ? Inbox.dropFiles(files) : Inbox.hideDragZone()

  return { message }
})

export const showDragZone = decoder(
  always({
    message: Inbox.showDragZone(),
    preventDefault: true,
    stopPropagation: true
  })
)

export const hideDragZone = decoder(
  always({
    message: Inbox.hideDragZone(),
    preventDefault: true,
    stopPropagation: true
  })
)

export const dragStart = showDragZone
export const dragOver = showDragZone
export const dragEnter = showDragZone

export const dragEnd = hideDragZone
export const dragLeave = hideDragZone

export const drop = decoder((event /*:EncodedEvent*/) => {
  const files =
    event.dataTransfer instanceof top.DataTransfer
      ? event.dataTransfer.files
      : null
  const message = files ? Inbox.dropFiles(files) : Inbox.hideDragZone()

  return {
    message,
    preventDefault: true,
    stopPropagation: true
  }
})

export const avatarLoaded = decoder((event /*:EncodedEvent*/) => ({
  message: Inbox.avatarLoaded(getAttribute(event.target, "src"))
}))

export const editName = decoder((event /*:EncodedEvent*/) => ({
  message: Inbox.editName(event.srcElement.textContent)
}))

export const editAbout = decoder((event /*:EncodedEvent*/) => ({
  message: Inbox.editAbout(event.srcElement.textContent)
}))

const getAttribute = (target /*:EventTarget*/, name /*:string*/) =>
  target instanceof top.Node ? target.getAttribute(name) : ""
