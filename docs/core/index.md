# @framebase/core

框架无关的纯 TypeScript 工具集，不依赖 Vue / React 等任何运行时框架。可被任意前端项目、Node 脚本直接使用。

路径工具的运行时委托 [`lodash-es`](https://lodash.com/) 的 `toPath` / `get` / `set` / `unset`，保证 `a[0].b`、`a['name']` 等 bracket notation 的边界行为与 lodash 一致；类型层完全手写，为编辑器提供自动补全与错误校验。

## 安装

```bash
pnpm add @framebase/core
```

## 函数总览

### 路径工具

- [getPathValue](./get-path-value) —— 读取嵌套对象的值
- [setPathValue](./set-path-value) —— 写入嵌套对象的值
- [unsetPathValue](./unset-path-value) —— 删除嵌套对象的值
- [normalizePath](./normalize-path) —— 标准化路径为数组形式

### 路径类型

- [DataPath / DataIndex](./data-path) —— 路径字面量类型推导

### 分页工具

- [normalizePagedResponse](./normalize-paged-response) —— 规范化服务端分页响应
- [paginateData](./paginate-data) —— 客户端分页切片
- [getRowKey](./get-row-key) —— 解析行键
- [moveItem](./move-item) —— 不可变地移动数组元素

## Pro 前缀别名

为兼容 `@framebase/element-plus-pro-components` 的历史调用，`core` 同时导出一组 `Pro` 前缀别名，与原函数等价：`normalizeProPath` / `getProPathValue` / `setProPathValue` / `unsetProPathValue` / `normalizeProPagedResponse` / `paginateProData` / `getProRowKey` / `moveProItem`。

业务侧一般直接使用无前缀版本。
