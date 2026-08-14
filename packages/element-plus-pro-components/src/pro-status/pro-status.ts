import type { Component, VNodeChild } from 'vue'

/**
 * Registry interface for status tones. Extensible via declaration merging so
 * applications can register custom semantic tones.
 */
export interface ProStatusTones {
  default: true
  primary: true
  processing: true
  success: true
  warning: true
  danger: true
  info: true
}

export type ProStatusTone = keyof ProStatusTones

export type ProStatusVariant = 'dot' | 'tag' | 'text'
export type ProStatusEffect = 'light' | 'plain' | 'dark'

export interface ProStatusColors {
  foreground?: string
  background?: string
  border?: string
  dot?: string
}

export type ProStatusColor = string | ProStatusColors

export interface ProStatusMeta {
  text?: string
  tone?: ProStatusTone
  color?: ProStatusColor
  icon?: Component
  pulse?: boolean
}

export type ProStatusValueEnum<TValue extends PropertyKey = PropertyKey> =
  | Partial<Record<TValue, string | ProStatusMeta>>
  | Map<TValue, string | ProStatusMeta>

export interface ProStatusRenderContext<TValue extends PropertyKey = PropertyKey> {
  value?: TValue | null
  text: string
  tone: ProStatusTone
  variant: ProStatusVariant
  colors: Required<ProStatusColors>
  meta?: ProStatusMeta
}

export interface ProStatusProps<TValue extends PropertyKey = PropertyKey> {
  value?: TValue | null
  valueEnum?: ProStatusValueEnum<TValue>
  text?: string
  tone?: ProStatusTone
  variant?: ProStatusVariant
  effect?: ProStatusEffect
  size?: 'small' | 'default' | 'large'
  color?: ProStatusColor
  icon?: Component
  pulse?: boolean
  emptyText?: string
  live?: 'off' | 'polite' | 'assertive'
}

export interface ProStatusSlots<TValue extends PropertyKey = PropertyKey> {
  default?: (context: ProStatusRenderContext<TValue>) => VNodeChild
  icon?: (context: ProStatusRenderContext<TValue>) => VNodeChild
}
