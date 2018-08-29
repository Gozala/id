// @flow status

import { DatArchive } from "../beaker.js"
import { StorageArea } from "../async-local-storage.js"
import { nothing } from "../elm/basics.js"
import * as ProfileFX from "./Profile.js"

/*::
import type { Archive } from "../beaker.js"
import type { Task } from "../elm/fx"
*/

const PROFILES_DB = "profiles"

const storage = new StorageArea("profiles")

export const listProfiles /*:Task<string[]>*/ = async () => {
  const profiles = await storage.get(PROFILES_DB)
  return profiles || []
}

export const addProfile /*:Task<string>*/ = async () => {
  const archive = await ProfileFX.selectProfile()
  const id = archive.url.replace("dat://", "")
  const profiles = await listProfiles()
  if (profiles.includes(id)) {
    return id
  } else {
    try {
      const task = ProfileFX.loadProfile(id)
      await task()
    } catch (error) {
      const task = ProfileFX.startProfile(id)
      await task()
    }
    profiles.push(id)
    storage.set(PROFILES_DB, profiles)
    return id
  }
}
