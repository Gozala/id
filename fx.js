const Void = _ => {}
export const nofx = state => [state, Void]
export const fx = (state, task) => [state, task]
export const chain = (...tasks) => async mailbox => {
  for (const task of tasks) {
    await task(mailbox)
  }
}
