import type { ComponentSize } from 'element-plus'
import type { Ref, VNodeChild } from 'vue'
import type { ProFieldRendererDefinition, ProFieldValueEnum } from '../pro-field'
import type { ProListRequestResult } from '../pro-list'
import type { ProDescriptionsProps } from '../pro-descriptions'
import type { ProTableOptions, ProTableRequestResult } from '../pro-table'

export interface ProConfigProviderFieldConfig {
  emptyText?: string
  renderers?: Record<string, ProFieldRendererDefinition>
}

/**
 * Global pagination defaults consumed by `ProTable` / `ProList`.
 *
 * Each field follows `props.pagination.<field> ?? proConfig.{table|list}.pagination?.<field> ?? builtin`,
 * so inline props always win and global config fills the gaps. `pageSize` only
 * seeds the initial page size; runtime page state remains owned by the
 * component.
 */
export interface ProConfigProviderPaginationConfig {
  pageSize?: number
  pageSizes?: number[]
  layout?: string | string[]
  background?: boolean
  small?: boolean
  popperClass?: string
  teleported?: boolean
}

export interface ProConfigProviderTableConfig {
  responseAdapter?: (response: unknown) => ProTableRequestResult<object>
  transformParams?: <TParams extends object>(params: TParams) => TParams
  customRenderAfter?: (value: VNodeChild, scope: unknown) => VNodeChild
  options?: boolean | ProTableOptions
  size?: ComponentSize
  border?: boolean
  pagination?: ProConfigProviderPaginationConfig
}

export interface ProConfigProviderFormConfig {
  size?: ComponentSize
  labelPosition?: 'left' | 'right' | 'top'
  labelWidth?: string | number
}

export interface ProConfigProviderDescriptionsConfig {
  size?: ComponentSize
  border?: boolean
  column?: ProDescriptionsProps<object>['column']
  emptyText?: string
}

export interface ProConfigProviderCardConfig {
  bordered?: boolean
  shadow?: 'always' | 'hover' | 'never'
  collapsible?: boolean
}

export interface ProConfigProviderListConfig {
  size?: ComponentSize
  layout?: 'list' | 'grid'
  bordered?: boolean
  emptyText?: string
  responseAdapter?: (response: unknown) => ProListRequestResult<object>
  transformParams?: <TParams extends object>(params: TParams) => TParams
  pagination?: ProConfigProviderPaginationConfig
}

export interface ProConfigProviderThemeConfig {
  className?: string
  variables?: Record<string, string | number>
}

export interface ProConfigProviderProps {
  size?: ComponentSize
  namespace?: string
  dark?: boolean
  theme?: ProConfigProviderThemeConfig
  field?: ProConfigProviderFieldConfig
  form?: ProConfigProviderFormConfig
  table?: ProConfigProviderTableConfig
  descriptions?: ProConfigProviderDescriptionsConfig
  card?: ProConfigProviderCardConfig
  list?: ProConfigProviderListConfig
  /**
   * Tree-scoped dictionary registry, keyed by name. Fields declaring
   * `valueEnum: '<name>'` (or `valueEnum: 'dict:<name>'`) resolve against
   * this map first, falling back to the global `registerProDictionary`
   * registry. Local entries override parent entries with the same name.
   */
  dictionaries?: Record<string, ProFieldValueEnum>
}

export type ProConfigProviderContext = Readonly<Ref<ProConfigProviderProps>>
