import { describe, expect, it } from 'vitest'
import { useFieldArray } from '../index'

describe('useFieldArray', () => {
  it('初始化包装初始值', () => {
    const { fields, values, length } = useFieldArray([{ a: 1 }, { a: 2 }])
    expect(fields.value).toHaveLength(2)
    expect(fields.value[0].key).toBe(1)
    expect(fields.value[1].key).toBe(2)
    expect(values.value).toEqual([{ a: 1 }, { a: 2 }])
    expect(length.value).toBe(2)
  })

  it('append 追加并返回长度', () => {
    const { fields, append } = useFieldArray<{ a: number }>([{ a: 1 }])
    const len = append({ a: 2 })
    expect(len).toBe(2)
    expect(fields.value[1].value).toEqual({ a: 2 })
    expect(fields.value[1].key).toBe(2)
  })

  it('append 无参时用 defaultItem', () => {
    const { fields, append } = useFieldArray<Record<string, unknown>>([], {
      defaultItem: () => ({ x: 0 })
    })
    append()
    expect(fields.value[0].value).toEqual({ x: 0 })
  })

  it('insert 在指定位置插入', () => {
    const { fields, insert } = useFieldArray([1, 3])
    insert(1, 2)
    expect(fields.value.map(f => f.value)).toEqual([1, 2, 3])
    // key 单调递增
    expect(fields.value[1].key).toBe(3)
  })

  it('remove 移除并返回被移除的值', () => {
    const { fields, remove } = useFieldArray([1, 2, 3])
    const removed = remove(1)
    expect(removed).toBe(2)
    expect(fields.value.map(f => f.value)).toEqual([1, 3])
  })

  it('remove 越界返回 undefined', () => {
    const { remove } = useFieldArray([1])
    expect(remove(5)).toBeUndefined()
    expect(remove(-1)).toBeUndefined()
  })

  it('move 移动元素', () => {
    const { fields, move } = useFieldArray(['a', 'b', 'c', 'd'])
    move(0, 2)
    expect(fields.value.map(f => f.value)).toEqual(['b', 'c', 'a', 'd'])
    // key 跟随移动，不重新生成
    expect(fields.value[2].key).toBe(1)
  })

  it('move 越界空操作', () => {
    const { fields, move } = useFieldArray(['a', 'b'])
    move(0, 5)
    move(-1, 0)
    move(0, 0)
    expect(fields.value.map(f => f.value)).toEqual(['a', 'b'])
  })

  it('replace 保留原 key', () => {
    const { fields, replace } = useFieldArray([1, 2, 3])
    const oldKey = fields.value[1].key
    replace(1, 99)
    expect(fields.value[1].value).toBe(99)
    expect(fields.value[1].key).toBe(oldKey)
  })

  it('setAll 整体替换', () => {
    const { fields, setAll } = useFieldArray([1, 2])
    setAll([3, 4, 5])
    expect(fields.value.map(f => f.value)).toEqual([3, 4, 5])
  })

  it('clear 清空', () => {
    const { fields, clear } = useFieldArray([1, 2, 3])
    clear()
    expect(fields.value).toHaveLength(0)
  })

  it('reset 恢复到初始值', () => {
    const { fields, append, reset } = useFieldArray([1, 2])
    append(3)
    append(4)
    expect(fields.value).toHaveLength(4)
    reset()
    expect(fields.value.map(f => f.value)).toEqual([1, 2])
  })

  it('key 在不同操作间单调递增且不重用', () => {
    const { fields, append, remove } = useFieldArray<number>([])
    append(1) // key 1
    append(2) // key 2
    append(3) // key 3
    remove(0) // 移除 key 1
    append(4) // key 4，不重用 1
    const keys = fields.value.map(f => f.key)
    expect(keys).toEqual([2, 3, 4])
  })

  it('值深拷贝，与外部源独立', () => {
    const source = { a: 1 }
    const { fields, append } = useFieldArray<typeof source>([])
    append(source)
    source.a = 99
    expect(fields.value[0].value.a).toBe(1)
  })
})
