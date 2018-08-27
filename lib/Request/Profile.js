// @flow status

import { DatArchive } from "../beaker.js"
import { nothing } from "../elm/basics.js"

/*::
import type { Task } from "../elm/fx"
import type { Archive } from "../beaker.js"
*/

const archives /*:{[string]:Archive}*/ = {}

const loadArchive = async (url /*:string*/) /*:Promise<Archive>*/ => {
  const archive = archives[url]
  if (archive) {
    return archive
  } else {
    const archive /*:Archive*/ = await DatArchive.load(url)
    archives[url] = archive
    return archive
  }
}

export const loadProfile = (id /*: string*/) /*:Task<string>*/ => async () => {
  const archive /*:Archive*/ = await loadArchive(`dat://${id}`)
  const content = await readProfileData(archive)
  return content
}

export const startProfile = async (id /*:string*/) =>
  updateProfile(id, {
    avatarURL: "",
    name: "",
    about: ""
  })

export const updateProfile = async (id /*:string*/, data /*:Object*/) => {
  const archive /*:Archive*/ = await loadArchive(`dat://${id}`)
  await archive.writeFile(PROFILE_DATA, JSON.stringify(data, null, 2), {
    encoding: "utf-8"
  })
}

const PROFILE_DATA = "profile.json"

const readProfileData = async archive =>
  archive.readFile(PROFILE_DATA, {
    encoding: "utf-8"
  })

export const pickFiles = (id /*:string*/) /*:Task<FileList>*/ => () => {
  const input = window.top.document.getElementById(id)
  if (!input) {
    throw Error(`Element with id ${id} not found`)
  } else {
    return new Promise((resolve, reject) => {
      const onChange = event => {
        input.removeEventListener("change", onChange)
        const { files } = input
        if (files) {
          resolve(input.files)
        } else {
          reject(Error("No files had being selected"))
        }
      }
      input.addEventListener("change", onChange)
      input.click()
    })
  }
}

export const selectProfile /*:Task<Archive>*/ = async () => {
  const archive = await DatArchive.selectArchive({
    title: "Select an archive to use as your user profile",
    buttonLabel: "Select profile",
    filters: {
      isOwner: true,
      type: ["identity", "profile", "id"]
    }
  })
  archives[archive.url.toString()] = archive
  return archive
}

export const revokeObjectURL = (
  src /*:string*/
) /*:Task<void>*/ => async () => {
  if (src.startsWith("blob:")) {
    URL.revokeObjectURL(src)
  }
}

export const createObjectURL = (
  source /*:File|Blob|MediaSource*/
) /*:Task<string>*/ => async () => {
  return URL.createObjectURL(source)
}
