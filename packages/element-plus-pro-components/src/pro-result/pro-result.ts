import type { CSSProperties, VNodeChild } from 'vue'

/**
 * Registry interface for result statuses. Extensible via declaration merging so
 * applications can register custom error-page statuses.
 */
export interface ProResultStatuses {
  success: true
  error: true
  warning: true
  info: true
  '403': true
  '404': true
  '500': true
}

export type ProResultStatus = keyof ProResultStatuses

export interface ProResultProps {
  status?: ProResultStatus
  title?: string
  subTitle?: string
  primaryText?: string
  secondaryText?: string
  bodyStyle?: CSSProperties
}

export interface ProResultSlots {
  icon?: () => VNodeChild
  title?: () => VNodeChild
  subTitle?: () => VNodeChild
  extra?: () => VNodeChild
  default?: () => VNodeChild
}
