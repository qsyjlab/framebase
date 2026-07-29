import { describe, expect, it } from 'vitest'
import { ref, computed } from 'vue'
import { useTreeData } from '../index'

interface Item {
  id: number
  parentId: number | null
  name: string
  children?: Item[]
}

const source: Item[] = [
  { id: 1, parentId: null, name: 'root-a' },
  { id: 2, parentId: 1, name: 'a-1' },
  { id: 3, parentId: 1, name: 'a-2' },
  { id: 4, parentId: 2, name: 'a-1-1' },
  { id: 5, parentId: null, name: 'root-b' }
]

describe('useTreeData', () => {
  it('响应式构建树', () => {
    const { tree } = useTreeData<Item>(source)
    expect(tree.value).toHaveLength(2)
    expect(tree.value[0].name).toBe('root-a')
    expect(tree.value[0].children).toHaveLength(2)
    expect(tree.value[0].children![0].children).toHaveLength(1)
  })

  it('flat 从树还原为扁平数组', () => {
    const { flat } = useTreeData<Item>(source)
    expect(flat.value.map(i => i.name)).toEqual(['root-a', 'a-1', 'a-1-1', 'a-2', 'root-b'])
  })

  it('findNode 按 id 查找', () => {
    const { findNode } = useTreeData<Item>(source)
    expect(findNode(4)?.name).toBe('a-1-1')
    expect(findNode(999)).toBeUndefined()
  })

  it('findPath 返回从根到目标的路径', () => {
    const { findPath } = useTreeData<Item>(source)
    expect(findPath(4).map(n => n.name)).toEqual(['root-a', 'a-1', 'a-1-1'])
    expect(findPath(999)).toEqual([])
  })

  it('源数据变化时树自动重算', () => {
    const src = ref<Item[]>(source)
    const { tree } = useTreeData<Item>(src)
    expect(tree.value).toHaveLength(2)
    src.value = [{ id: 10, parentId: null, name: 'solo' }]
    expect(tree.value).toHaveLength(1)
    expect(tree.value[0].name).toBe('solo')
  })

  it('支持 getter 输入', () => {
    const { tree } = useTreeData<Item>(() => source)
    expect(tree.value[0].children).toHaveLength(2)
  })

  it('不修改原始数据', () => {
    const original = JSON.stringify(source)
    const { tree } = useTreeData<Item>(source)
    // access tree to trigger computation
    expect(tree.value[0].children).toBeTruthy()
    expect(JSON.stringify(source)).toBe(original)
  })

  it('filterPredicate 过滤树', () => {
    const { filtered } = useTreeData<Item>(source, {
      filterPredicate: n => n.name.includes('a-1-1')
    })
    expect(filtered.value).toHaveLength(1)
    expect(filtered.value[0].name).toBe('root-a')
    expect(filtered.value[0].children).toHaveLength(1)
    expect(filtered.value[0].children![0].name).toBe('a-1')
    expect(filtered.value[0].children![0].children).toHaveLength(1)
  })

  it('无 filterPredicate 时 filtered 为空', () => {
    const { filtered } = useTreeData<Item>(source)
    expect(filtered.value).toEqual([])
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
      { key: 'b', pid: 'a', label: 'B' },
      { key: 'c', pid: 'b', label: 'C' }
    ]
    const { tree, findPath } = useTreeData<Custom>(custom, {
      idKey: 'key',
      parentKey: 'pid',
      childrenKey: 'items'
    })
    expect(tree.value[0].items).toHaveLength(1)
    expect(findPath('c').map(n => n.label)).toEqual(['A', 'B', 'C'])
  })

  it('computed 源 + 响应式过滤', () => {
    const keyword = ref('a-1-1')
    // re-create with reactive predicate via computed source
    const { filtered: filtered2 } = useTreeData<Item>(
      computed(() => source),
      {
        filterPredicate: n => n.name.includes(keyword.value)
      }
    )
    expect(filtered2.value[0].children![0].children).toHaveLength(1)
    keyword.value = 'nonexistent'
    expect(filtered2.value).toEqual([])
  })
})
