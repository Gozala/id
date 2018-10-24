// @flow strict

import { on, doc } from "../@reflex/virtual-dom.js"
import { text, body, main, article, a, img, span } from "../@reflex/element.js"
import { src, alt, href, className } from "../@reflex/attribute.js"
// import { navigate } from "../elm/navigation.js"
import { fx, nofx, batch } from "../@reflex/fx.js"
import { identity, never } from "../@reflex/basics.js"
import * as Effect from "./Index/Effect.js"
import * as Profile from "./Profile.js"
import * as Inbox from "./Index/Inbox.js"
import * as Data from "./Index/Data.js"

/*::
import type { Node, Doc } from "../@reflex/virtual-dom.js"


export type Model = Data.Model
export type Message = Inbox.Message
*/

export const init = (main /*:?Object*/) => {
  if (main) {
    return [Data.decode(main), nofx]
  } else {
    return [
      Data.setProfiles([]),
      fx(Effect.listProfiles(), Inbox.fetchedProfiles)
    ]
  }
}

export const update = (message /*:Message*/, state /*:Model*/) => {
  switch (message.tag) {
    case "fetchedProfiles": {
      const profiles = []
      const effects = []
      for (const id of message.fetchedProfiles) {
        const [profile, fx] = Profile.load(id)
        profiles.push(profile)
        effects.push(fx.map(Inbox.updateProfile(profile.id)))
      }

      return [Data.setProfiles(profiles), batch(...effects)]
    }
    case "addProfile": {
      return [state, fx(Effect.addProfile(), Inbox.addProfile)]
    }
    case "addedProfile": {
      return [
        state,
        fx(Effect.navigate(new URL(message.addedProfile, location.href)))
      ]
    }
    case "updateProfile": {
      const profiles = []
      const effects = []
      for (const profile of state.profiles) {
        if (profile.id === message.id) {
          const [state, fx] = Profile.update(message.message, profile)
          profiles.push(state)
          effects.push(fx.map(Inbox.updateProfile(profile.id)))
        } else {
          profiles.push(profile)
        }
      }
      return [Data.setProfiles(profiles), batch(...effects)]
    }
    default: {
      return never(message)
    }
  }
}

export const view = (state /*:Model*/) /*:Doc<Message>*/ => {
  return doc(
    "Select your user profile",
    body(
      [],
      [
        main(
          [className("layer index")],
          [
            article(
              [className("selector")],
              [...state.profiles.map(viewProfile), viewAddProfile()]
            )
          ]
        )
      ]
    )
  )
}

const viewAddProfile = () =>
  a(
    [className("new card"), on("click", Decode.addProfile)],
    [
      img([className("avatar"), alt(" "), src("")]),
      span([className("label")], [text("Add Profile")])
    ]
  )

const viewProfile = (profile /*:Profile.Model*/) => {
  switch (profile.tag) {
    case "LoadingProfile":
      return viewProfileState("loading", profile.id, ".....", "")
    case "LoadedProfile":
      return viewProfileState(
        "ready",
        profile.id,
        profile.data.name,
        new URL(profile.data.avatarURL, `dat://${profile.id}/`).href
      )
    case "FailedProfile":
      return viewProfileState("error", profile.id, profile.error.message, "")
    default:
      return viewProfileState("error", profile.id, "", "")
  }
}

const viewProfileState = (status, id, label, url) =>
  a(
    [className(`edit card status-${status}`), href(id)],
    [
      img([className("avatar"), alt(""), src(url)]),
      span([className("label")], [text(label)])
    ]
  )

const Decode = {
  addProfile: {
    decode() {
      return { message: { tag: "addProfile" } }
    }
  }
}
