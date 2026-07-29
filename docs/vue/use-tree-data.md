# useTreeData

响应式树数据：扁平数组 ↔ 树结构 + 查找/过滤。封装 `@framebase/core` 的纯树工具（`arrayToTree` 等），输入扁平数组（带 `id` / `parentId`），输出响应式树。

## 用法

```ts
import { useTreeData } from '@framebase/vue'

interface Node {
  id: number
  parentId: number | null
  name: string
  children?: Node[]
}

const source: Node[] = [
  { id: 1, parentId: null, name: '总部' },
  { id: 2, parentId: 1, name: '研发部' },
  { id: 3, parentId: 1, name: '市场部' },
  { id: 4, parentId: 2, name: '前端组' }
]

const { tree, flat, findNode, findPath } = useTreeData<Node>(source)

// tree: [{ id: 1, name: '总部', children: [{ id: 2, name: '研发部', children: [...] }, ...] }]
// flat: [总部, 研发部, 前端组, 市场部]
// findNode(4) → { id: 4, name: '前端组' }
// findPath(4) → [总部, 研发部, 前端组]
```

```vue
<el-tree :data="tree" :props="{ label: 'name', children: 'children' }" />
```

## 响应式源

`source` 支持 `ref` / `computed` / getter，变化时树自动重算：

```ts
const source = ref<Node[]>([])
const { tree } = useTreeData(source)

// 异步加载后赋值，tree 自动更新
source.value = await fetchDepartments()
```

## 签名

```ts
function useTreeData<T extends Record<string, any>>(
  source: MaybeRefOrGetter<T[]>,
  options?: UseTreeDataOptions<T>
): UseTreeDataReturn<T>
```

## 参数

### UseTreeDataOptions

继承 `ArrayToTreeOptions`（透传给 `arrayToTree`），额外：

| 属性              | 类型                   | 默认值       | 说明                                  |
| ----------------- | ---------------------- | ------------ | ------------------------------------- |
| `idKey`           | `Path`                 | `'id'`       | id 字段路径                           |
| `parentKey`       | `Path`                 | `'parentId'` | parentId 字段路径                     |
| `childrenKey`     | `Path`                 | `'children'` | children 字段路径                     |
| `rootValue`       | `unknown`              | —            | 根节点的 parent 值，默认 falsy 视为根 |
| `filterPredicate` | `(node: T) => boolean` | —            | 过滤函数，保留匹配节点及其祖先        |

## 返回值

| 属性       | 类型                              | 说明                               |
| ---------- | --------------------------------- | ---------------------------------- |
| `tree`     | `ComputedRef<T[]>`                | 响应式树结构                       |
| `flat`     | `ComputedRef<T[]>`                | 从树还原的扁平数组（深度优先前序） |
| `findNode` | `(id: unknown) => T \| undefined` | 按 id 查找节点                     |
| `findPath` | `(id: unknown) => T[]`            | 从根到目标的路径，未找到返回 `[]`  |
| `filtered` | `ComputedRef<T[]>`                | 基于 `filterPredicate` 的过滤树    |

## 说明

### 自定义字段名

```ts
const { tree } = useTreeData(source, {
  idKey: 'key',
  parentKey: 'pid',
  childrenKey: 'items'
})
```

### 响应式过滤

`filterPredicate` 配合响应式源可实现搜索过滤：

```ts
const keyword = ref('')
const { filtered } = useTreeData(source, {
  filterPredicate: node => node.name.includes(keyword.value)
})
// keyword 变化时 filtered 自动重算
```

### 不修改原始数据

`arrayToTree` 内部对每项做浅拷贝，原始数组不会被 mutate。

### 底层 core 纯函数

`useTreeData` 封装了 `@framebase/core` 的以下纯函数，可在非 Vue 环境直接使用：

| 函数           | 说明                           |
| -------------- | ------------------------------ |
| `arrayToTree`  | 扁平数组 → 树                  |
| `treeToArray`  | 树 → 扁平数组                  |
| `findTreeNode` | 按 id 查找节点                 |
| `findTreePath` | 查找从根到节点的路径           |
| `mapTree`      | 映射每个节点为新结构           |
| `filterTree`   | 过滤树（保留匹配节点及其祖先） |
