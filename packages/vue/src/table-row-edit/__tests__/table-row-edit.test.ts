import { describe, expect, it, vi } from 'vitest'
import { useTableRowEdit } from '../index'

describe('useTableRowEdit', () => {
  it('初始状态 editingKey 为 null', () => {
    const { editingKey, isEditingAny } = useTableRowEdit()
    expect(editingKey.value).toBeNull()
    expect(isEditingAny.value).toBe(false)
  })

  it('startEdit 设置 editingKey', () => {
    const { editingKey, isEditingAny, startEdit, isEditing } = useTableRowEdit()
    startEdit(1)
    expect(editingKey.value).toBe(1)
    expect(isEditingAny.value).toBe(true)
    expect(isEditing(1)).toBe(true)
    expect(isEditing(2)).toBe(false)
  })

  it('startEdit 新行自动结束旧行', () => {
    const { editingKey, startEdit } = useTableRowEdit()
    startEdit(1)
    expect(editingKey.value).toBe(1)
    startEdit(2)
    expect(editingKey.value).toBe(2)
  })

  it('startEdit 同一行不触发回调', () => {
    const onStart = vi.fn()
    const { startEdit } = useTableRowEdit({ onStart })
    startEdit(1)
    startEdit(1)
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('stopEdit 无参结束当前编辑行', () => {
    const { editingKey, isEditingAny, startEdit, stopEdit } = useTableRowEdit()
    startEdit(1)
    stopEdit()
    expect(editingKey.value).toBeNull()
    expect(isEditingAny.value).toBe(false)
  })

  it('stopEdit 传 key 仅当匹配时结束', () => {
    const { editingKey, startEdit, stopEdit } = useTableRowEdit()
    startEdit(1)
    stopEdit(2)
    expect(editingKey.value).toBe(1)
    stopEdit(1)
    expect(editingKey.value).toBeNull()
  })

  it('toggleEdit 切换编辑态', () => {
    const { editingKey, toggleEdit } = useTableRowEdit()
    toggleEdit(1)
    expect(editingKey.value).toBe(1)
    toggleEdit(1)
    expect(editingKey.value).toBeNull()
  })

  it('onStart / onEnd 回调触发', () => {
    const onStart = vi.fn()
    const onEnd = vi.fn()
    const { startEdit, stopEdit } = useTableRowEdit({ onStart, onEnd })
    startEdit(1)
    expect(onStart).toHaveBeenCalledWith(1)
    startEdit(2)
    expect(onEnd).toHaveBeenCalledWith(1)
    expect(onStart).toHaveBeenCalledWith(2)
    stopEdit()
    expect(onEnd).toHaveBeenCalledWith(2)
  })

  it('stopEdit 空闲时不触发 onEnd', () => {
    const onEnd = vi.fn()
    const { stopEdit } = useTableRowEdit({ onEnd })
    stopEdit()
    expect(onEnd).not.toHaveBeenCalled()
  })

  it('支持 string key', () => {
    const { editingKey, isEditing, startEdit } = useTableRowEdit<string>()
    startEdit('row-a')
    expect(editingKey.value).toBe('row-a')
    expect(isEditing('row-a')).toBe(true)
  })
})
