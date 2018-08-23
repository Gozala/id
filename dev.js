;(async () => {
  const archive = await DatArchive.load(`dat://${location.host}`)
  const iframe = document.createElement("iframe")
  iframe.style.display = "none"
  iframe.src = `lib?time=${Date.now()}`

  const watcher = archive.watch(["*.js", "**/*.js"])

  watcher.addEventListener("changed", ({ path }) => {
    console.log(`Reload application since document has changed ${path}`)
    iframe.src = `lib?time=${Date.now()}`
    if (iframe.parentNode == null) {
      document.documentElement.appendChild(iframe)
    }
  })

  document.documentElement.appendChild(iframe)
})()
