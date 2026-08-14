import { describe, expect, it } from 'vitest'
import { arrayToTree, treeToArray, findTreeNode, findTreePath, mapTree, filterTree } from '../index'

interface Item {
  id: number
  parentId: number | null
  name: string
  children?: Item[]
}

const flat: Item[] = [
  { id: 1, parentId: null, name: 'root-a' },
  { id: 2, parentId: 1, name: 'a-1' },
  { id: 3, parentId: 1, name: 'a-2' },
  { id: 4, parentId: 2, name: 'a-1-1' },
  { id: 5, parentId: null, name: 'root-b' },
  { id: 6, parentId: 5, name: 'b-1' }
]

describe('arrayToTree', () => {
  it('扁平数组转树', () => {
    const tree = arrayToTree(flat)
    expect(tree).toHaveLength(2)
    expect(tree[0].name).toBe('root-a')
    expect(tree[0].children).toHaveLength(2)
    expect(tree[0].children![0].name).toBe('a-1')
    expect(tree[0].children![0].children).toHaveLength(1)
    expect(tree[0].children![0].children![0].name).toBe('a-1-1')
  })

  it('保持子节点原始顺序', () => {
    const tree = arrayToTree(flat)
    expect(tree[0].children!.map(c => c.name)).toEqual(['a-1', 'a-2'])
  })

  it('孤儿节点作为根节点', () => {
    const orphan: Item[] = [{ id: 10, parentId: 999, name: 'orphan' }]
    const tree = arrayToTree(orphan)
    expect(tree).toHaveLength(1)
    expect(tree[0].name).toBe('orphan')
  })

  it('支持自定义字段名', () => {
    interface Custom {
      key: string
      pid: string | null
      label: string
      items?: Custom[]
    }
    const custom: Custom[] = [
      { key: 'a', pid: null, label: 'A' },
      { key: 'b', pid: 'a', label: 'B' }
    ]
    const tree = arrayToTree(custom, {
      idKey: 'key',
      parentKey: 'pid',
      childrenKey: 'items'
    })
    expect(tree).toHaveLength(1)
    expect(tree[0].items).toHaveLength(1)
    expect(tree[0].items![0].label).toBe('B')
  })

  it('rootValue 显式指定根标识', () => {
    const items: Item[] = [
      { id: 1, parentId: 0, name: 'root' },
      { id: 2, parentId: 1, name: 'child' }
    ]
    const tree = arrayToTree(items, { rootValue: 0 })
    expect(tree).toHaveLength(1)
    expect(tree[0].name).toBe('root')
    expect(tree[0].children).toHaveLength(1)
  })
})

describe('treeToArray', () => {
  it('树转扁平数组（深度优先前序）', () => {
    const tree = arrayToTree(flat)
    const arr = treeToArray(tree)
    expect(arr.map(i => i.name)).toEqual(['root-a', 'a-1', 'a-1-1', 'a-2', 'root-b', 'b-1'])
  })

  it('空树返回空数组', () => {
    expect(treeToArray([])).toEqual([])
  })

  it('支持自定义 childrenKey', () => {
    interface Node {
      id: number
      items?: Node[]
    }
    const tree: Node[] = [{ id: 1, items: [{ id: 2 }] }]
    const arr = treeToArray(tree, { childrenKey: 'items' })
    expect(arr.map(n => n.id)).toEqual([1, 2])
  })
})

describe('findTreeNode', () => {
  it('按 id 查找节点', () => {
    const tree = arrayToTree(flat)
    const node = findTreeNode(tree, 4)
    expect(node?.name).toBe('a-1-1')
  })

  it('未找到返回 undefined', () => {
    const tree = arrayToTree(flat)
    expect(findTreeNode(tree, 999)).toBeUndefined()
  })
})

describe('findTreePath', () => {
  it('返回从根到目标节点的路径', () => {
    const tree = arrayToTree(flat)
    const path = findTreePath(tree, 4)
    expect(path.map(n => n.name)).toEqual(['root-a', 'a-1', 'a-1-1'])
  })

  it('根节点路径只含自身', () => {
    const tree = arrayToTree(flat)
    const path = findTreePath(tree, 1)
    expect(path).toHaveLength(1)
    expect(path[0].name).toBe('root-a')
  })

  it('未找到返回空数组', () => {
    const tree = arrayToTree(flat)
    expect(findTreePath(tree, 999)).toEqual([])
  })
})

describe('mapTree', () => {
  it('映射每个节点为新结构', () => {
    const tree = arrayToTree(flat)
    const mapped = mapTree(tree, (node): { label: string; children: any[] } => ({
      label: node.name.toUpperCase(),
      children: []
    }))
    expect(mapped[0].label).toBe('ROOT-A')
    expect(mapped[0].children).toHaveLength(2)
    expect(mapped[0].children[0].label).toBe('A-1')
  })

  it('叶子节点无 children 字段时正常映射', () => {
    const tree: Item[] = [{ id: 1, parentId: null, name: 'solo' }]
    const mapped = mapTree(tree, n => ({ label: n.name }))
    expect(mapped).toHaveLength(1)
    expect(mapped[0].label).toBe('solo')
  })
})

describe('filterTree', () => {
  it('保留匹配节点及其祖先', () => {
    const tree = arrayToTree(flat)
    const filtered = filterTree(tree, n => n.name.includes('a-1-1'))
    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('root-a')
    expect(filtered[0].children).toHaveLength(1)
    expect(filtered[0].children![0].name).toBe('a-1')
    expect(filtered[0].children![0].children).toHaveLength(1)
  })

  it('不匹配时返回空数组', () => {
    const tree = arrayToTree(flat)
    const filtered = filterTree(tree, () => false)
    expect(filtered).toEqual([])
  })

  it('不修改原树', () => {
    const tree = arrayToTree(flat)
    const original = treeToArray(tree).length
    filterTree(tree, n => n.name === 'root-a')
    expect(treeToArray(tree).length).toBe(original)
  })
})
