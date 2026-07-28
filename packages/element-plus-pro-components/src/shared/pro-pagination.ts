import type { ProConfigProviderPaginationConfig } from '../pro-config-provider/pro-config-provider'
import { resolveProConfigProviderPopperClass } from '../pro-config-provider/pro-config-provider-utils'

/**
 * Inline pagination shape accepted by `ProTable` / `ProList` via their
 * `pagination` prop. Both `ProTablePagination` and `ProListPagination` are
 * structurally compatible with this (extra fields like `total` are ignored).
 */
export interface ProPaginationInline {
  current?: number
  pageSize?: number
  pageSizes?: number[]
  layout?: string | string[]
  background?: boolean
  small?: boolean
  popperClass?: string
  teleported?: boolean
}

export interface ResolvedProPagination {
  current: number
  pageSize: number
  pageSizes: number[]
  layout: string
  background: boolean
  small: boolean
  popperClass: string
  teleported: boolean
}

const DEFAULT_PAGINATION_LAYOUT = 'total, sizes, prev, pager, next, jumper'

export interface ResolveProPaginationOptions {
  /** Built-in `pageSizes` fallback when neither inline nor global defines one. */
  defaultPageSizes: number[]
  /** Size-derived `small` fallback (e.g. table/list density === 'small'). */
  small: boolean
  /** Dark mode flag used to derive the popper class. */
  dark: boolean | undefined
}

/**
 * Resolve pagination props from the three-tier priority chain:
 *
 *   `inline.<field>`  >  `global.<field>`  >  built-in default
 *
 * Shared by `ProTable` and `ProList` so the resolution rule lives in one
 * place. `inline` may be a boolean (pagination disabled) — it is then treated
 * as an empty config so callers can pass `props.pagination` directly.
 */
export function resolveProPagination(
  inline: ProPaginationInline | boolean | undefined,
  global: ProConfigProviderPaginationConfig | undefined,
  options: ResolveProPaginationOptions
): ResolvedProPagination {
  const inlineConfig = typeof inline === 'object' ? inline : {}
  const layoutSource = inlineConfig.layout ?? global?.layout
  const popperClass = resolveProConfigProviderPopperClass(
    options.dark,
    inlineConfig.popperClass ?? global?.popperClass
  )

  return {
    current: inlineConfig.current ?? 1,
    pageSize: inlineConfig.pageSize ?? global?.pageSize ?? 10,
    pageSizes: inlineConfig.pageSizes ?? global?.pageSizes ?? options.defaultPageSizes,
    layout: Array.isArray(layoutSource)
      ? layoutSource.join(',')
      : (layoutSource ?? DEFAULT_PAGINATION_LAYOUT),
    background: inlineConfig.background ?? global?.background ?? true,
    small: inlineConfig.small ?? global?.small ?? options.small,
    popperClass,
    teleported: inlineConfig.teleported ?? global?.teleported ?? true
  }
}
