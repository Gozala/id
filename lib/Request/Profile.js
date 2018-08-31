// @flow status

import { DatArchive } from "../beaker.js"
import { nothing } from "../elm/basics.js"
import { future } from "../elm/Future.js"
import { readBlob, createObjectURL, revokeObjectURL } from "./Blob.js"

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
  return await readProfileData(archive)
})

export const startProfile = future(async (id /*:string*/) => {
  const archive /*:Archive*/ = await loadArchive(`dat://${id}`)
  await writeProfileData(archive, {
    avatarURL: "",
    name: "",
    about: ""
  })
})

export const saveChanges = future(async (
  id /*:string*/,
  changes /*:{name:string, about:string, avatarFile:?File}*/
) /*:Promise<Object>*/ => {
  const { avatarFile, name, about } = changes
  const avatarURL = avatarFile ? `profile.${extension(avatarFile.name)}` : ""
  const archive /*:Archive*/ = await loadArchive(`dat://${id}`)
  if (avatarFile) {
    const buffer = await readBlob(avatarFile)
    await archive.writeFile(avatarURL, new top.Uint8Array(buffer), {
      encoding: "binary"
    })
  }
  const profile = await readProfileData(archive)
  const data = {
    ...profile,
    avatarURL,
    name,
    about
  }
  await writeProfileData(archive, data)

  return data
})

const PROFILE_DATA = "profile.json"

const extension = fileName => fileName.split(".").pop()

const readProfileData = future(async archive => {
  try {
    const content = await archive.readFile(PROFILE_DATA, {
      encoding: "utf-8"
    })
    return JSON.parse(content)
  } catch (error) {
    return {}
  }
})

const writeProfileData = future(async (archive, data) => {
  const content = JSON.stringify(data, null, 2)
  await archive.writeFile(PROFILE_DATA, content, {
    encoding: "utf-8"
  })
})

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

export { readBlob, createObjectURL, revokeObjectURL }
