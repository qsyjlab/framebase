import { describe, expect, it } from 'vitest'
import {
  getProStatusMeta,
  resolveProStatusColors,
  resolveProStatusTagColors
} from '../pro-status-utils'

describe('pro-status-utils', () => {
  it('resolves semantic and custom colors', () => {
    expect(resolveProStatusColors('success').foreground).toContain('--el-color-success')
    expect(resolveProStatusColors('default', '#722ed1')).toEqual({
      foreground: '#722ed1',
      background: 'color-mix(in srgb, #722ed1 10%, transparent)',
      border: 'color-mix(in srgb, #722ed1 30%, transparent)',
      dot: '#722ed1'
    })
  })

  it('resolves value enum records and maps', () => {
    expect(getProStatusMeta({ running: { text: '运行中', tone: 'success' } }, 'running')).toEqual({
      text: '运行中',
      tone: 'success'
    })
    expect(getProStatusMeta(new Map([[1, '启用']]), 1)).toEqual({ text: '启用' })
  })

  it('resolves tag effects', () => {
    const colors = resolveProStatusColors('danger')
    expect(resolveProStatusTagColors(colors, 'plain').backgroundColor).toBe('transparent')
    expect(resolveProStatusTagColors(colors, 'dark').color).toContain('--el-color-white')
  })
})
