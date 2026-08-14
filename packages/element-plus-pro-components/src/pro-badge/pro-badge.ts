import type { CSSProperties, VNodeChild } from 'vue'
import type { ProStatusTone } from '../pro-status'

export type ProBadgePlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

export interface ProBadgeProps {
  value?: string | number
  max?: number
  dot?: boolean
  hidden?: boolean
  showZero?: boolean
  pulse?: boolean
  tone?: ProStatusTone
  color?: string
  offset?: [number, number]
  placement?: ProBadgePlacement
  badgeStyle?: CSSProperties
  badgeClass?: string
}

export interface ProBadgeSlots {
  default?: () => VNodeChild
  content?: () => VNodeChild
}
