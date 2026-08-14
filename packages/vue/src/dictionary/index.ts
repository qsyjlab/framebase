/**
 * Tree-scoped dictionary registry via provide/inject.
 *
 * `@framebase/vue` is framework-agnostic and cannot depend on
 * `@framebase/element-plus-pro-components`. This module defines the injection
 * primitive; `ProConfigProvider` bridges its `dictionaries` prop into this key
 * so `useDictionary(name)` resolves against the provider tree.
 *
 * Resolution order: `provideDictionaries` (nearest ancestor) → `undefined`.
 * For app-wide dictionaries registered at bootstrap, pro-components exposes
 * `registerProDictionary` — that global registry sits beneath this inject
 * layer and is consulted by `ProField` directly.
 */
import {
  computed,
  inject,
  provide,
  toValue,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
  type Ref
} from 'vue'
import { useValueEnum, type ValueEnum, type UseValueEnumReturn } from '../value-enum'

export type DictionaryRegistry = Record<string, ValueEnum>

export const dictionaryKey: InjectionKey<Ref<DictionaryRegistry>> = Symbol('framebase-dictionaries')

/**
 * Inject the nearest dictionary registry. Returns an empty registry when no
 * ancestor has provided one, so `useDictionary` always has a stable source.
 */
export function useDictionaries(): Readonly<Ref<DictionaryRegistry>> {
  return inject(
    dictionaryKey,
    computed(() => ({}))
  )
}

/**
 * Provide a dictionary registry to descendants. Merges with the parent
 * registry (current entries override parent entries with the same name).
 */
export function provideDictionaries(
  dictionaries: MaybeRefOrGetter<DictionaryRegistry | undefined>
): Readonly<Ref<DictionaryRegistry>> {
  const parent = useDictionaries()
  const merged = computed<DictionaryRegistry>(() => ({
    ...parent.value,
    ...(toValue(dictionaries) ?? {})
  }))
  provide(dictionaryKey, merged)
  return merged
}

export interface UseDictionaryOptions {
  /** Value when the dictionary name is not found. Defaults to `undefined`. */
  fallback?: ValueEnum
}

export interface UseDictionaryReturn extends UseValueEnumReturn {
  /** Whether the named dictionary exists in the registry. */
  exists: ComputedRef<boolean>
  /** The resolved enum (reactive). */
  enumValue: ComputedRef<ValueEnum | undefined>
}

/**
 * Resolve a named dictionary from the provider tree and expose it as a
 * `useValueEnum`. Pair with `provideDictionaries` (or `ProConfigProvider`'s
 * `dictionaries` prop) to feed dictionaries into the tree.
 */
export function useDictionary(
  name: MaybeRefOrGetter<string>,
  options: UseDictionaryOptions = {}
): UseDictionaryReturn {
  const { fallback } = options
  const registry = useDictionaries()

  const enumValue = computed<ValueEnum | undefined>(() => {
    const n = toValue(name)
    return registry.value[n] ?? fallback
  })

  const exists = computed(() => enumValue.value !== undefined)
  const valueEnum = useValueEnum(enumValue)

  return { ...valueEnum, exists, enumValue }
}

// --- Pro-prefixed aliases ---

export type UseProDictionaryOptions = UseDictionaryOptions
export type UseProDictionaryReturn = UseDictionaryReturn
export { useDictionary as useProDictionary, provideDictionaries as provideProDictionaries }
