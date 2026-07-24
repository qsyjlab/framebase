import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: '@framebase/element-plus-theme/style.css',
        replacement: fileURLToPath(
          new URL('../../packages/element-plus-theme/src/index.scss', import.meta.url)
        )
      },
      {
        find: '@framebase/element-plus-pro-components',
        replacement: fileURLToPath(
          new URL('../../packages/element-plus-pro-components/src/index.ts', import.meta.url)
        )
      }
    ]
  }
})
