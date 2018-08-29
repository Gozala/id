// @flow strict

/*::
export type Model = {
  name:string;
  about:string;
  avatar: ?File;
}
*/

export const init = () => ({
  name: "",
  about: "",
  avatar: null
})

export const updateName = (name /*:string*/, data /*:Model*/) /*:Model*/ => ({
  ...data,
  name
})
export const updateAbout = (about /*:string*/, data /*:Model*/) /*:Model*/ => ({
  ...data,
  about
})

export const updateAvator = (
  avatar /*:?File*/,
  data /*:Model*/
) /*:Model*/ => ({ ...data, avatar })
