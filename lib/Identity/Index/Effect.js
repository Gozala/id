// @flow status

import { DatArchive } from "../../beaker/DatArchive.js"
import { StorageArea } from "../../io/async-local-storage.js"
import { nothing } from "../../@reflex/basics.js"
import { future } from "../../@reflex/Future.js"
import { navigate, load, replaceURL } from "../../@reflex/navigation.js"
import * as Profile from "../Profile/Effect.js"

/*::
import type { Archive } from "../../beaker/DatArchive.js"
import type { Task } from "../../@reflex/Future.js"
*/

const PROFILES_DB = "profiles"

const storage =
  window.profilesStorageArea ||
  (window.profilesStorageArea = new StorageArea("profiles"))

export { navigate, load, replaceURL }
export const listProfiles = future(async () => {
  const profiles = await storage.get(PROFILES_DB)
  return profiles || []
})

export const addProfile = future(async () => {
  const archive = await Profile.selectProfile()
  const id = archive.url.replace("dat://", "")
  const profiles = await listProfiles()
  if (profiles.includes(id)) {
    return id
  } else {
    try {
      await Profile.loadProfile(id)
    } catch (error) {
      await Profile.startProfile(id)
    }
    profiles.push(id)
    storage.set(PROFILES_DB, profiles)
    return id
  }
})
