import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useValueEnum, type ValueEnum } from '../index'

describe('useValueEnum', () => {
  it('Record 形式：options 标准化', () => {
    const { options } = useValueEnum({ active: '启用', disabled: '禁用' })
    expect(options.value).toEqual([
      { label: '启用', value: 'active', disabled: undefined },
      { label: '禁用', value: 'disabled', disabled: undefined }
    ])
  })

  it('对象项：携带 type / color / disabled', () => {
    const { options } = useValueEnum({
      active: { text: '启用', type: 'success' },
      banned: { text: '封禁', type: 'danger', disabled: true }
    })
    expect(options.value).toEqual([
      { label: '启用', value: 'active', disabled: undefined },
      { label: '封禁', value: 'banned', disabled: true }
    ])
  })

  it('Map 形式：支持非 string key', () => {
    const { options } = useValueEnum(
      new Map([
        [1, '一'],
        [2, '二']
      ])
    )
    expect(options.value).toEqual([
      { label: '一', value: 1, disabled: undefined },
      { label: '二', value: 2, disabled: undefined }
    ])
  })

  it('getText 按值查文本', () => {
    const { getText } = useValueEnum({ active: '启用', disabled: '禁用' })
    expect(getText('active')).toBe('启用')
    expect(getText('disabled')).toBe('禁用')
    expect(getText('unknown')).toBe('')
  })

  it('getItem 返回完整项（含 type/color）', () => {
    const { getItem } = useValueEnum({
      active: { text: '启用', type: 'success', color: '#52c41a' }
    })
    const item = getItem('active')
    expect(item).toEqual({ text: '启用', type: 'success', color: '#52c41a' })
  })

  it('null / undefined 值返回空', () => {
    const { getText, getItem } = useValueEnum({ a: 'A' })
    expect(getText(null)).toBe('')
    expect(getText(undefined)).toBe('')
    expect(getItem(null)).toBeUndefined()
  })

  it('undefined enum 返回空 options', () => {
    const { options, getText } = useValueEnum(undefined)
    expect(options.value).toEqual([])
    expect(getText('a')).toBe('')
  })

  it('响应式：enum 变化时 options 重新计算', () => {
    const enumRef = ref<ValueEnum>({ a: 'A' })
    const { options, getText } = useValueEnum(enumRef)
    expect(options.value).toHaveLength(1)

    enumRef.value = { a: 'A', b: 'B' }
    expect(options.value).toHaveLength(2)
    expect(getText('b')).toBe('B')
  })

  it('getter 形式输入', () => {
    const { options } = useValueEnum(() => ({ x: 'X' }))
    expect(options.value).toEqual([{ label: 'X', value: 'x', disabled: undefined }])
  })

  it('数字简写形式', () => {
    const { options, getText } = useValueEnum({ 1: '是', 0: '否' })
    expect(getText('1')).toBe('是')
    expect(getText(0)).toBe('否') // 通过 String(value) 索引
    expect(options.value).toHaveLength(2)
  })
})
