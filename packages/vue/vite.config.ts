import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// vue 包将 @framebase/core 源码打包进 dist（core 不单独发版）。
// vue / vue-router / lodash-es 作为外部依赖（lodash-es 是 core 运行时依赖，由用户安装）。
const external = new Set(['vue', 'vue-router', 'lodash-es'])

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
