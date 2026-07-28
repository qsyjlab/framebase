import { describe, expect, it } from 'vitest'
import { normalizeProConfirmConfig, resolveProConfirmAccess } from '../pro-confirm-button-utils'

describe('pro-confirm-button-utils', () => {
  it('normalizes simple and detailed confirmation configs', () => {
    expect(normalizeProConfirmConfig('确认删除？')).toEqual({
      title: '确认删除？',
      description: undefined,
      mode: 'popconfirm',
      type: 'default',
      confirmText: '确定',
      cancelText: '取消'
    })
    expect(
      normalizeProConfirmConfig({ title: '删除', mode: 'message-box', type: 'danger' })
    ).toEqual(expect.objectContaining({ mode: 'message-box', type: 'danger' }))
  })

  it('resolves hide and disable access behavior', () => {
    expect(resolveProConfirmAccess(false, 'hide')).toEqual({ visible: false, disabled: false })
    expect(resolveProConfirmAccess(false, 'disable')).toEqual({ visible: true, disabled: true })
  })
})
