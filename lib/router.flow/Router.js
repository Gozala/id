// @flow strict

import type {
  Route,
  State,
  URL,
  Query,
  Push,
  VariableSegment,
  ConstantSegment,
  Param,
  QueryParam
} from "../route.flow/Route.js"
import { parsePathname } from "../route.flow/Route/URL.js"
import { Root, Base, parsePath } from "../route.flow/Route.js"
import { raw } from "./String"

export type { Route }
export type { integer, float } from "../route.flow/Route.js"
export { String, Float, Integer, query } from "../route.flow/Route.js"
import { decodePath } from "../route.flow/StrictDecoder.js"
import type { Decoder } from "./Decoder.js"

export interface RouterRoute<out> extends Route<out> {
  route: Route<out>;
}

export interface RouterParam<out> extends RouterRoute<out> {
  <next>(route: Param<next>): RouterSegment<Push<out, next>>;
}

export interface RouterSegment<out> extends RouterRoute<out> {
  (string[], ...string[]): RouterParam<out>;
}

class API<out> implements RouterRoute<out> {
  route: Route<out>

  parseRoute(state: State<[]>): ?State<out> {
    return this.route.parseRoute(state)
  }
  formatRoute(state: State<out>): State<[]> {
    return this.route.formatRoute(state)
  }

  parse(path: string[], query: Query): ?out {
    return this.route.parse(path, query)
  }
  parsePath(url: URL): ?out {
    return this.route.parsePath(url)
  }
  parseHash(url: URL): ?out {
    return this.route.parseHash(url)
  }

  format(...params: Array<mixed> & out): URL {
    return this.route.format(...params)
  }
  formatPath(...params: Array<mixed> & out): string {
    return this.route.formatPath(...params)
  }
  formatHash(...params: Array<mixed> & out): string {
    return this.route.formatHash(...params)
  }

  segment(path?: string): Route<out> {
    return this.route.segment(path)
  }
  var<b>(segment: VariableSegment<b>): Route<Push<out, b>> {
    return this.route.var(segment)
  }
  const(segment: ConstantSegment & Route<[]>): self {
    return this.route.const(segment)
  }
  param<b>(param: VariableSegment<b>): Route<Push<out, b>> {
    return this.route.param(param)
  }
  query<b>(name: string, param: QueryParam<b>): Route<Push<out, b>> {
    return this.route.query(name, param)
  }
  rest<b>(param: VariableSegment<b>): Route<Push<out, b>> {
    return this.route.rest(param)
  }
  // concat<other>(route: Route<other>): Route<Concat<out, other>> {
  //   return this.route.concat(route)
  // }
}

const param = <a>(base: Route<a>): RouterParam<a> => {
  const dsl = <b>(route: Param<b>): RouterSegment<Push<a, b>> =>
    segment(base.var(route))
  dsl.route = base

  dsl.parseRoute = API.prototype.parseRoute
  dsl.formatRoute = API.prototype.formatRoute

  dsl.parse = API.prototype.parse
  dsl.parsePath = API.prototype.parsePath
  dsl.parseHash = API.prototype.parseHash

  dsl.format = API.prototype.format
  dsl.formatPath = API.prototype.formatPath
  dsl.formatHash = API.prototype.formatHash

  dsl.segment = API.prototype.segment
  dsl.param = API.prototype.param
  dsl.var = API.prototype.var
  dsl.const = API.prototype.const
  dsl.rest = API.prototype.rest
  dsl.query = API.prototype.query

  return dsl
}

const addSegments = <a>(base: Route<a>, path: string): Route<a> => {
  let route = base
  const segments = parsePathname(path)
  for (let fragment of segments) {
    if (fragment !== "") {
      route = route.segment(fragment)
    }
  }
  return route
}

export const segments = (path: string): Route<[]> => addSegments(Base, path)

const segment = <a>(base: Route<a>): RouterSegment<a> => {
  const dsl = (fragments: string[], ...params: string[]): RouterParam<a> => {
    const path = raw({ raw: (fragments: any) }, ...params)
    return param(addSegments(base, path))
  }
  dsl.route = base

  dsl.parseRoute = API.prototype.parseRoute
  dsl.formatRoute = API.prototype.formatRoute

  dsl.parse = API.prototype.parse
  dsl.parsePath = API.prototype.parsePath
  dsl.parseHash = API.prototype.parseHash

  dsl.format = API.prototype.format
  dsl.formatPath = API.prototype.formatPath
  dsl.formatHash = API.prototype.formatHash

  dsl.segment = API.prototype.segment
  dsl.param = API.prototype.param
  dsl.var = API.prototype.var
  dsl.const = API.prototype.const
  dsl.rest = API.prototype.rest
  dsl.query = API.prototype.query

  return dsl
}

export const route = (
  fragments: string[],
  ...params: string[]
): RouterParam<[]> => {
  const path = String.raw({ raw: (fragments: any) }, ...params)
  const base = path.charAt(0) === "/" ? Root : Base
  return param(addSegments(base, path))
}

interface Request {
  url: URL;
  method: string;
}

interface Router<a> {
  route(Request): ?a;
  method<x, b>(string, Route<x>, Decoder<x, b>): Router<a | b>;
  get<x, b>(Route<x>, Decoder<x, b>): Router<a | b>;
  put<x, b>(Route<x>, Decoder<x, b>): Router<a | b>;
  post<x, b>(Route<x>, Decoder<x, b>): Router<a | b>;
  delete<x, b>(Route<x>, Decoder<x, b>): Router<a | b>;
  head<x, b>(Route<x>, Decoder<x, b>): Router<a | b>;
}

class RouterAPI<a> implements Router<a> {
  +route: Request => ?a
  method<x, b>(
    name: string,
    route: Route<x>,
    decoder: Decoder<x, b>
  ): Router<a | b> {
    const right: Router<b> = new LeafRouter(name, route, decoder)
    return new BranchRouter(this, right)
  }
  get<x, b>(route: Route<x>, decoder: Decoder<x, b>): Router<a | b> {
    return this.method("GET", route, decoder)
  }
  put<x, b>(route: Route<x>, decoder: Decoder<x, b>): Router<a | b> {
    return this.method("PUT", route, decoder)
  }
  post<x, b>(route: Route<x>, decoder: Decoder<x, b>): Router<a | b> {
    return this.method("POST", route, decoder)
  }
  delete<x, b>(route: Route<x>, decoder: Decoder<x, b>): Router<a | b> {
    return this.method("DELETE", route, decoder)
  }
  head<x, b>(route: Route<x>, decoder: Decoder<x, b>): Router<a | b> {
    return this.method("HEAD", route, decoder)
  }
}

class LeafRouter<x, a> extends RouterAPI<a> {
  type: string
  decoder: Decoder<x, a>
  leaf: Route<x>
  constructor(type: string, leaf: Route<x>, decoder: Decoder<x, a>) {
    super()
    this.type = type
    this.decoder = decoder
    this.leaf = leaf
  }
  route(request: Request): ?a {
    if (request.method.toUpperCase() === this.type) {
      const route /*:any*/ = this.leaf
      return decodePath(route, request.url, this.decoder)
    } else {
      return null
    }
  }
}

class BranchRouter<a, b> extends RouterAPI<a | b> {
  left: Router<a>
  right: Router<b>
  constructor(left: Router<a>, right: Router<b>) {
    super()
    this.left = left
    this.right = right
  }
  route(request: Request): ?(a | b) {
    const out = this.left.route(request)
    if (out == null) {
      return this.right.route(request)
    } else {
      return out
    }
  }
}

class EmptyRouter extends RouterAPI<empty> {
  route(request: Request): null {
    return null
  }
}

export const router: Router<empty> = new EmptyRouter()
