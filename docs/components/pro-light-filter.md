# ProLightFilter 轻量筛选

行内紧凑筛选栏：每个字段渲染成一个可点击的标签（chip），点击后弹出筛选面板，选中即回填并高亮。字段渲染复用 `ProField` 的 `valueType`，因此支持全部内置类型与业务注册的自定义类型。

## 基础用法

:::demo 点击标签弹出面板，选择后标签高亮并回填，下方实时显示筛选值
pro-light-filter/basic
:::

## 边框风格

`borderStyle` 支持 `outlined`（线框）、`borderless`（无边框）、`filled`（填充）、`underlined`（下划线）四种视觉风格：

```vue
<ProLightFilter v-model="values" :fields="fields" border-style="filled" />
```

## 与 ProTable 联动

把筛选值直接接到表格的 `params` 上，选中即触发查询：

```vue
<ProLightFilter v-model="query" :fields="fields" />
<ProTable :columns="columns" :request="request" :params="query" />
```

## 即时提交与延迟提交

`field.instant` 控制面板行为：`true` 时选中即提交并关闭（`select` / `date` 默认），`false` 时只更新临时值、需点确认（`text` / `number` 默认），不设则按 `valueType` 自动推断。

## Props

| 属性           | 说明                  | 类型                                                     | 默认值       |
| -------------- | --------------------- | -------------------------------------------------------- | ------------ |
| modelValue     | 筛选值（`v-model`）   | `Record<string, unknown>`                                | `{}`         |
| fields         | 字段配置              | `ProLightFilterField[]`                                  | —            |
| size           | 尺寸                  | `'large' \| 'default' \| 'small'`                        | `'default'`  |
| borderStyle    | 标签边框风格          | `'outlined' \| 'borderless' \| 'filled' \| 'underlined'` | `'outlined'` |
| collapsedCount | 收起时展示的字段数量  | `number`                                                 | —            |
| showMoreToggle | 是否显示展开/收起开关 | `boolean`                                                | `true`       |
| disabled       | 是否禁用              | `boolean`                                                | `false`      |

### ProLightFilterField

| 字段         | 说明                                    | 类型                       |
| ------------ | --------------------------------------- | -------------------------- |
| key          | 字段唯一标识（对应 `modelValue` 的键）  | `string`                   |
| label        | 标签文案                                | `string`                   |
| valueType    | 复用 ProField 的值类型                  | `ProFieldValueType`        |
| valueEnum    | 枚举映射                                | `ProFieldValueEnum`        |
| options      | 选项列表                                | `ProOption[]`              |
| optionFields | 选项字段映射                            | `Partial<ProOptionFields>` |
| collapsed    | 是否默认收起到「更多」里                | `boolean`                  |
| fieldProps   | 透传给字段组件的属性                    | `Record<string, unknown>`  |
| placeholder  | 占位文案                                | `string`                   |
| instant      | 是否选中即提交，不设则按 valueType 推断 | `boolean`                  |
| popoverWidth | 面板宽度                                | `number \| 'auto'`         |
| render       | 自定义面板内控件                        | `(ctx) => VNode`           |
| renderLabel  | 自定义标签上显示的值文本                | `(value, field) => string` |

## Events

| 事件名            | 说明       | 回调参数                         |
| ----------------- | ---------- | -------------------------------- |
| update:modelValue | 筛选值变化 | `value: Record<string, unknown>` |
| change            | 筛选值变化 | `value: Record<string, unknown>` |

## Slots

| 插槽名       | 说明                                  | 参数                         |
| ------------ | ------------------------------------- | ---------------------------- |
| field        | 覆盖所有字段的面板渲染                | `{ field, value, setValue }` |
| field-{type} | 按 valueType 覆盖，如 `#field-select` | `{ field, value, setValue }` |
| footer       | 自定义面板底部（仅延迟型字段显示）    | `{ field, confirm, clear }`  |

## Expose

| 成员            | 说明             | 类型                                    |
| --------------- | ---------------- | --------------------------------------- |
| values          | 当前筛选值       | `Readonly<Record<string, unknown>>`     |
| collapsed       | 是否处于收起态   | `Readonly<Ref<boolean>>`                |
| toggleCollapsed | 切换收起状态     | `() => void`                            |
| setValue        | 设置单个字段的值 | `(key: string, value: unknown) => void` |
| reset           | 清空全部筛选     | `() => void`                            |
