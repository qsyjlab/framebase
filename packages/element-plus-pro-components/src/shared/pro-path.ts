/**
 * Re-export path utilities from `@framebase/vue` (which re-exports `@framebase/core`).
 *
 * The canonical implementation lives in `@framebase/core/path` and is bundled into
 * `@framebase/vue` so consumers only need a single dependency. This file keeps the
 * historical import path (`shared/pro-path`) working for existing callers and
 * preserves the `Pro`-prefixed naming convention used across this package.
 */
export {
  normalizeProPath,
  getProPathValue,
  setProPathValue,
  unsetProPathValue,
  type ProPathSegment,
  type ProPath,
  type ProLiteralUnion,
  type ProDataPath,
  type ProDataIndex
} from '@framebase/vue'
