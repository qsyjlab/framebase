# ProConfigProvider 全局配置

ProConfigProvider 是全局/局部配置组件，用于向子树注入尺寸、暗黑模式、主题变量以及各组件的默认值。常用于在同一页面内呈现不同尺寸/主题的局部区域，或统一收敛业务组件的默认行为。

## 基础用法

通过 `size` 控制子树尺寸，`dark` 切换暗黑模式，`theme.variables` 注入 CSS 变量，`field`/`card`/`table`/`form`/`descriptions` 等为对应组件设置默认值。

:::demo 用 ProConfigProvider 包裹内容，切换 size 与暗黑模式观察子组件变化
pro-config-provider/basic
:::

## Props

| 参数         | 说明                     | 类型                                  | 默认值 |
| ------------ | ------------------------ | ------------------------------------- | ------ |
| size         | 子树默认尺寸             | `'large' \| 'default' \| 'small'`     | —      |
| dark         | 是否暗黑模式             | `boolean`                             | —      |
| namespace    | 命名空间                 | `string`                              | —      |
| theme        | 主题配置                 | `ProConfigProviderThemeConfig`        | —      |
| field        | ProField 默认配置        | `ProConfigProviderFieldConfig`        | —      |
| form         | ProForm 默认配置         | `ProConfigProviderFormConfig`         | —      |
| table        | ProTable 默认配置        | `ProConfigProviderTableConfig`        | —      |
| descriptions | ProDescriptions 默认配置 | `ProConfigProviderDescriptionsConfig` | —      |
| card         | ProCard 默认配置         | `ProConfigProviderCardConfig`         | —      |
| list         | ProList 默认配置         | `ProConfigProviderListConfig`         | —      |

### 子配置说明

**ProConfigProviderThemeConfig**

| 参数      | 说明           | 类型                               |
| --------- | -------------- | ---------------------------------- |
| className | 主题类名       | `string`                           |
| variables | CSS 变量键值对 | `Record<string, string \| number>` |

**ProConfigProviderFieldConfig**

| 参数      | 说明                    | 类型                                         |
| --------- | ----------------------- | -------------------------------------------- |
| emptyText | 只读态空值占位          | `string`                                     |
| renderers | 自定义 valueType 渲染器 | `Record<string, ProFieldRendererDefinition>` |

**ProConfigProviderCardConfig**

| 参数        | 说明       | 类型                             |
| ----------- | ---------- | -------------------------------- |
| bordered    | 默认边框   | `boolean`                        |
| shadow      | 默认阴影   | `'always' \| 'hover' \| 'never'` |
| collapsible | 默认可折叠 | `boolean`                        |

**ProConfigProviderTableConfig**

| 参数            | 说明           | 类型                                  |
| --------------- | -------------- | ------------------------------------- |
| options         | 工具栏默认配置 | `boolean \| ProTableOptions`          |
| size            | 默认尺寸       | `ComponentSize`                       |
| border          | 默认边框       | `boolean`                             |
| responseAdapter | 响应适配器     | `(response) => ProTableRequestResult` |
| transformParams | 请求参数转换   | `(params) => params`                  |

**ProConfigProviderFormConfig**

| 参数          | 说明         | 类型                         |
| ------------- | ------------ | ---------------------------- |
| size          | 默认尺寸     | `ComponentSize`              |
| labelPosition | 默认标签位置 | `'left' \| 'right' \| 'top'` |
| labelWidth    | 默认标签宽度 | `string \| number`           |
