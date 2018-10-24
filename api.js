self.onmessage = event => {
  document.querySelector("pre").textContent += `${JSON.stringify(event.data)}\n`

  event.source.postMessage({ echo: event.data }, event.origin)
}
