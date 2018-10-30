// @flow strict

/*::
export interface URLPathParser <a, b> {
  +parsePath: (State<a>) => State<b>[];

  segment(string):URLPathParser<a, b>;
  and<c>(URLPathParser<b, c>):URLPathParser<a, c>;
}

export opaque type State <a> = {
  path:string;
  offset:number;
  searchParams:URLSearchParams;
  value:a;
}

export type Result<x, a> =
  | { ok:false, error:x }
  | { ok:true, value:a }

interface URLParamParser<a, b> extends URLPathParser<a => b, b> {}
interface URLSegmentParser<a> extends URLPathParser<a, a> {}

export interface URLSearchParser <a, b> {
  +parseSearch: (State<a>) => State<b>[]
}

export interface URLSearchParamParser<a, b> extends URLSearchParser<a => b, b> {}

export interface Parse<a> {
  (string): Result<string, a>;
}
*/

const next = (
  { offset, path } /*:{path:string, offset:number}*/
) /*:string*/ => {
  if (offset >= path.length) {
    return ""
  } else {
    const end = path.indexOf("/", offset)
    return end < 0 ? path.slice(offset) : path.slice(offset, end)
  }
}

class URLParser /*::<a, b>*/ {
  /*::
  +parsePath: (State<a>) => State<b>[]
  */
  segment(value /*:string*/) /*:URLPathParser<a, b>*/ {
    return new CompositeParser(this, new Segment(value))
  }
  and /*::<c>*/(parser /*:URLPathParser<b, c>*/) /*:URLPathParser<a, c>*/ {
    return new CompositeParser(this, parser)
  }
}

class CompositeParser /*::<a, b, c>*/ extends URLParser /*::<a, c> implements URLPathParser<a, c>*/ {
  /*::
  left:URLPathParser<a, b>
  right:URLPathParser<b, c>
  */
  constructor(left /*:URLPathParser<a, b>*/, right /*:URLPathParser<b, c>*/) {
    super()
    this.left = left
    this.right = right
  }
  parsePath(state /*:State<a>*/) /*:State<c>[]*/ {
    const { left, right } = this
    const result = []
    for (const inner of left.parsePath(state)) {
      result.push(...right.parsePath(inner))
    }
    return result
  }
}

export const ok = /*::<x, a>*/ (value /*:a*/) /*:Result<x, a>*/ => ({
  ok: true,
  value
})

export const error = /*::<x, a>*/ (error /*:x*/) /*:Result<x, a>*/ => ({
  ok: false,
  error
})

export const String = /*::<a>*/ () /*:URLParamParser<string, a>*/ =>
  new Param(ok)

const invalidInteger = error("Not a vaild integer")

const parseInteger = input => {
  const size = input.length
  if (size === 0) {
    return invalidInteger
  } else {
    const ch = input[0]
    if (ch === "0" && input[1] === "x") {
      for (let i = 2; i < size; ++i) {
        const ch = input[i]
        if (
          ("0" <= ch && ch <= "9") ||
          ("A" <= ch && ch <= "F") ||
          ("a" <= ch && ch <= "f")
        ) {
          continue
        }
        return invalidInteger
      }

      return ok(parseInt(input, 16))
    }

    if (ch > "9" || (ch < "0" && ((ch !== "-" && ch !== "+") || size === 1))) {
      return invalidInteger
    }

    for (let i = 1; i < size; ++i) {
      const ch = input[i]
      if (ch < "0" || "9" < ch) {
        return invalidInteger
      }
    }

    return ok(parseInt(input, 10))
  }
}
export const Integer = /*::<a>*/ () /*:URLParamParser<number, a>*/ =>
  new Param(parseInteger)

class Param /*::<a, b>*/ extends URLParser /*::<a => b, b> implements URLParamParser<a, b>*/ {
  /*::
  parserParam: Parse<a>
  */
  constructor(parserParam /*: Parse<a>*/) {
    super()
    this.parserParam = parserParam
  }
  parsePath(state /*:State<a => b>*/) /*:State<b>[]*/ {
    const input = next(state)
    if (input === "") {
      return []
    } else {
      const { path, offset, searchParams, value } = state
      const result = this.parserParam(input)
      if (result.ok) {
        return [
          {
            path,
            searchParams,
            offset: offset + input.length + 1,
            value: state.value(result.value)
          }
        ]
      } else {
        return []
      }
    }
  }
}

export const segment = /*::<a>*/ (
  segment /*:string*/
) /*:URLSegmentParser<a>*/ => new Segment(segment)

class Segment /*::<a>*/ extends URLParser /*::<a, a> implements URLSegmentParser<a>*/ {
  /*::
  expect:string
  */
  constructor(expect /*:string*/) {
    super()
    this.expect = expect
  }
  parsePath(state /*:State<a>*/) /*:State<a>[]*/ {
    const input = next(state)
    if (input === "") {
      return []
    } else {
      const { path, offset, searchParams, value } = state
      if (input === this.expect) {
        return [{ ...state, offset: offset + input.length + 1 }]
      } else {
        return []
      }
    }
  }
}

class Root /*::<a>*/ extends URLParser /*::<a, a> implements URLPathParser<a, a>*/ {
  parsePath(state /*:State<a>*/) /*:State<a>[]*/ {
    if (state.offset === 0 && state.path.charAt(0) === "/") {
      return [{ ...state, offset: 1 }]
    } else {
      return []
    }
  }
}

class Pack /*::<a, b, c>*/ extends URLParser /*::<(b) => c, c> implements URLPathParser<(b) => c, c>*/ {
  /*::
  sub: a
  parser: URLPathParser<a, b>
  */
  constructor(sub /*: a*/, parser /*: URLPathParser<a, b>*/) {
    super()
    this.sub = sub
    this.parser = parser
  }
  parsePath(state /*:State<(b) => c>*/) /*:State<c>[]*/ {
    const matches = this.parser.parsePath({
      path: state.path,
      offset: state.offset,
      searchParams: state.searchParams,
      value: this.sub
    })

    return matches.map(packer(state.value))
  }
}

const packer = /*::<a, b>*/ (pack /*:a => b*/) /*:(State<a> => State<b>)*/ => (
  state /*:State<a>*/
) /*:State<b>*/ => ({
  path: state.path,
  offset: state.offset,
  searchParams: state.searchParams,
  value: pack(state.value)
})

export const root = /*::<a>*/ () /*:URLPathParser<a, a>*/ => new Root()

class SearchParamParser /*::<a, b> implements URLSearchParamParser<a, b>*/ {
  /*::
  key:string
  parserSearchParam: (?string) => a
  */
  constructor(key /*:string*/, parserSearchParam /*: (?string) => a*/) {
    this.key = key
    this.parserSearchParam = parserSearchParam
  }
  parseSearch(state /*:State<a => b>*/) /*:State<b>[]*/ {
    const { path, offset, searchParams, value } = state
    const result = this.parserSearchParam(searchParams.get(this.key))
    return [
      {
        path,
        offset,
        searchParams,
        value: value(result)
      }
    ]
  }
}

const identity = /*::<a>*/ (value /*:a*/) /*:a*/ => value

export const stringParam = /*::<a>*/ (
  key /*:string*/
) /*:URLSearchParamParser<?string, a>*/ => new SearchParamParser(key, identity)

export const integerParam = /*::<a>*/ (
  key /*:string*/
) /*:URLSearchParamParser<?number, a>*/ =>
  new SearchParamParser(key, input => {
    if (input == null) {
      return null
    } else {
      const result = parseInteger(input)
      if (result.ok) {
        return result.value
      } else {
        return null
      }
    }
  })

export const parseURL = /*::<a>*/ (
  parser /*:URLPathParser<(a) => a, a>*/,
  url /*:URL*/
) /*:?a*/ =>
  parseWith(parser, {
    path: url.pathname,
    offset: 0,
    searchParams: url.searchParams,
    value: identity
  })

const noSearchParams = new URLSearchParams()

export const parsePath = /*::<a>*/ (
  parser /*:URLPathParser<(a) => a, a>*/,
  path /*:string*/
) /*:?a*/ =>
  parseWith(parser, {
    path,
    offset: 0,
    searchParams: noSearchParams,
    value: identity
  })

export const parsePathAs = /*::<a, b>*/ (
  parser /*:URLPathParser<(a) => b, b>*/,
  path /*:string*/,
  as /*:a => b*/
) /*:?b*/ => {
  const matches = parser.parsePath({
    path,
    offset: 0,
    searchParams: noSearchParams,
    value: as
  })

  for (const match of matches) {
    const remainder = match.path.substr(match.offset)
    switch (remainder) {
      case "":
        return match.value
      case "/":
        return match.value
    }
  }

  return null
}

const parseWith = /*::<a, b>*/ (
  parser /*:URLPathParser<(a) => b, b>*/,
  state /*:State<(a) => b>*/
) /*:?b*/ => {
  const matches = parser.parsePath(state)

  for (const match of matches) {
    const remainder = match.path.substr(match.offset)
    switch (remainder) {
      case "":
        return match.value
      case "/":
        return match.value
    }
  }

  return null
}

/*::
const out = parseURL(String(), new URL("https://foo/alice/"))

const comment = root()
  .segment("user")
  .and(String())
  .segment("comments")
  .and(Integer())

const result = parsePathAs(comment, "/user/bob/comments/42", name => id => ({name, id}))
*/
