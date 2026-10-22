import { reactive } from 'vue'
import { createProLayoutStore, defaultLayoutConfig } from '@framebase/element-plus-pro-components'

// 项目持有配置和实例，切换页面或卸载 Layout 都不会丢失设置。
const config = reactive({ ...defaultLayoutConfig(), headerHeight: 48, tabHeight: 30 })
const layout = createProLayoutStore({ config, syncDocumentTheme: false })
const projectStore = reactive({ layout, layoutConfig: config })

export function useProjectLayoutStore() {
  return projectStore
}
