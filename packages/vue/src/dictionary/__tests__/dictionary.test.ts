// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, ref } from 'vue'
import { provideDictionaries, useDictionary, useDictionaries } from '../index'

/**
 * provide/inject 设计为父→子传递。用父组件 provide + 子组件 inject 的真实
 * 组件树结构测试，避免在同一 setup 内 provide 后立即 inject 的边界问题。
 */
function mountTree(parentSetup: () => void, childAssert: () => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const Child = defineComponent({
      setup() {
        try {
          childAssert()
          resolve()
        } catch (e) {
          reject(e)
        }
        return () => h('div')
      }
    })
    const Parent = defineComponent({
      setup() {
        parentSetup()
        return () => h(Child)
      }
    })
    const app = createApp(Parent)
    const container = document.createElement('div')
    app.mount(container)
    app.unmount()
  })
}

describe('useDictionary', () => {
  it('无 provide 时子组件 useDictionaries 返回空注册表', async () => {
    await mountTree(
      () => {},
      () => {
        const registry = useDictionaries()
        expect(registry.value).toEqual({})
      }
    )
  })

  it('provideDictionaries 注入，子组件可读', async () => {
    await mountTree(
      () => {
        provideDictionaries({ gender: { m: '男', f: '女' } })
      },
      () => {
        const registry = useDictionaries()
        expect(registry.value).toEqual({ gender: { m: '男', f: '女' } })
      }
    )
  })

  it('provideDictionaries 嵌套：祖父→父→子，子层覆盖同名', async () => {
    const GrandChild = defineComponent({
      setup() {
        const registry = useDictionaries()
        expect(registry.value).toEqual({ a: { x: '1' }, b: { z: '3' }, c: { w: '4' } })
        return () => h('div')
      }
    })
    const Middle = defineComponent({
      setup() {
        provideDictionaries({ b: { z: '3' }, c: { w: '4' } })
        return () => h(GrandChild)
      }
    })
    const Root = defineComponent({
      setup() {
        provideDictionaries({ a: { x: '1' }, b: { y: '2' } })
        return () => h(Middle)
      }
    })
    await new Promise<void>(resolve => {
      const app = createApp({
        setup() {
          return () => h(Root)
        }
      })
      const container = document.createElement('div')
      // GrandChild setup resolve 在 mount 同步阶段触发
      setTimeout(resolve, 0)
      app.mount(container)
      app.unmount()
    })
  })

  it('useDictionary 解析命中的字典', async () => {
    await mountTree(
      () => provideDictionaries({ status: { active: '启用', disabled: '禁用' } }),
      () => {
        const { options, getText, exists } = useDictionary('status')
        expect(exists.value).toBe(true)
        expect(options.value).toHaveLength(2)
        expect(getText('active')).toBe('启用')
      }
    )
  })

  it('useDictionary 未命中时 exists=false', async () => {
    await mountTree(
      () => provideDictionaries({}),
      () => {
        const { exists, options } = useDictionary('nope')
        expect(exists.value).toBe(false)
        expect(options.value).toEqual([])
      }
    )
  })

  it('useDictionary fallback 兜底', async () => {
    await mountTree(
      () => provideDictionaries({}),
      () => {
        const { exists, getText } = useDictionary('nope', { fallback: { a: 'A' } })
        expect(exists.value).toBe(true)
        expect(getText('a')).toBe('A')
      }
    )
  })

  it('useDictionary 响应式 name', async () => {
    await mountTree(
      () => provideDictionaries({ a: { x: '1' }, b: { y: '2' } }),
      () => {
        const name = ref('a')
        const { getText } = useDictionary(name)
        expect(getText('x')).toBe('1')
        name.value = 'b'
        expect(getText('y')).toBe('2')
      }
    )
  })
})
