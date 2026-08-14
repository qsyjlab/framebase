import type { CSSProperties, VNodeChild } from 'vue'

/**
 * Registry interface for empty statuses. Extensible via declaration merging so
 * applications can register custom statuses (e.g. `loading`, `no-permission`).
 */
export interface ProEmptyStatuses {
  empty: true
  search: true
  error: true
  forbidden: true
}

export type ProEmptyStatus = keyof ProEmptyStatuses

export interface ProEmptyProps {
  status?: ProEmptyStatus
  title?: string
  description?: string
  image?: string
  imageSize?: number | string
  compact?: boolean
  actionText?: string
  secondaryActionText?: string
  bodyStyle?: CSSProperties
}

export interface ProEmptySlots {
  image?: () => VNodeChild
  title?: () => VNodeChild
  description?: () => VNodeChild
  extra?: () => VNodeChild
}
