// @flow status

import { DatArchive } from "../beaker.js"
import { storage } from "../async-local-storage.js"
import { nothing } from "../elm/basics.js"
import * as ProfileFX from "./Profile.js"

/*::
import type { Archive } from "../beaker.js"
import type { Task } from "../elm/fx"
*/

const PROFILES_DB = "profiles"

export const listProfiles /*:Task<string[]>*/ = async () => {
  const profiles = await storage.get(PROFILES_DB)
  return profiles
}

export const addProfile /*:Task<string>*/ = async () => {
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
}
