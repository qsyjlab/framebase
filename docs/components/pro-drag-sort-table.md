# ProDragSortTable 拖拽排序表格

基于 ProTable 封装的拖拽排序表格组件,通过拖动行首手柄列即可调整行顺序,内部通过 `modelValue` 双向同步数据。适合配置项排序、流程步骤排序等场景。

## 基础用法

:::demo 基础用法
pro-drag-sort-table/basic
:::

不显示拖拽列(整行可拖):

```vue
<template>
  <ProDragSortTable v-model="data" :columns="columns" :show-drag-column="false" />
</template>
```

## Props

| 属性           | 说明                              | 类型                                    | 默认值       |
| -------------- | --------------------------------- | --------------------------------------- | ------------ |
| modelValue     | 数据数组,支持 v-model             | `TRecord[]`                             | —            |
| data           | 数据数组(非受控)                  | `TRecord[]`                             | `[]`         |
| columns        | 列配置                            | `ProTableColumns<TRecord>`              | `[]`         |
| rowKey         | 行唯一标识字段或函数              | `string \| ((row) => string \| number)` | `'id'`       |
| dragSortKey    | 拖拽列的 key                      | `string`                                | `'__drag__'` |
| animation      | 拖拽动画时长(ms)                  | `number`                                | `180`        |
| autoFitHeight  | 是否自适应父容器高度              | `boolean`                               | `true`       |
| showDragColumn | 是否显示拖拽手柄列,关闭后整行可拖 | `boolean`                               | `true`       |

## 事件

| 事件名            | 说明     | 回调参数                            |
| ----------------- | -------- | ----------------------------------- |
| update:modelValue | 数据变化 | `data: TRecord[]`                   |
| update:data       | 数据变化 | `data: TRecord[]`                   |
| change            | 数据变化 | `data: TRecord[]`                   |
| drag-sort-end     | 拖拽结束 | `{ data, oldIndex, newIndex, ... }` |

## 方法

通过 ref 可获取实例方法,其中 `tableRef` 暴露底层 ProTable 实例。
