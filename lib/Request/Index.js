// @flow status

import { DatArchive } from "../beaker.js"
import { StorageArea } from "../async-local-storage.js"
import { nothing } from "../elm/basics.js"
import * as ProfileFX from "./Profile.js"
import { future } from "../elm/Future.js"

/*::
import type { Archive } from "../beaker.js"
import type { Task } from "../elm/Future.js"
*/

const PROFILES_DB = "profiles"

const storage = new StorageArea("profiles")

export const listProfiles = future(async () => {
  const profiles = await storage.get(PROFILES_DB)
  return profiles || []
})

export const addProfile = future(async () => {
  const archive = await ProfileFX.selectProfile()
  const id = archive.url.replace("dat://", "")
  const profiles = await listProfiles()
  if (profiles.includes(id)) {
    return id
  } else {
    try {
      await ProfileFX.loadProfile(id)
    } catch (error) {
      await ProfileFX.startProfile(id)
    }
    profiles.push(id)
    storage.set(PROFILES_DB, profiles)
    return id
  }
})
