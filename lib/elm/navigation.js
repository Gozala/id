// @flow strict

export const navigate = /*::<a>*/ (url /*:URL*/, message /*:a*/) => {
  window.top.history.pushState({}, "", url)
  return message
}

export const replaceURL = /*::<a>*/ (url /*:URL*/, message /*:a*/) => {
  window.top.history.replaceState({}, "", url)
  return message
}

export const back = /*::<a>*/ (n /*:number*/, message /*:a*/) => {
  window.top.history.go(-1 * n)
  return message
}

export const forward = /*::<a>*/ (n /*:number*/, message /*:a*/) => {
  window.top.history.go(n)
  return message
}

export const load = /*::<a>*/ (url /*:URL*/, message /*:a*/) => {
  try {
    window.top.location = url
  } catch (error) {
    window.top.location.reload(false)
  }
  return message
}

export const reload = /*::<a>*/ (message /*:a*/) => {
  window.top.location.reload(false)
  return message
}

export const reloadAndSkipCache = /*::<a>*/ (message /*:a*/) => {
  window.top.location.reload(true)
  return message
}
