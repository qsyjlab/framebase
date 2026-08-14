/**
 * Form state container with initial snapshot, field-level dirty tracking and
 * reset. Built on plain `reactive` so it composes naturally with Element Plus
 * form components via `v-model`.
 *
 * Unlike `useUrlState` (which persists to the URL), this hook keeps an
 * in-memory snapshot for dirty detection and reset-to-initial semantics. For
 * form persistence across routes, layer `useUrlState` or storage on top.
 */
import { reactive, computed, watch, toRaw, type ComputedRef, type DeepReadonly } from 'vue'
import { cloneDeep, isEqual } from 'lodash-es'

export interface UseFormStateOptions {
  /**
   * Deep-watch the state for dirty re-computation. Defaults to `true`.
   * Disable when you manage mutations externally and want to avoid the watch
   * cost.
   */
  watch?: boolean
}

export interface UseFormStateReturn<T extends object> {
  /** Mutable form values. Bind with `v-model` to form controls. */
  values: T
  /** Read-only snapshot of the initial values (cloned at creation). */
  initialValues: DeepReadonly<T>
  /** Whether any field differs from the initial snapshot. */
  isDirty: ComputedRef<boolean>
  /** Per-field dirty flags, keyed by top-level field name. */
  dirtyFields: ComputedRef<Record<string, boolean>>
  /** Replace values wholesale (merged shallowly into the reactive object). */
  setValues: (next: Partial<T>) => void
  /** Reset to the current `initialValues` snapshot. */
  reset: () => void
  /** Update the initial snapshot to the current values (clears dirty state). */
  commit: () => void
}

export function useFormState<T extends object>(
  initial: T,
  options: UseFormStateOptions = {}
): UseFormStateReturn<T> {
  const { watch: shouldWatch = true } = options

  const values = reactive(cloneDeep(initial)) as T
  const initialValues = reactive(cloneDeep(initial)) as T

  const isDirty = computed(() => !isEqual(values, initialValues))

  const dirtyFields = computed(() => {
    const result: Record<string, boolean> = {}
    for (const key of Object.keys(values as Record<string, unknown>)) {
      result[key] = !isEqual(
        (values as Record<string, unknown>)[key],
        (initialValues as Record<string, unknown>)[key]
      )
    }
    return result
  })

  function setValues(next: Partial<T>) {
    Object.assign(values, next)
  }

  function reset() {
    Object.assign(values, cloneDeep(toRaw(initialValues)))
  }

  function commit() {
    Object.assign(initialValues, cloneDeep(toRaw(values)))
  }

  // Touch computeds so they re-evaluate on mutation. The `watch` is cheap
  // because the computeds above already track dependencies.
  if (shouldWatch) {
    watch(
      () => values,
      () => {
        // intentionally empty — triggers reactivity for isDirty / dirtyFields
      },
      { deep: true }
    )
  }

  return {
    values,
    initialValues: initialValues as DeepReadonly<T>,
    isDirty,
    dirtyFields,
    setValues,
    reset,
    commit
  }
}

// --- Pro-prefixed aliases ---

export type UseProFormStateOptions = UseFormStateOptions
export type UseProFormStateReturn<T extends object> = UseFormStateReturn<T>
export { useFormState as useProFormState }
