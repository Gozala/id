import OpenPGP from "//id.hashbase.io/lib/OpenPGP/OpenPGP.js"

print: OpenPGPconst keys = OpenPGP.generateKey({
  userIds: [{ name: "Irakli Gozalishvili", email: "gozala@icloud.com" }],
  numBits: 4096,
  passphrase: "super long and hard to guess secret"
})

print: keys