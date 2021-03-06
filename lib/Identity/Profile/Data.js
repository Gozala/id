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
  isOwner:boolean;
  avatarURL:string;
  name:string;
  about:string;
}

export type ProfileEdit = {
  name:string;
  about:string;
  avatarURL:string;
  avatarFile:?File;
}

export type LoadedProfile = {
  tag:"LoadedProfile";
  id:string;
  showDragZone:boolean;
  data:ProfileData;
  edit:ProfileEdit;
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
  data,
  edit: {
    name: data.name,
    about: data.about,
    avatarURL: data.avatarURL,
    avatarFile: null
  }
})

export const decode = (id /*:string*/, data /*:Object*/) /*:Model*/ => {
  const { avatarURL, name, about, isOwner } = data
  return loaded({
    id,
    isOwner: Boolean(isOwner),
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
    const edit = { ...state.edit, avatarURL: url }
    return { tag: "LoadedProfile", ...state, edit }
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

export const changeAvatar = (
  state /*:Model*/,
  avatarFile /*:File*/,
  showDragZone /*:boolean*/ = false
) /*:Model*/ => {
  if (state.tag === "LoadedProfile") {
    const edit = { ...state.edit, avatarFile }
    return { tag: "LoadedProfile", ...state, showDragZone, edit }
  } else {
    return state
  }
}

export const editName = (state /*:Model*/, name /*:string*/) /*:Model*/ => {
  if (state.tag === "LoadedProfile") {
    const edit = { ...state.edit, name }
    return { tag: "LoadedProfile", ...state, edit }
  } else {
    return state
  }
}

export const editAbout = (state /*:Model*/, about /*:string*/) /*:Model*/ => {
  if (state.tag === "LoadedProfile") {
    const edit = { ...state.edit, about }
    return { tag: "LoadedProfile", ...state, edit }
  } else {
    return state
  }
}

export const edits = (state /*:Model*/) => {
  if (state.tag === "LoadedProfile") {
    return state.edit
  } else {
    return null
  }
}

export const isEdited = (state /*:Model*/) => {
  if (state.tag === "LoadedProfile") {
    const { data, edit } = state
    const edited =
      data.name !== edit.name ||
      data.about !== edit.about ||
      data.avatarURL !== edit.avatarURL

    return edited
  } else {
    return false
  }
}
