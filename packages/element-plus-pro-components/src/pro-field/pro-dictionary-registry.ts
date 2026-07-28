import { shallowReactive } from 'vue'
import type { ProFieldValueEnum } from './pro-field'

/**
 * Global dictionary registry.
 *
 * Dictionaries registered here are resolved whenever a field declares
 * `valueEnum` as a dictionary name string (e.g. `valueEnum: 'gender'` or
 * `valueEnum: 'dict:gender'`). They are app-wide and sit beneath any
 * `ProConfigProvider.dictionaries` overrides in the resolution order:
 *
 *   `props.valueEnum` (Record/Map)  >  provider `dictionaries[name]`  >  registry
 *
 * For tree-scoped dictionaries prefer `ProConfigProvider.dictionaries`;
 * for one-time app bootstrap (e.g. dictionaries fetched at startup) use
 * `registerProDictionary`.
 */
const dictionaryRegistry = shallowReactive(new Map<string, ProFieldValueEnum>())

/**
 * Register a dictionary under `name`. Returns a cleanup function that
 * restores the previous binding (or removes it), mirroring `registerProField`.
 */
export function registerProDictionary(name: string, valueEnum: ProFieldValueEnum): () => void {
  const previous = dictionaryRegistry.get(name)
  dictionaryRegistry.set(name, valueEnum)

  return () => {
    if (dictionaryRegistry.get(name) !== valueEnum) return
    if (previous) dictionaryRegistry.set(name, previous)
    else dictionaryRegistry.delete(name)
  }
}

export function unregisterProDictionary(name: string): boolean {
  return dictionaryRegistry.delete(name)
}

export function getProDictionary(name: string): ProFieldValueEnum | undefined {
  return dictionaryRegistry.get(name)
}

export function hasProDictionary(name: string): boolean {
  return dictionaryRegistry.has(name)
}
