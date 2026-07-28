/**
 * Re-export request utilities from `@framebase/vue`.
 *
 * The canonical implementation now lives in `@framebase/vue/request` so it can
 * be reused outside of the Element Plus pro-components package. This file keeps
 * the historical import path (`shared/pro-request`) working for existing
 * callers and preserves the `Pro`-prefixed naming convention used across this
 * package.
 */
export {
  useProRequest,
  isProRequestAbort,
  type ProRequestPhase,
  type ProRequestAction,
  type ProRequestContext,
  type ProRequestExecuteOptions,
  type ProRequestOptions,
  type ProRequestLifecycle,
  type ProRequestControl,
  type ProRequestState
} from '@framebase/vue'
