# useAsyncLock

基于 key 的异步并发锁，防止重复提交与同 key 重入。不同于 `useThrottleFn` / `useDebounceFn` 按时间丢弃/延迟调用，`useAsyncLock` 在前一次调用完成前**完全阻塞**同 key 的后续调用。

## 用法

```ts
import { useAsyncLock } from '@framebase/vue'

const { locks, isLocked, run, cancel, cancelAll } = useAsyncLock()

async function submit() {
  // 同 key（默认 'default'）进行中时返回 undefined，不调用 fn
  const result = await run(async () => {
    await api.create(payload)
    return 'ok'
  })
  if (result === undefined) return // 被忽略
  ElMessage.success('提交成功')
}
```

模板里用 `isLocked` 禁用按钮：

```vue
<el-button :loading="isLocked()" :disabled="isLocked()" @click="submit">
  提交
</el-button>
```

## 多 key 并发

不同 key 互不阻塞，适合「同页面多个独立写操作」场景。

```ts
const lock = useAsyncLock()

// 两个独立资源可并发
await Promise.all([
  lock.run(() => api.updateProfile(payload), 'profile'),
  lock.run(() => api.updateAvatar(file), 'avatar')
])
```

## 签名

```ts
function useAsyncLock(): UseAsyncLockReturn
```

## 返回值

### UseAsyncLockReturn

| 属性        | 类型                                                                 | 说明                                                   |
| ----------- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| `locks`     | `Readonly<Ref<ReadonlySet<string>>>`                                 | 当前锁定中的 key 快照，响应式                          |
| `isLocked`  | `(key?: string) => boolean`                                          | 查询指定 key（默认 `'default'`）是否锁定               |
| `run`       | `<T>(fn: () => Promise<T>, key?: string) => Promise<T \| undefined>` | 执行 `fn`；同 key 已锁则返回 `undefined` 且不调用 `fn` |
| `cancel`    | `(key?: string) => void`                                             | 释放指定 key 的锁（**不中止** in-flight `fn`）         |
| `cancelAll` | `() => void`                                                         | 释放所有锁                                             |

## 说明

### 静默忽略语义

`run` 在同 key 已锁时返回 `undefined`，调用方需自行判断：

```ts
const result = await lock.run(fn)
if (result === undefined) {
  // 被忽略，或 fn 本身返回 undefined
}
```

如需「抛错」语义，可在调用前用 `isLocked()` 预判。

### cancel 不中止 fn

JavaScript 没有协作式取消。`cancel` 只释放锁让下一次 `run` 可执行，in-flight 的 `fn` 仍会继续运行直至 settle。如需真正中止工作，请在 `fn` 内部使用 `AbortController`（可与 `useRequest` 集成）。

### 与 vueuse 的区别

| Hook            | 语义                              | 适用场景               |
| --------------- | --------------------------------- | ---------------------- |
| `useAsyncLock`  | 同 key 完全阻塞，完成前忽略后续   | 防重复提交、写操作防抖 |
| `useThrottleFn` | 按时间窗口限流，首/尾调用策略可配 | 搜索输入、滚动事件     |
| `useDebounceFn` | 延迟执行，连续调用只跑最后一次    | 自动保存、resize       |
