/**
 * Pure helpers for flat-array ↔ tree conversions and tree traversal.
 *
 * Framework-agnostic utilities for hierarchical data (menus, directories,
 * cascading selectors, tree tables). Consumers feed a flat array of records
 * with id / parent-id fields and receive a nested `children` structure back;
 * `useTreeData` (in @framebase/vue) wraps these in reactivity.
 */
import { getPathValue, setPathValue, type Path } from '../path'

export interface ArrayToTreeOptions {
  /** Path to the id field. Defaults to `'id'`. */
  idKey?: Path
  /** Path to the parent-id field. Defaults to `'parentId'`. */
  parentKey?: Path
  /** Path to write children into. Defaults to `'children'`. */
  childrenKey?: Path
  /** Value identifying root nodes. Defaults to `undefined` (falsy = root). */
  rootValue?: unknown
}

/**
 * Convert a flat array into a tree by linking `idKey` → `parentKey`.
 *
 * Returns shallow clones of the input items with a `childrenKey` array
 * attached, so the original array is not mutated. Root nodes are those whose
 * `parentKey` is falsy or equals `rootValue`. Stable: children preserve their
 * original array order.
 */
export function arrayToTree<T extends Record<string, any>>(
  items: T[],
  options: ArrayToTreeOptions = {}
): T[] {
  const { idKey = 'id', parentKey = 'parentId', childrenKey = 'children', rootValue } = options

  // shallow clone each item so the input array is not mutated
  const nodes = items.map(item => ({ ...item })) as T[]

  const map = new Map<unknown, T>()
  for (const node of nodes) {
    map.set(getPathValue(node, idKey), node)
    setPathValue(node, childrenKey, [])
  }

  const roots: T[] = []
  for (const node of nodes) {
    const parentId = getPathValue(node, parentKey)
    const isRoot = rootValue !== undefined ? parentId === rootValue : !parentId
    if (isRoot) {
      roots.push(node)
    } else {
      const parent = map.get(parentId)
      if (parent) {
        ;(getPathValue(parent, childrenKey) as T[]).push(node)
      } else {
        // orphan — treat as root
        roots.push(node)
      }
    }
  }

  return roots
}

export interface TreeToArrayOptions {
  /** Path to the children field. Defaults to `'children'`. */
  childrenKey?: Path
}

/**
 * Flatten a tree into a plain array (depth-first, pre-order).
 * The returned items are the same references; `childrenKey` is not stripped.
 */
export function treeToArray<T extends Record<string, any>>(
  tree: T[],
  options: TreeToArrayOptions = {}
): T[] {
  const { childrenKey = 'children' } = options
  const result: T[] = []

  function walk(nodes: T[]) {
    for (const node of nodes) {
      result.push(node)
      const children = getPathValue(node, childrenKey) as T[] | undefined
      if (Array.isArray(children)) walk(children)
    }
  }

  walk(tree)
  return result
}

export interface FindTreeOptions {
  /** Path to the id field. Defaults to `'id'`. */
  idKey?: Path
  /** Path to the children field. Defaults to `'children'`. */
  childrenKey?: Path
}

/**
 * Find a node by id (depth-first). Returns `undefined` when not found.
 */
export function findTreeNode<T extends Record<string, any>>(
  tree: T[],
  id: unknown,
  options: FindTreeOptions = {}
): T | undefined {
  const { idKey = 'id', childrenKey = 'children' } = options

  function walk(nodes: T[]): T | undefined {
    for (const node of nodes) {
      if (getPathValue(node, idKey) === id) return node
      const children = getPathValue(node, childrenKey) as T[] | undefined
      if (Array.isArray(children)) {
        const found = walk(children)
        if (found) return found
      }
    }
    return undefined
  }

  return walk(tree)
}

/**
 * Find the path from root to the node with the given id (inclusive).
 * Returns `[]` when the node is not found.
 */
export function findTreePath<T extends Record<string, any>>(
  tree: T[],
  id: unknown,
  options: FindTreeOptions = {}
): T[] {
  const { idKey = 'id', childrenKey = 'children' } = options

  function walk(nodes: T[], trail: T[]): T[] | undefined {
    for (const node of nodes) {
      const nextTrail = [...trail, node]
      if (getPathValue(node, idKey) === id) return nextTrail
      const children = getPathValue(node, childrenKey) as T[] | undefined
      if (Array.isArray(children)) {
        const found = walk(children, nextTrail)
        if (found) return found
      }
    }
    return undefined
  }

  return walk(tree, []) ?? []
}

/**
 * Map each tree node to a new shape (depth-first, returns a new tree).
 * Children are mapped recursively under `childrenKey`.
 */
export function mapTree<T extends Record<string, any>, R extends Record<string, any>>(
  tree: T[],
  fn: (node: T, parent: T | undefined) => R,
  options: { childrenKey?: Path; targetChildrenKey?: Path } = {}
): R[] {
  const { childrenKey = 'children', targetChildrenKey = 'children' } = options

  function walk(nodes: T[], parent: T | undefined): R[] {
    return nodes.map(node => {
      const mapped = fn(node, parent)
      const children = getPathValue(node, childrenKey) as T[] | undefined
      if (Array.isArray(children)) {
        setPathValue(mapped as R, targetChildrenKey, walk(children, node))
      }
      return mapped
    })
  }

  return walk(tree, undefined)
}

/**
 * Filter tree nodes (depth-first). A node is kept if it matches or any
 * descendant matches; children of kept nodes are filtered recursively.
 */
export function filterTree<T extends Record<string, any>>(
  tree: T[],
  predicate: (node: T) => boolean,
  options: { childrenKey?: Path } = {}
): T[] {
  const { childrenKey = 'children' } = options

  function walk(nodes: T[]): T[] {
    const result: T[] = []
    for (const node of nodes) {
      const children = getPathValue(node, childrenKey) as T[] | undefined
      const filteredChildren = Array.isArray(children) ? walk(children) : []
      if (predicate(node) || filteredChildren.length > 0) {
        const clone = { ...node }
        setPathValue(clone, childrenKey, filteredChildren)
        result.push(clone)
      }
    }
    return result
  }

  return walk(tree)
}

// --- Pro-prefixed aliases ---

export type ProArrayToTreeOptions = ArrayToTreeOptions
export type ProTreeToArrayOptions = TreeToArrayOptions
export type ProFindTreeOptions = FindTreeOptions
export { arrayToTree as arrayToProTree }
export { treeToArray as proTreeToArray }
export { findTreeNode as findProTreeNode }
export { findTreePath as findProTreePath }
export { mapTree as mapProTree }
export { filterTree as filterProTree }
