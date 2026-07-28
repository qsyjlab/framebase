import type { Ref, VNodeChild } from 'vue'

export interface ProErrorBoundaryProps {
  /** Custom fallback render function or static VNode. */
  fallback?: VNodeChild | (() => VNodeChild)
  /** Called when an error is captured from a descendant. */
  onError?: (error: unknown, info: string) => void
  /** Whether to stop the error from propagating to parent boundaries. Defaults to true. */
  stopPropagation?: boolean
  /**
   * Reactive values that, when changed, reset the boundary back to normal.
   * Useful for clearing the error after the underlying data changes.
   */
  resetKeys?: unknown[]
  /** Title shown by the default fallback. */
  title?: string
  /** Sub title shown by the default fallback. */
  subTitle?: string
  /** Reload button text for the default fallback. */
  reloadText?: string
}

export interface ProErrorBoundarySlots {
  default?: () => VNodeChild
  fallback?: (scope: { error: unknown; reset: () => void }) => VNodeChild
}

export interface ProErrorBoundaryExpose {
  error: Ref<unknown>
  hasError: Ref<boolean>
  reset: () => void
}
