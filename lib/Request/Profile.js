// @flow status

import { DatArchive } from "../beaker.js"
import { nothing } from "../elm/basics.js"

const archives = {}

const loadArchive = async url => {
  const archive = archives[url]
  if (archive) {
    return archive
  } else {
    const archive = await DatArchive.load(url)
    archives[url] = archive
    return archive
  }
}

const decodeFile = async (archive, path, decoder) => {
  const content = await archive.readFile(path, { encoding: "utf-8" })
  return decoder.decode(content)
}

export const loadProfile = /*::<a>*/ (
  id /*: string*/,
  onLoad /*:string => ?a*/,
  onFail /*:Error => ?a*/ = nothing
) /*:() => Promise<?a>*/ => async () => {
  try {
    const archive = await loadArchive(`dat://${id}`)
    const profile = await archive.readFile("profile.json", {
      encoding: "utf-8"
    })
    return onLoad(profile)
  } catch (error) {
    return onFail(error)
  }
}

export const pickFiles = /*::<a>*/ (
  id /*:string*/,
  onPicked /*:FileList => ?a*/ = nothing,
  onFail /*:Error => ?a*/ = nothing
) /*:() => Promise<?a>*/ => () => {
  const input = window.top.document.getElementById(id)
  if (!input) {
    return Promise.resolve(onFail(Error(`Element with id ${id} not found`)))
  } else {
    return new Promise(resolve => {
      const onChange = event => {
        input.removeEventListener("change", onChange)
        const { files } = input
        if (files) {
          resolve(onPicked(input.files))
        } else {
          resolve()
        }
      }
      input.addEventListener("change", onChange)
      input.click()
    })
  }
}

export const revokeObjectURL = /*::<a>*/ (
  src /*:string*/,
  onOk /*:() => ?a*/ = nothing,
  onError /*:Error => ?a*/ = nothing
) /*:() => Promise<?a>*/ => async () => {
  try {
    if (src.startsWith("blob:")) {
      URL.revokeObjectURL(src)
    }
    return onOk()
  } catch (error) {
    return onError(error)
  }
}

export const createObjectURL = /*::<a>*/ (
  source /*:File|Blob|MediaSource*/,
  onOk /*:string => ?a*/ = nothing,
  onError /*:Error => ?a*/ = nothing
) /*:() => Promise<?a>*/ => async () => {
  try {
    return onOk(URL.createObjectURL(source))
  } catch (error) {
    return onError(error)
  }
}
