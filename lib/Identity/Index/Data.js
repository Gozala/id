// @flow strict

/*::
import * as Profile from "../Profile.js"

export type Model = {
  profiles:Profile.Model[]
}
*/

export const decode = (input /*:Object*/) /*:Model*/ => {
  const { profiles } = JSON.parse(JSON.stringify(input))
  return { profiles }
}

export const setProfiles = (profiles /*:Profile.Model[]*/) /*:Model*/ => ({
  profiles
})

export const addProfile = (
  newProfile /*:Profile.Model*/,
  state /*:Model*/
) /*:Model*/ => {
  for (const [index, profile] of state.profiles.entries()) {
    if (profile.id === newProfile.id) {
      const newProfiles = state.profiles.slice(0)
      newProfiles[index] = profile
      return setProfiles(newProfiles)
    }
  }
  return setProfiles([...state.profiles, newProfile])
}
