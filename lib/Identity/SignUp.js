// @noflow strict

import * as Data from "./SignUp/Data"
import * as Inbox from "./SignUp/Inbox"
import * as FX from "../Request/Profile"
import { fx, nofx } from "../elm/fx"

/*::
export type Model = Data.Model
export type Message = Inbox.Message
*/

export const init = () => {
  return [Data.init(), nofx]
}

export const update = (message /*:Message*/, state /*:Model*/) => {
  switch (message.tag) {
    case "changeName": {
      return [Data.updateName(message.value, state), nofx]
    }
    case "changeAbout": {
      return [Data.updateAbout(message.value, state), nofx]
    }
    case "changeAvatar": {
      return [Data.updateAvator(message.value, state), nofx]
    }
    case "save": {
      return [state, fx(FX.createProfile(state), Inbox.createdProfile)]
    }
  }
}
