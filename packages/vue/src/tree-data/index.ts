/**
 * Reactive tree data: flat array ↔ tree with lookup helpers.
 *
 * Wraps `@framebase/core`'s pure tree utilities (`arrayToTree` etc.) in
 * reactivity. Feed a flat array (ref / computed / getter) and get a reactive
 * tree plus `findNode` / `findPath` / `filter` helpers. Ideal for cascading
 * selectors, tree tables, and dictionary-driven menus.
 */
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import {
  arrayToTree,
  treeToArray,
  findTreeNode,
  findTreePath,
  filterTree,
  type ArrayToTreeOptions,
  type FindTreeOptions
} from '@framebase/core'

export interface UseTreeDataOptions<T> extends ArrayToTreeOptions {
  /**
   * Function to test each node when filtering. Keep nodes that match or have
   * matching descendants.
   */
  filterPredicate?: (node: T) => boolean
}

export interface UseTreeDataReturn<T> {
  /** The reactive tree (nested via `childrenKey`). */
  tree: ComputedRef<T[]>
  /** Flat list rebuilt from the tree (depth-first, pre-order). */
  flat: ComputedRef<T[]>
  /** Find a node by id. */
  findNode: (id: unknown) => T | undefined
  /** Find the path from root to a node by id (inclusive). */
  findPath: (id: unknown) => T[]
  /** Filtered tree based on `filterPredicate`; empty when no predicate set. */
  filtered: ComputedRef<T[]>
}

export function useTreeData<T extends Record<string, any>>(
  source: MaybeRefOrGetter<T[]>,
  options: UseTreeDataOptions<T> = {}
): UseTreeDataReturn<T> {
  const { filterPredicate, ...treeOptions } = options

  const tree = computed(() => arrayToTree(toValue(source), treeOptions))

  const flat = computed(() => treeToArray(tree.value, { childrenKey: treeOptions.childrenKey }))

  const findOpts: FindTreeOptions = {
    idKey: treeOptions.idKey,
    childrenKey: treeOptions.childrenKey
  }

  function findNode(id: unknown): T | undefined {
    return findTreeNode(tree.value, id, findOpts)
  }

  function findPath(id: unknown): T[] {
    return findTreePath(tree.value, id, findOpts)
  }

  const filtered = computed(() => {
    if (!filterPredicate) return []
    return filterTree(tree.value, filterPredicate, { childrenKey: treeOptions.childrenKey })
  })

  return { tree, flat, findNode, findPath, filtered }
}

// --- Pro-prefixed aliases ---

export type UseProTreeDataOptions<T> = UseTreeDataOptions<T>
export type UseProTreeDataReturn<T> = UseTreeDataReturn<T>
export { useTreeData as useProTreeData }
