# ProConfirmButton 确认按钮

在异步操作前增加确认步骤，支持行内 Popconfirm、MessageBox、危险操作样式与显式权限控制。

```vue
<template>
  <ProConfirmButton
    type="danger"
    :access="canDelete"
    denied-behavior="disable"
    denied-reason="当前账号没有删除权限"
    :confirm="{
      title: '删除用户',
      description: '删除后无法恢复',
      mode: 'message-box',
      type: 'danger'
    }"
    :action="deleteUser"
  >
    删除
  </ProConfirmButton>
</template>
```

组件继承 `ProAsyncButton` 的异步操作与 Button 属性。

| 属性           | 说明                 | 类型                         | 默认值   |
| -------------- | -------------------- | ---------------------------- | -------- |
| confirm        | 确认文案或详细配置   | `string \| ProConfirmConfig` | —        |
| access         | 是否具有 UI 操作权限 | `boolean`                    | `true`   |
| deniedBehavior | 无权限时的表现       | `'hide' \| 'disable'`        | `'hide'` |
| deniedReason   | 禁用时的原生提示     | `string`                     | —        |

事件包括 `confirm`、`cancel`，以及 `ProAsyncButton` 的全部生命周期事件。权限属性仅控制界面表现，服务端仍需进行真实权限校验。
