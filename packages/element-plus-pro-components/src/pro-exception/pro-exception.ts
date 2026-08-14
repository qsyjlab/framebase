import type { CSSProperties, VNodeChild } from 'vue'

/**
 * Registry interface for exception statuses. Extensible via declaration
 * merging so applications can register custom HTTP-style statuses (e.g.
 * `418`, `502`, `network`) alongside the built-in `403`/`404`/`500`.
 *
 * @example
 * declare module '@framebase/element-plus-pro-components' {
 *   interface ProExceptionStatuses {
 *     '502': true
 *   }
 * }
 */
export interface ProExceptionStatuses {
  '403': true
  '404': true
  '500': true
}

export type ProExceptionStatus = keyof ProExceptionStatuses

export interface ProExceptionAction {
  key: string
  text: string
  type?: 'primary' | 'default'
  icon?: VNodeChild
}

export interface ProExceptionProps {
  status?: ProExceptionStatus
  title?: string
  subTitle?: string
  /** Custom illustration image URL. Falls back to the built-in SVG for the status. */
  illustration?: string
  /** Illustration max width in px. Defaults to 360. */
  illustrationSize?: number | string
  /** Whether to fill the parent height and center content. Defaults to true. */
  fullPage?: boolean
  /** Home route path used by the default "back home" action. */
  homePath?: string
  /** Override the default "back" action text. */
  backText?: string
  /** Override the default "back home" action text. */
  homeText?: string
  /** Override the default "reload" action text. */
  reloadText?: string
  /** Show the "back to previous page" action. Defaults to true. */
  showBack?: boolean
  /** Show the "back home" action. Defaults to true. */
  showHome?: boolean
  /** Show the "reload" action. Defaults to false. */
  showReload?: boolean
  /** Custom action list. When provided, replaces the default back/home/reload actions. */
  actions?: ProExceptionAction[]
  bodyStyle?: CSSProperties
}

export interface ProExceptionSlots {
  illustration?: () => VNodeChild
  title?: () => VNodeChild
  subTitle?: () => VNodeChild
  /** Custom action area. Replaces the default actions. */
  actions?: () => VNodeChild
  /** Extra content rendered between subTitle and actions. */
  default?: () => VNodeChild
}
