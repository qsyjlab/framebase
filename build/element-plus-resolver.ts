import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import type { ComponentResolver, ComponentResolverObject } from 'unplugin-vue-components'

/**
 * Keep auto-resolved components on the same Element Plus entry as the
 * components imported explicitly by the library.
 *
 * Mixing `element-plus` and `element-plus/es` can create two optimized
 * module instances in Vite dev mode. Nested components such as ElOption then
 * fail to inject the context provided by ElSelect.
 */
export function createElementPlusResolvers(): ComponentResolver[] {
  return ElementPlusResolver().map(resolver => {
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
