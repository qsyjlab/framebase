import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// vue 包以 vue / vue-router / @framebase/core 作为外部依赖。
const external = new Set(['vue', 'vue-router', '@framebase/core'])

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
