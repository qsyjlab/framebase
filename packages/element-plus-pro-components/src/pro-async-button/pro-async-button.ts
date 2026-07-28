import type { ButtonProps } from 'element-plus'

export type ProAsyncFeedbackMessage<TValue> =
  | string
  | false
  | ((value: TValue) => string | false | undefined)

export interface ProAsyncActionContext {
  event?: MouseEvent
  signal: AbortSignal
  source: 'click' | 'api'
}

export type ProAsyncAction<TResult> = (context: ProAsyncActionContext) => TResult | Promise<TResult>

export type ProAsyncButtonProps<TResult = unknown> = Partial<
  Omit<ButtonProps, 'loading' | 'disabled'>
> & {
  action: ProAsyncAction<TResult>
  loading?: boolean
  disabled?: boolean
  autoLoading?: boolean
  preventRepeat?: boolean
  successMessage?: ProAsyncFeedbackMessage<TResult>
  errorMessage?: ProAsyncFeedbackMessage<unknown>
}

export interface ProAsyncButtonExpose<TResult = unknown> {
  execute: () => Promise<TResult>
  cancel: (reason?: unknown) => void
  getLoading: () => boolean
  getError: () => unknown
}

export type ProAsyncButtonInstance<TResult = unknown> = ProAsyncButtonExpose<TResult>
