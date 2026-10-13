import { computed, inject } from 'vue'
import { proLayoutStoreKey } from './use-pro-layout'
import { proLayoutThemeBindingKey, resolveProLayoutThemeVars } from './theme'

export function useSurfaceStyle() {
  const store = inject(proLayoutStoreKey, undefined)
  const binding = inject(proLayoutThemeBindingKey, undefined)
  return computed(() =>
    store && binding?.value !== false ? resolveProLayoutThemeVars(store.config) : {}
  )
}
