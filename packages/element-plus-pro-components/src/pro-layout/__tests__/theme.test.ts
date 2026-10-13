// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { effectScope, reactive, shallowRef } from 'vue'
import { bindProLayoutTheme, useProLayoutTheme } from '../theme'
import { defaultLayoutConfig } from '../types'

const cleanups: (() => void)[] = []
afterEach(() =>
  cleanups
    .splice(0)
    .reverse()
    .forEach(cleanup => cleanup())
)

describe('ProLayout 主题外部绑定', () => {
  it('同一份响应式配置同步到 html，深浅切换后不残留深色，停止时恢复原内联样式', () => {
    const html = document.documentElement
    const originalStyle = html.getAttribute('style')
    cleanups.push(() => {
      if (originalStyle === null) html.removeAttribute('style')
      else html.setAttribute('style', originalStyle)
    })
    html.style.setProperty('--el-color-primary', '#123456', 'important')
    html.style.setProperty('--project-token', 'preserved')
    const originalClass = html.className
    const before = html.getAttribute('style')
    const config = reactive(defaultLayoutConfig())
    const binding = bindProLayoutTheme(config)
    cleanups.push(binding.stop)
    config.theme = 'dark'
    config.themeColor = '#7c4dff'
    expect(html.style.getPropertyValue('--el-color-primary')).toBe('#7c4dff')
    expect(html.style.getPropertyValue('--el-bg-color')).toBe('#172036')
    expect(html.style.getPropertyValue('--framebase-table-header-bg')).toBe(
      'var(--el-fill-color-lighter)'
    )
    expect(html.style.getPropertyValue('color-scheme')).toBe('dark')
    expect(html.className).toBe(originalClass)
    config.theme = 'light'
    expect(html.style.getPropertyValue('--el-bg-color')).toBe('#ffffff')
    expect(html.style.getPropertyValue('color-scheme')).toBe('light')
    expect(binding.themeVars.value['--el-bg-color']).toBe('#ffffff')
    binding.stop()
    expect(html.getAttribute('style')).toBe(before)
    expect(html.style.getPropertyPriority('--el-color-primary')).toBe('important')
  })

  it('目标 ref 从未挂载到换容器、关闭绑定、scope 销毁均清理旧目标', () => {
    const first = document.createElement('div')
    const second = document.createElement('div')
    const target = shallowRef<HTMLElement>()
    const config = reactive(defaultLayoutConfig())
    const scope = effectScope()
    cleanups.push(() => scope.stop())
    scope.run(() => bindProLayoutTheme(() => config, target))
    target.value = first
    expect(first.style.getPropertyValue('--el-color-primary')).toBe(config.themeColor)
    target.value = second
    expect(first.style.length).toBe(0)
    expect(second.style.getPropertyValue('--el-color-primary')).toBe(config.themeColor)
    target.value = undefined
    expect(second.style.length).toBe(0)
    target.value = first
    scope.stop()
    expect(first.style.length).toBe(0)
  })

  it('停止绑定不覆盖项目随后接管的变量或无关样式', () => {
    const element = document.createElement('div')
    const binding = bindProLayoutTheme(defaultLayoutConfig(), element)
    element.style.setProperty('--el-color-primary', '#abcdef', 'important')
    element.style.padding = '10px'
    binding.stop()
    expect(element.style.getPropertyValue('--el-color-primary')).toBe('#abcdef')
    expect(element.style.getPropertyPriority('--el-color-primary')).toBe('important')
    expect(element.style.padding).toBe('10px')
    expect(element.style.getPropertyValue('--el-bg-color')).toBe('')
  })

  it('手动 style 绑定的 computed 跟随配置对象替换，可叠加项目自定义变量', () => {
    const config = shallowRef(defaultLayoutConfig())
    const vars = useProLayoutTheme(config)
    config.value = { ...config.value, theme: 'dark', themeColor: '#13c2c2' }
    const projectVars = { ...vars.value, '--el-bg-color': '#112233' }
    expect(projectVars['--el-color-primary']).toBe('#13c2c2')
    expect(projectVars['--el-bg-color']).toBe('#112233')
    expect(vars.value['--el-bg-color']).toBe('#172036')
  })
})
