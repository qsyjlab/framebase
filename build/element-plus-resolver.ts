import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import type { ComponentResolver, ComponentResolverObject } from 'unplugin-vue-components'

export interface ElementPlusResolverOptions {
  /**
   * 是否让解析器为自动导入的组件附带 `element-plus/es/components/<name>/style/css`。
   *
   * - `'css'`（默认）：应用侧使用，样式随组件一起注入。
   * - `false`：**组件库构建必须用它**。库产物一旦带 CSS 副作用导入，
   *   SSR 环境（Node 直接 import ESM）会抛 `ERR_UNKNOWN_FILE_EXTENSION: .css`，
   *   同时也会强制消费方接受 Element Plus 的按需样式，破坏自定义主题。
   */
  importStyle?: 'css' | false
}

/**
 * Keep auto-resolved components on the same Element Plus entry as the
 * components imported explicitly by the library.
 *
 * Mixing `element-plus` and `element-plus/es` can create two optimized
 * module instances in Vite dev mode. Nested components such as ElOption then
 * fail to inject the context provided by ElSelect.
 */
export function createElementPlusResolvers(
  options: ElementPlusResolverOptions = {}
): ComponentResolver[] {
  const { importStyle = 'css' } = options

  return ElementPlusResolver({ importStyle }).map(resolver => {
    const objectResolver = resolver as ComponentResolverObject

    return {
      type: objectResolver.type,
      async resolve(name: string) {
        const result = await objectResolver.resolve(name)

        if (result && typeof result !== 'string' && result.from === 'element-plus/es') {
          return {
            ...result,
            from: 'element-plus'
          }
        }

        return result
      }
    }
  })
}
