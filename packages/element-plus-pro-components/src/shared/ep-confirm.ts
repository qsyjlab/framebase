import type { MessageBoxData, ElMessageBoxOptions } from 'element-plus'

export interface EpConfirmOptions extends Omit<ElMessageBoxOptions, 'type'> {
  title?: string
  type?: 'info' | 'success' | 'warning' | 'error'
  confirmButtonText?: string
  cancelButtonText?: string
}

/**
 * 基于 Element Plus ElMessageBox.confirm 的统一封装。
 *
 * 设计要点：
 * 1) 不直接在顶层静态 import ElMessageBox（避免 vitest 环境中 element-plus 的 CSS sideEffects 导致 Unknown file extension ".css"）。
 * 2) 通过 `__epConfirmImpl` 暴露可替换钩子，vitest 可在 beforeEach 里 `vi.stubGlobal('__epConfirmImpl', mock)` 或 `vi.mock` 本文件。
 * 3) 返回值统一：确认 → true，取消/关闭 → false，上层不需要 try/catch。
 */
export let __epConfirmImpl: (
  message: string,
  options?: EpConfirmOptions
) => Promise<boolean> = async (message, options = {}) => {
  const { ElMessageBox } = await import('element-plus')
  try {
    const { title = '提示', type, confirmButtonText, cancelButtonText, ...rest } = options
    await ElMessageBox.confirm(message, title, {
      confirmButtonText: confirmButtonText ?? '确认',
      cancelButtonText: cancelButtonText ?? '取消',
      type: type ?? 'warning',
      distinguishCancelAndClose: true,
      ...rest
    } as any)
    return true
  } catch {
    return false
  }
}

export function epConfirm(message: string, options: EpConfirmOptions = {}): Promise<boolean> {
  return __epConfirmImpl(message, options)
}

export function setEpConfirmImpl(
  impl: (message: string, options?: EpConfirmOptions) => Promise<boolean>
) {
  __epConfirmImpl = impl
}

export type { MessageBoxData }
