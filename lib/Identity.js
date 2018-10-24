// @flow strict

import { spawn } from "./@reflex/application.js"
import * as Main from "./Identity/Main.js"

if (location.protocol === "dat:") {
  window.top.main = spawn(Main, window.top.main, window.top.document)
}
