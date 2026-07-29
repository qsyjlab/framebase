/**
 * Table row inline-edit state: track which row is being edited.
 *
 * Single-row edit model by default — starting edit on a new row automatically
 * stops the previous one. This matches the common "click edit → row becomes
 * editable → save/cancel → row returns to read-only" flow. `useSubmit` can be
 * paired for the save lifecycle; this hook only owns the editing-key state.
 */
import { ref, computed, type ComputedRef, type Ref } from 'vue'

export interface UseTableRowEditOptions<TKey = string | number> {
  /** Called when a row enters edit mode. */
  onStart?: (key: TKey) => void
  /** Called when a row exits edit mode. */
  onEnd?: (key: TKey) => void
}

export interface UseTableRowEditReturn<TKey = string | number> {
  /** The key of the row currently being edited, `null` when idle. */
  editingKey: Ref<TKey | null>
  /** Whether any row is being edited. */
  isEditingAny: ComputedRef<boolean>
  /** Whether the given row is being edited. */
  isEditing: (key: TKey) => boolean
  /** Start editing a row. Automatically stops the previous row (if any). */
  startEdit: (key: TKey) => void
  /** Stop editing. Without `key`, stops the current editing row. */
  stopEdit: (key?: TKey) => void
  /** Toggle edit state for a row. */
  toggleEdit: (key: TKey) => void
}

export function useTableRowEdit<TKey = string | number>(
  options: UseTableRowEditOptions<TKey> = {}
): UseTableRowEditReturn<TKey> {
  const { onStart, onEnd } = options

  const editingKey = ref<TKey | null>(null) as Ref<TKey | null>
  const isEditingAny = computed(() => editingKey.value !== null)

  function isEditing(key: TKey): boolean {
    return editingKey.value === key
  }

  function startEdit(key: TKey) {
    if (editingKey.value === key) return
    if (editingKey.value !== null) onEnd?.(editingKey.value)
    editingKey.value = key
    onStart?.(key)
  }

  function stopEdit(key?: TKey) {
    if (key !== undefined && editingKey.value !== key) return
    if (editingKey.value !== null) onEnd?.(editingKey.value)
    editingKey.value = null
  }

  function toggleEdit(key: TKey) {
    if (isEditing(key)) stopEdit(key)
    else startEdit(key)
  }

  return { editingKey, isEditingAny, isEditing, startEdit, stopEdit, toggleEdit }
}

// --- Pro-prefixed aliases ---

export type UseProTableRowEditOptions<TKey = string | number> = UseTableRowEditOptions<TKey>
export type UseProTableRowEditReturn<TKey = string | number> = UseTableRowEditReturn<TKey>
export { useTableRowEdit as useProTableRowEdit }
