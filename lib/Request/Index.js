// @flow status

import { DatArchive } from "../beaker.js"
import { storage } from "../async-local-storage.js"
import { nothing } from "../elm/basics.js"
import * as ProfileFX from "./Profile.js"

/*::
import type {Archive} from "../beaker.js"
*/

export const listProfiles = /*::<a>*/ (
  onList /*:string[] => a*/
) /*:() => Promise<?a>*/ => async () => {
  const profiles = await storage.get("profiles")
  return onList(profiles || [])
}

export const selectProfile = /*::<a>*/ (
  onSelect /*:Archive => ?a*/,
  onError /*:Error => ?a*/ = nothing
) /*:() => Promise<?a>*/ => async () => {
  try {
    const archive = await DatArchive.selectArchive({
      title: "Select an archive to use as your user profile",
      buttonLabel: "Select profile",
      filters: {
        isOwner: true,
        type: ["identity", "profile", "id"]
      }
    })
    return onSelect(archive)
  } catch (error) {
    return onError(error)
  }
}

export const fetchProfiles = /*::<a>*/ (
  onFetched /*:string[] => a*/
) /*:() => Promise<?a>*/ => async () => {
  const profiles = await storage.get("profiles")
  const entries = []
  for (const id of profiles || []) {
    const request = ProfileFX.loadProfile(id, String)
    const result = await request()
    if (result) {
      entries.push(result)
    }
  }
  return onFetched(entries)
}
