import { describe, expect, it, vi } from 'vitest'
import { nextTick, watchEffect } from 'vue'
import { useFormState } from '../index'

describe('useFormState', () => {
  it('初始化时不脏', () => {
    const { isDirty, dirtyFields } = useFormState({ name: '', age: 0 })
    expect(isDirty.value).toBe(false)
    expect(dirtyFields.value).toEqual({ name: false, age: false })
  })

  it('修改字段后 isDirty=true 且 dirtyFields 标记变更字段', async () => {
    const { values, isDirty, dirtyFields } = useFormState({ name: 'Ada', age: 30 })
    values.name = 'Bob'
    await nextTick()
    expect(isDirty.value).toBe(true)
    expect(dirtyFields.value).toEqual({ name: true, age: false })
  })

  it('reset 恢复到初始快照', async () => {
    const { values, isDirty, reset } = useFormState({ name: 'Ada', age: 30 })
    values.name = 'Bob'
    values.age = 40
    await nextTick()
    expect(isDirty.value).toBe(true)

    reset()
    await nextTick()
    expect(values.name).toBe('Ada')
    expect(values.age).toBe(30)
    expect(isDirty.value).toBe(false)
  })

  it('commit 将当前值固化为新初始值', async () => {
    const { values, initialValues, isDirty, commit, reset } = useFormState({
      name: 'Ada',
      age: 30
    })
    values.name = 'Bob'
    await nextTick()
    expect(isDirty.value).toBe(true)

    commit()
    await nextTick()
    expect(isDirty.value).toBe(false)
    expect((initialValues as { name: string }).name).toBe('Bob')

    reset()
    expect(values.name).toBe('Bob') // 已固化为新初始值
  })

  it('setValues 批量更新', async () => {
    const { values, setValues } = useFormState({ name: '', age: 0 })
    setValues({ name: 'Ada', age: 30 })
    await nextTick()
    expect(values.name).toBe('Ada')
    expect(values.age).toBe(30)
  })

  it('initialValues 与 values 初始独立（深拷贝）', () => {
    const initial = { nested: { a: 1 } }
    const { values, initialValues } = useFormState(initial)
    values.nested.a = 2
    expect((initialValues as { nested: { a: number } }).nested.a).toBe(1)
    expect(initial.nested.a).toBe(1) // 外部原始对象不受影响
  })

  it('改回原值后 isDirty 恢复 false', async () => {
    const { values, isDirty } = useFormState({ name: 'Ada' })
    values.name = 'Bob'
    await nextTick()
    expect(isDirty.value).toBe(true)

    values.name = 'Ada'
    await nextTick()
    expect(isDirty.value).toBe(false)
  })

  it('watch=false 时不自动监听（仍可通过访问 computed 触发）', async () => {
    const { values, isDirty } = useFormState({ name: '' }, { watch: false })
    values.name = 'x'
    await nextTick()
    // computed 仍会在被访问时重新计算
    expect(isDirty.value).toBe(true)
  })

  it('嵌套对象的脏检测', async () => {
    const { values, isDirty, dirtyFields } = useFormState({
      profile: { name: 'Ada', tags: ['a'] }
    })
    values.profile.tags.push('b')
    await nextTick()
    expect(isDirty.value).toBe(true)
    expect(dirtyFields.value.profile).toBe(true)
  })

  it('响应式：isDirty 变化触发 watch', async () => {
    const { values, isDirty } = useFormState({ name: '' })
    const spy = vi.fn()
    const stop = watchEffect(() => {
      void isDirty.value
      spy()
    })
    values.name = 'x'
    await nextTick()
    expect(spy).toHaveBeenCalled()
    stop()
  })
})
