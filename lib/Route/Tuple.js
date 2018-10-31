// @noflow strict

export interface URLParser<a> {
  +parsePath: <$>(State<$>) => ?State<[$, a]>;

  // segment(string): URLPathParser<a, b>;
  // and<c>(URLPathParser<b, c>): URLPathParser<a, Concat<b, c>>;
}

interface URLPathParser<a> {
  +parsePath: <$>(State<$>) => ?State<[$, a]>;
}

interface URLSegmentParser {
  +parsePath: <$>(State<$>) => ?State<$>;
}

export opaque type State<a> = {
  path: string,
  offset: number,
  searchParams: URLSearchParams,
  value: a
}

export type Result<x, a> = { ok: false, error: x } | { ok: true, value: a }

export interface Parse<a> {
  (string): Result<string, a>;
}

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

class Parser /*::<a>*/ {
  /*::
  +parsePath: <$>(State<$>) => ?State<[$, a]>
  */
  segment(value /*:string*/) /*:Parser<a>*/ {
    throw 1
    // return new CompositeParser(this, new Segment(value))
  }
  //   //   and /*::<c>*/(parser /*:URLPathParser<b, c>*/) /*:URLPathParser<a, c>*/ {
  //   //     return new CompositeParser(this, parser)
  //   //   }
}

class ChainVariable<a, b> implements URLParser<[a, b]> {
  left: URLParser<a>
  right: URLPathParser<b>
  constructor(left: URLParser<a>, right: URLPathParser<b>) {
    super()
    this.left = left
    this.right = right
  }
  parsePath /*::<$>*/(state /*:State<$>*/) /*:?State<[$, [a, b]]>*/ {
    const match = this.left.parsePath(state)
    if (match) {
      const result = this.right.parsePath(match)
      if (result) {
        const [[first, second], third] = result.value
        return {
          path: state.path,
          offset: result.offset,
          searchParams: result.searchParams,
          value: [first, [second, third]]
        }
      }
    }
  }
}

class Param /*::<a> implements URLPathParser<a>*/ {
  /*::
  parserParam: Parse<a>
  */
  constructor(parserParam /*: Parse<a>*/) {
    super()
    this.parserParam = parserParam
  }
  parsePath /*::<$>*/(state /*:State<$>*/) /*:?State<[$, a]>*/ {
    const input = next(state)
    if (input === "") {
      return null
    } else {
      const { path, offset, searchParams, value } = state
      const result = this.parserParam(input)
      if (result.ok) {
        return {
          path,
          searchParams,
          offset: offset + input.length + 1,
          value: [state.value, result.value]
        }
      } else {
        return null
      }
    }
  }
}

class Segment /*::implements URLSegmentParser*/ {
  /*::
  expect:string
  */
  constructor(expect /*:string*/) {
    super()
    this.expect = expect
  }
  parsePath /*::<$>*/(state /*:State<$>*/) /*:?State<$>*/ {
    const input = next(state)
    if (input === "") {
      return null
    } else {
      const { path, offset, searchParams, value } = state
      const result /*:any*/ = state.value
      if (input === this.expect) {
        return {
          ...state,
          offset: offset + input.length + 1,
          value: result
        }
      } else {
        return null
      }
    }
  }
}

class BaseSegment extends Parser<[]> {
  parsePath /*::<$>*/(state /*:State<$>*/) /*:?State<$>*/ {
    return state
  }
}

class Root /*::implements URLSegmentParser*/ {
  parsePath /*::<$>*/(state /*:State<$>*/) /*:?State<$>*/ {
    if (state.offset === 0 && state.path.charAt(0) === "/") {
      return { ...state, offset: 1 }
    } else {
      return null
    }
  }
}

export const root = /*::<a>*/ () /*:URLSegmentParser*/ => new Root()

// export const segment = /*::<a>*/ (
//   segment /*:string*/
// ) /*:URLSegmentParser<a>*/ => new Segment(segment)

// export const ok = /*::<x, a>*/ (value /*:a*/) /*:Result<x, a>*/ => ({
//   ok: true,
//   value
// })

// export const error = /*::<x, a>*/ (error /*:x*/) /*:Result<x, a>*/ => ({
//   ok: false,
//   error
// })

// export const String = /*::<a>*/ () /*:URLPathParser<a, [string]>*/ =>
//   new Param(ok)

// const invalidInteger = error("Not a vaild integer")

// const parseInteger = input => {
//   const size = input.length
//   if (size === 0) {
//     return invalidInteger
//   } else {
//     const ch = input[0]
//     if (ch === "0" && input[1] === "x") {
//       for (let i = 2; i < size; ++i) {
//         const ch = input[i]
//         if (
//           ("0" <= ch && ch <= "9") ||
//           ("A" <= ch && ch <= "F") ||
//           ("a" <= ch && ch <= "f")
//         ) {
//           continue
//         }
//         return invalidInteger
//       }

//       return ok(parseInt(input, 16))
//     }

//     if (ch > "9" || (ch < "0" && ((ch !== "-" && ch !== "+") || size === 1))) {
//       return invalidInteger
//     }

//     for (let i = 1; i < size; ++i) {
//       const ch = input[i]
//       if (ch < "0" || "9" < ch) {
//         return invalidInteger
//       }
//     }

//     return ok(parseInt(input, 10))
//   }
// }
// export const Integer = /*::<a>*/ () /*:URLParamParser<a, number>*/ =>
//   new Param(parseInteger)

// class CompositeParser /*::<a, b, c>*/ extends URLParser /*::<Concat<Concat<a, b>, c>> implements URLPathParser<Concat<Concat<a, b>, c>>*/ {
//   /*::
//   left:URLPathParser<a, b>
//   right:URLPathParser<Concat<a, b>, c>
//   */
//   constructor(left /*:URLPathParser<a, b>*/, right /*:URLPathParser<Concat<a, b>, c>*/) {
//     super()
//     this.left = left
//     this.right = right
//   }
//   parsePath(state /*:State<a>*/) /*:State<Concat<Concat<a, b>, c>>[]*/ {
//     const { left, right } = this
//     const result = []
//     for (const inner of left.parsePath(state)) {
//       result.push(...right.parsePath(inner))
//     }
//     return result
//   }
// }

// const noSearchParams = new URLSearchParams()

// export const parsePath = /*::<a>*/ (
//   parser /*:URLPathParser<[], a>*/,
//   path /*:string*/
// ) /*:?a*/ =>
//   choose(
//     parser.parsePath({
//       path,
//       offset: 0,
//       searchParams: noSearchParams,
//       value: []
//     })
//   )

// const choose = /*::<a>*/ (matches /*:State<a>[]*/) /*:?a*/ => {
//   for (const match of matches) {
//     const remainder = match.path.substr(match.offset)
//     switch (remainder) {
//       case "":
//         return match.value
//       case "/":
//         return match.value
//     }
//   }
// }

// const stringParser = String()
// const str = parsePath(stringParser, "/foo/")

// if (str) {
//   str[0]
// }

// const comment = root()
//   .segment("user")
//   .and(String())
//   .segment("comments")
//   .and(Integer())

type Concat<xs, ys> = $Call<
  {
    ([]): ys,
    <a>([a]): Cons<a, ys>,
    <a, b>([a, b]): Cons<a, Cons<b, ys>>,
    <a, b, c>([a, b, c]): Cons<a, Cons<b, Cons<c, ys>>>,
    <a, b, c, d>([a, b, c, d]): Cons<a, Cons<b, Cons<c, Cons<d, ys>>>>,
    <a, b, c, d, e>(
      [a, b, c, d, e]
    ): Cons<a, Cons<b, Cons<c, Cons<d, Cons<e, ys>>>>>,
    <a, b, c, d, e, f>(
      [a, b, c, d, e, f]
    ): Cons<a, Cons<b, Cons<c, Cons<d, Cons<e, Cons<f, ys>>>>>>,
    <a, b, c, d, e, f, g>(
      [a, b, c, d, e, f, g]
    ): Cons<a, Cons<b, Cons<c, Cons<d, Cons<e, Cons<f, Cons<g, ys>>>>>>>
  },
  xs
>

type Cons<x, xs> = $Call<
  {
    ([]): [x],
    <a>([a]): [x, a],
    <a, b>([a, b]): [x, a, b],
    <a, b, c>([a, b, c]): [x, a, b, c],
    <a, b, c, d>([a, b]): [x, a, b, c, d],
    <a, b, c, d, e>([a, b]): [x, a, b, c, d, e],
    <a, b, c, d, e, f>([a, b]): [x, a, b, c, d, e, f],
    <a, b, c, d, e, f, g>([a, b]): [x, a, b, c, d, e, f, g]
  },
  xs
>

declare function cons<x, xs>(x, xs): Cons<x, xs>
declare function concat<xs, ys>(xs, ys): Concat<xs, ys>

const a = cons(1, [])
const a1 = a[0]
// const a2 = a[1]

const b = cons(1, ["foo"])
const b0 = b[0]
const b1 = b[1]
// const b2 = b[2]

const c = cons({ x: 1 }, [{ y: 2 }])
const c0 = c[0]
const c1 = c[1]

const bac = concat(b, c)
const bac0 = bac[0]
const bac1 = bac[1]
const bac2 = bac[2]
const bac3 = bac[3]
