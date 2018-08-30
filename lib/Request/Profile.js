// @flow status

import { DatArchive } from "../beaker.js"
import { nothing } from "../elm/basics.js"
import { future } from "../elm/Future.js"

/*::
import type { Task } from "../elm/Future.js"
import type { Archive } from "../beaker.js"
*/

const archives /*:{[string]:Archive}*/ = {}

const loadArchive = future(async (url /*:string*/) /*:Promise<Archive>*/ => {
  const archive = archives[url]
  if (archive) {
    return archive
  } else {
    const archive /*:Archive*/ = await DatArchive.load(url)
    archives[url] = archive
    return archive
  }
})

export const loadProfile = future(async (id /*: string*/) => {
  const archive /*:Archive*/ = await loadArchive(`dat://${id}`)
  const content = await readProfileData(archive)
  return content
})

export const startProfile = future((id /*:string*/) =>
  updateProfile(id, {
    avatarURL: "",
    name: "",
    about: ""
  })
)

export const updateProfile = future(async (
  id /*:string*/,
  data /*:{name:string, about:string, avatarURL:string}*/
) => {
  const archive /*:Archive*/ = await loadArchive(`dat://${id}`)
  await archive.writeFile(PROFILE_DATA, JSON.stringify(data, null, 2), {
    encoding: "utf-8"
  })
})

export const saveProfile = future(async (
  id /*:string*/,
  data /*:{name:string, about:string, avatarURL:string}*/
) => {
  const archive /*:Archive*/ = await loadArchive(`dat://${id}`)
  await archive.writeFile(PROFILE_DATA, JSON.stringify(data, null, 2), {
    encoding: "utf-8"
  })
})

const PROFILE_DATA = "profile.json"

const readProfileData = future(
  async archive =>
    await archive.readFile(PROFILE_DATA, {
      encoding: "utf-8"
    })
)

export const selectProfile = future(async () => {
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
})

export const revokeObjectURL = future((src /*:string*/) => {
  if (src.startsWith("blob:")) {
    URL.revokeObjectURL(src)
  }
})

export const createObjectURL = future((source /*:File|Blob|MediaSource*/) => {
  return URL.createObjectURL(source)
})
