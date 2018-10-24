// @flow

import { future } from "../@reflex/Future.js"

export const readBlob = future(
  (file /*:Blob*/) /*:Promise<ArrayBuffer>*/ =>
    new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = event => resolve(event.target.result)
      reader.readAsArrayBuffer(file)
    })
)

export const revokeObjectURL = future((src /*:string*/) => {
  if (src.startsWith("blob:")) {
    URL.revokeObjectURL(src)
  }
})

export const createObjectURL = future((source /*:File|Blob|MediaSource*/) => {
  return URL.createObjectURL(source)
})
