// @flow strict

import * as Inbox from "./Inbox.js"
import { always } from "../../@reflex/basics.js"
import * as Decoder from "../../Decoder.flow/Decoder.js"

export const showDragZone = Decoder.ok({
  message: Inbox.showDragZone(),
  preventDefault: true,
  stopPropagation: true
})

export const hideDragZone = Decoder.ok({
  message: Inbox.hideDragZone(),
  preventDefault: true,
  stopPropagation: true
})

export const dragStart = showDragZone
export const dragOver = showDragZone
export const dragEnter = showDragZone

export const dragEnd = hideDragZone
export const dragLeave = hideDragZone

const decodeFiles = Decoder.iterable(Decoder.File)

const pickedImages = Decoder.form({
  message: Decoder.form({
    value: Decoder.at(["target", "files"], decodeFiles),
    tag: Decoder.ok("pickedImages")
  })
})

export const pick = Decoder.either([pickedImages, hideDragZone])

const dropFiles = Decoder.form({
  message: Decoder.form({
    tag: Decoder.ok("dropFiles"),
    value: Decoder.at(["dataTransfer", "files"], decodeFiles)
  }),
  preventDefault: Decoder.ok(true),
  stopPropagation: Decoder.ok(true)
})

export const drop = Decoder.either([dropFiles, hideDragZone])

export const avatarLoaded = Decoder.form({
  message: Decoder.form({
    tag: Decoder.ok("avatarLoaded"),
    value: Decoder.at(["target", "src"], Decoder.String)
  })
})

export const editName = Decoder.form({
  message: Decoder.form({
    tag: Decoder.ok("editName"),
    value: Decoder.at(["srcElement", "textContent"], Decoder.String)
  })
})

export const editAbout = Decoder.form({
  message: Decoder.form({
    tag: Decoder.ok("editAbout"),
    value: Decoder.at(["srcElement", "textContent"], Decoder.String)
  })
})

export const saveChanges = Decoder.ok({
  message: Inbox.saveChanges()
})
