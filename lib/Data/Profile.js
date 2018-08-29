// @flow strict

/*::
export type FailedProfile = {
  tag:"FailedProfile";
  id:string;
  error:Error;
}

export type LoadingProfile = {
  tag:"LoadingProfile";
  id:string;
}

export type ProfileData = {
  id:string;
  avatarURL:string;
  name:string;
  about:string;
}

export type LoadedProfile = {
  tag:"LoadedProfile";
  id:string;
  showDragZone:boolean;
  data:ProfileData;
}

export type Profile =
| LoadingProfile
| FailedProfile
| LoadedProfile

export type Model = Profile
*/

export const init = (id /*:string*/) /*:Model*/ => ({
  tag: "LoadingProfile",
  id
})
export const loaded = (data /*:ProfileData*/) /*:Model*/ => ({
  tag: "LoadedProfile",
  id: data.id,
  showDragZone: false,
  data
})
export const decode = (id /*:string*/, content /*:string*/) /*:Model*/ => {
  const { avatarURL, name, about } = JSON.parse(content)
  return loaded({
    id,
    avatarURL: String(avatarURL || ""),
    name: String(name || ""),
    about: String(about || "")
  })
}

export const failed = (id /*:string*/, error /*:Error*/) => ({
  tag: "FailedProfile",
  id,
  error
})

export const updateAvatar = (state /*:Model*/, url /*:string*/) /*:Model*/ => {
  if (state.tag === "LoadedProfile") {
    const data = { ...state.data, avatarURL: url }
    return { tag: "LoadedProfile", ...state, data }
  } else {
    return state
  }
}

export const updateDragZoneState = (
  state /*:Model*/,
  showDragZone /*:boolean*/
) => {
  if (state.tag === "LoadedProfile" && state.showDragZone != showDragZone) {
    return { ...state, showDragZone }
  } else {
    return state
  }
}
