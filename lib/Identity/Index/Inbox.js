// @flow strict

/*::
import * as Profile from "../Profile.js"

export type Message =
  | { tag: "fetchedProfiles", fetchedProfiles: string[] }
  | { tag: "updateProfile", id: string, message: Profile.Message }
  | { tag: "addProfile" }
  | { tag: "addedProfile", addedProfile: string }
*/

export const fetchedProfiles = (entries /*:string[]*/) /*:Message*/ => ({
  tag: "fetchedProfiles",
  fetchedProfiles: entries
})

export const addProfile = (profile /*:string*/) /*:Message*/ => ({
  tag: "addedProfile",
  addedProfile: profile
})

export const updateProfile = (id /*:string*/) => (
  message /*:Profile.Message*/
) /*:Message*/ => ({
  tag: "updateProfile",
  id,
  message
})
