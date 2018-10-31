// @flow strict
import type { URL, Route, Parse } from "../route.flow/Route.js"
import { parsePath, parseHash } from "../route.flow/Route.js"

interface toDecoder<out> {
  <x: out>([]): () => x;
  <x: out, a>([a]): a => x;
  <x: out, a, b>([a, b]): a => b => x;
  <x: out, a, b, c>([a, b, c]): a => b => c => x;
  <x: out, a, b, c, d>([a, b, c, d]): a => b => c => d => x;
  <x: out, a, b, c, d, e>([a, b, c, d, e]): a => b => c => d => e => x;
  <x: out, a, b, c, d, e, f>(
    [a, b, c, d, e, f]
  ): a => b => c => d => e => f => x;
  <x: out, a, b, c, d, e, f, g>(
    [a, b, c, d, e, f, g]
  ): a => b => c => d => e => f => g => x;
  <x: out, a, b, c, d, e, f, g, h>(
    [a, b, c, d, e, f, g, h]
  ): a => b => c => d => e => f => g => h => x;
  <x: out, __, ___>(__, ___): empty;
}
export type Decoder<inn, out> = $Call<toDecoder<out>, inn>
