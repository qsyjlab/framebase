import { defineComponent, h } from 'vue'
import Theme from 'vitepress/theme'
import { useData } from 'vitepress'
import './style.css'

import 'prismjs/themes/prism.css'
import DemoRuntime from '../components/demos/DemoRuntime.vue'

/**
 * iframe 运行时页：frontmatter `demoRuntime: true` 的页面只渲染单个示例，
 * 不带导航/侧栏，也不进入 `.vp-doc` 作用域（VitePress 1.6 无 theme.layouts，只能在此分流）。
 */
const Layout = defineComponent({
  name: 'FramebaseLayout',
  setup() {
    const { frontmatter } = useData()
    return () => (frontmatter.value.demoRuntime ? h(DemoRuntime) : h(Theme.Layout, null, {}))
  }
})

export default {
  extends: Theme,
  Layout,
  async enhanceApp({ app }) {
    if (!import.meta.env.SSR) {
      const ElementPlus = (await import('element-plus')).default
      await import('element-plus/theme-chalk/index.css')
      await import('element-plus/theme-chalk/dark/css-vars.css')

      const Demo = (await import('../components/demos/vp-demo.vue')).default
      const ProComponents = await import('@framebase/element-plus-pro-components')
      await import('@framebase/element-plus-pro-components/style.css')
      await import('@framebase/element-plus-theme/style.css')

      app.component('Demo', Demo)
      app.use(ElementPlus)
      app.use(ProComponents.ProCard)
      app.use(ProComponents.ProStatisticCard)
      app.use(ProComponents.ProCheckCard)
      app.use(ProComponents.ProCheckCardGroup)
      app.use(ProComponents.ProTree)
      app.use(ProComponents.ProTreeSelect)
      app.use(ProComponents.ProSelect)
      app.use(ProComponents.ProRadioGroup)
      app.use(ProComponents.ProCheckboxGroup)
      app.use(ProComponents.ProConfigProvider)
      app.use(ProComponents.ProDescriptions)
      app.use(ProComponents.ProField)
      app.use(ProComponents.ProForm)
      app.use(ProComponents.ProModalForm)
      app.use(ProComponents.ProDrawerForm)
      app.use(ProComponents.ProDragSortTable)
      app.use(ProComponents.ProStepsForm)
      app.use(ProComponents.ProPreviewFile)
      app.use(ProComponents.ProUpload)
      app.use(ProComponents.ProUploadList)
      app.use(ProComponents.ProTable)
      app.use(ProComponents.ProEditableTable)
      app.use(ProComponents.ProList)
      app.use(ProComponents.ProEmpty)
      app.use(ProComponents.ProResult)
    }
  }
}
