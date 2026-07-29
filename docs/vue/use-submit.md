# useSubmit

提交态封装：loading / error / success + 防重入。基于 `useAsyncLock`，专注表单提交场景。比 `useRequest` 更轻量，无防抖/重试/abort，只跟踪单次提交结果。

## 用法

```ts
import { useSubmit } from '@framebase/vue'

const { loading, error, success, run, reset } = useSubmit()

async function onSubmit() {
  await run(async () => {
    await api.save(form.values)
  })
  if (success.value) ElMessage.success('保存成功')
  if (error.value) ElMessage.error(`保存失败: ${error.value}`)
}
```

```vue
<el-button :loading="loading" :disabled="loading" @click="onSubmit">保存</el-button>
```

## 防重入

提交进行中再次调用 `run` 返回 `undefined`，不执行 `fn`：

```ts
const result = await run(fn)
if (result === undefined) {
  // 被忽略（正在提交中），或 fn 本身返回 undefined
}
```

## 签名

```ts
function useSubmit<T = unknown>(options?: UseSubmitOptions): UseSubmitReturn<T>
```

## 参数

### UseSubmitOptions

| 属性           | 类型      | 默认值  | 说明                  |
| -------------- | --------- | ------- | --------------------- |
| `resetOnError` | `boolean` | `false` | 每次 run 前清空 error |

## 返回值

| 属性      | 类型                              | 说明                                        |
| --------- | --------------------------------- | ------------------------------------------- |
| `loading` | `ComputedRef<boolean>`            | 提交中                                      |
| `error`   | `Ref<unknown>`                    | 最近一次失败的错误                          |
| `success` | `Ref<boolean>`                    | 最近一次是否成功                            |
| `run`     | `(fn) => Promise<T \| undefined>` | 执行提交，重入返回 `undefined`              |
| `reset`   | `() => void`                      | 清空 error / success（不中止 in-flight fn） |

## 说明

### 与 useRequest / useAsyncLock 的区别

| Hook           | 定位                                  |
| -------------- | ------------------------------------- |
| `useAsyncLock` | 并发锁原语，只管 key 维度去重         |
| `useSubmit`    | 提交生命周期（loading/error/success） |
| `useRequest`   | 通用异步状态（防抖/重试/abort/phase） |

### resetOnError

`resetOnError: true` 时每次 `run` 前清空 `error`，适合「错误提示常驻，新提交时清除」的场景。默认 `false`，`error` 保留到下次成功。
