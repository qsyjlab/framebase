import type { ProAsyncButtonProps, ProAsyncButtonExpose } from '../pro-async-button'

export type ProConfirmMode = 'popconfirm' | 'message-box'
export type ProConfirmType = 'default' | 'warning' | 'danger'

export interface ProConfirmConfig {
  title: string
  description?: string
  mode?: ProConfirmMode
  type?: ProConfirmType
  confirmText?: string
  cancelText?: string
}

export type ProConfirmButtonProps<TResult = unknown> = ProAsyncButtonProps<TResult> & {
  confirm: string | ProConfirmConfig
  access?: boolean
  deniedBehavior?: 'hide' | 'disable'
  deniedReason?: string
}

export type ProConfirmButtonExpose<TResult = unknown> = ProAsyncButtonExpose<TResult>
export type ProConfirmButtonInstance<TResult = unknown> = ProConfirmButtonExpose<TResult>
