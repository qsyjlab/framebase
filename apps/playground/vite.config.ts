import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { createElementPlusResolvers } from '../../build/element-plus-resolver'

// Vite 8 下 @vitejs/plugin-vue 通过 CJS 加载 vue/compiler-sfc，不再自动注册 TypeScript，
// 导致泛型组件 defineProps<ImportedType>() 无法解析导入类型。
// 通过与插件相同的 CJS 路径注册 TS，确保注册到同一个 compiler-sfc 实例。
const localRequire = createRequire(import.meta.url)
localRequire('vue/compiler-sfc').registerTS(() => localRequire('typescript'))

export default defineConfig({
  plugins: [
    vue(),
    Components({
      dts: false,
      resolvers: [createElementPlusResolvers()]
    })
  ]
})
