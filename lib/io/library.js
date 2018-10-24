// @flow strict

import { future } from "../@reflex/Future.js"
import { library } from "../beaker/library.js"

/*::
import type {UserSettings, Duration, Query, ArchiveInfo, UpdatedEvent, NetworkChangeEvent} from "../beaker/library.js"
export type {ArchiveInfo}
*/

export const list = future(library.list)
export const add = future(library.add)
export const remove = future(library.remove)
export const requestAdd = future(library.requestAdd)
export const requestRemove = future(library.requestRemove)
export const get = future(library.get)
