/**
 * Path utilities for dot-notation access to nested object and array values.
 *
 * Runtime helpers (`normalizePath` / `getPathValue` / `setPathValue` /
 * `unsetPathValue`) delegate to lodash-es so that bracket notation such as
 * `a[0].b`, `a['name']`, escaped paths and nested arrays all work out of the
 * box. The path type inference (`DataPath` / `DataIndex`) is hand-rolled on
 * top, since lodash's `PropertyPath` cannot surface editor autocomplete.
 *
 * These helpers are framework-agnostic and do not depend on Vue or Element Plus.
 * They are reused by `@framebase/element-plus-pro-components` and can be used
 * directly by any application.
 */

import { toPath, get, set, unset } from 'lodash-es'

export type PathSegment = string | number

export type Path = PathSegment | readonly PathSegment[]

/**
 * A string literal union that stays open for declaration merging.
 *
 * `LiteralUnion<'a' | 'b'>` accepts the known literals `'a' | 'b'` as well as
 * any other `string`, while still surfacing the known literals in editor
 * autocomplete. Useful for extensible config keys (e.g. `valueType`).
 */
export type LiteralUnion<T extends string> = T | (string & Record<never, never>)

type Builtin = Date | RegExp | ((...args: never[]) => unknown)
type StringKey<T> = Extract<keyof T, string | number>
type DepthMap = {
  1: [unknown]
  2: [unknown, unknown]
  3: [unknown, unknown, unknown]
  4: [unknown, unknown, unknown, unknown]
}

type JoinPath<TKey extends string | number, TPath> = TPath extends string | number
  ? `${TKey}.${TPath}`
  : never

type DataPathInternal<T, TDepth extends unknown[]> = TDepth extends [unknown, ...infer TRest]
  ? T extends Builtin | readonly unknown[]
    ? never
    : T extends object
      ? {
          [TKey in StringKey<T>]:
            | `${TKey}`
            | (NonNullable<T[TKey]> extends object
                ? JoinPath<TKey, DataPathInternal<NonNullable<T[TKey]>, TRest>>
                : never)
        }[StringKey<T>]
      : never
  : never

/** Dot notation paths are intentionally capped to keep editor and vue-tsc performance stable. */
export type DataPath<T, TDepth extends 1 | 2 | 3 | 4 = 4> = DataPathInternal<T, DepthMap[TDepth]>

export type DataIndex<T> = LiteralUnion<Extract<DataPath<T>, string>> | readonly PathSegment[]

/**
 * Normalize a path into an array of segments. Delegates to lodash `toPath` so
 * that bracket notation (`a[0].b`, `a['name']`, `a["name"]`), escaped dots and
 * nested arrays are all handled consistently. Numeric segments are coerced back
 * to `number` to preserve existing call-site expectations.
 */
export function normalizePath(path: Path): PathSegment[] {
  if (typeof path !== 'string' && typeof path !== 'number') return [...path]
  if (typeof path === 'number') return [path]
  return toPath(path).map(segment => (/^\d+$/.test(segment) ? Number(segment) : segment))
}

export function getPathValue<TValue = unknown>(source: unknown, path: Path): TValue | undefined {
  return get(source, normalizePath(path)) as TValue | undefined
}

export function setPathValue(target: object, path: Path, value: unknown): void {
  set(target, normalizePath(path), value)
}

/**
 * Delete the value at the given dot-notation path. Walks the path and removes
 * the final segment via lodash `unset`. Missing intermediate segments are a
 * no-op (instead of throwing), which matches `getPathValue`.
 */
export function unsetPathValue(target: object, path: Path): void {
  unset(target, normalizePath(path))
}

// --- Pro-prefixed aliases (back-compat with @framebase/element-plus-pro-components) ---

export type ProPathSegment = PathSegment
export type ProPath = Path
export type ProLiteralUnion<T extends string> = LiteralUnion<T>
export type ProDataPath<T, TDepth extends 1 | 2 | 3 | 4 = 4> = DataPath<T, TDepth>
export type ProDataIndex<T> = DataIndex<T>

export const normalizeProPath = normalizePath
export const getProPathValue = getPathValue
export const setProPathValue = setPathValue
export const unsetProPathValue = unsetPathValue
