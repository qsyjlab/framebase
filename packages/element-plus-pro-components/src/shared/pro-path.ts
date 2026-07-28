/**
 * Re-export path utilities from `@framebase/core`.
 *
 * The canonical implementation now lives in `@framebase/core/path` so it can be
 * reused outside of the Element Plus pro-components package. This file keeps the
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
} from '@framebase/core'
