import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// core 包是框架无关的纯 TS 工具，不依赖 vue 或其他框架。
// lodash-es 作为运行时依赖保持 external，由消费方（@framebase/vue 或用户项目）安装。
const external = new Set(['lodash-es'])

export default defineConfig({
  plugins: [],
  build: {
    copyPublicDir: false,
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es']
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
})
