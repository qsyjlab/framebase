import { fileURLToPath, URL } from 'node:url'
import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import ElementPlusStyles from 'unplugin-element-plus/vite'
import Components from 'unplugin-vue-components/vite'
import { createElementPlusResolvers } from '../../build/element-plus-resolver'

// Vite 8 下 @vitejs/plugin-vue 通过 CJS 加载 vue/compiler-sfc，不再自动注册 TypeScript，
// 导致泛型组件 defineProps<ImportedType>() 无法解析导入类型。
// 通过与插件相同的 CJS 路径注册 TS，确保注册到同一个 compiler-sfc 实例。
const localRequire = createRequire(import.meta.url)
localRequire('vue/compiler-sfc').registerTS(() => localRequire('typescript'))

const external = new Set([
  'vue',
  'vue-router',
  'element-plus',
  '@element-plus/icons-vue',
  'dayjs',
  'lodash-es',
  'sortablejs'
])

export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    vueJsx(),
    Components({
      dts: false,
      resolvers: [createElementPlusResolvers()]
    }),
    ElementPlusStyles({
      // Directive styles are already supplied by ElementPlusResolver using
      // their real component names (loading, popover and infinite-scroll).
      ignoreComponents: ['LoadingDirective', 'PopoverDirective', 'InfiniteScroll']
    })
  ],
  // `@framebase/core` is a workspace package. During build we resolve to its
  // emitted dist (via tsconfig paths + node_modules); during dev/test we alias
  // to source so HMR and vitest pick up edits without a rebuild.
  resolve: {
    alias:
      command === 'build'
        ? {}
        : {
            '@framebase/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url))
          }
  },
  build: {
    copyPublicDir: false,
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      cssFileName: 'style'
    },
    rolldownOptions: {
      external: id => external.has(id) || [...external].some(name => id.startsWith(`${name}/`)),
      output: {
        dir: fileURLToPath(new URL('./dist/es', import.meta.url)),
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        preserveModules: true,
        preserveModulesRoot: fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
}))
