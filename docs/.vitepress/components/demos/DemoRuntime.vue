<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const demos = import.meta.glob('../../../examples/**/*.vue', { eager: true })

const registry: Record<string, unknown> = {}
Object.keys(demos).forEach(key => {
  registry[key.replace('../../../examples/', '').replace('.vue', '')] = (
    demos[key] as { default: unknown }
  ).default
})

const ready = ref(false)
const name = ref('')
const demo = ref<unknown>(null)

let observer: ResizeObserver | undefined
let popperObserver: MutationObserver | undefined
let root: HTMLElement | null = null

function applyTheme(theme: string | null) {
  const dark = theme === 'dark'
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

function measureHeight() {
  if (!root) return 0
  const rootRect = root.getBoundingClientRect()
  let bottom = rootRect.bottom
  // Teleport 到 body 的浮层（下拉、tooltip、popover）是绝对定位的，
  // 不计入 #demo-root 高度，但会超出它的下边界。
  // 用 body 直接子节点的 rect 并集求真实下边界——不能直接读 scrollHeight，
  // 那会把「上一轮撑大的 iframe 高度」算进去，导致只增不减。
  Array.from(document.body.children).forEach(child => {
    if (child === root) return
    const rect = child.getBoundingClientRect()
    if (rect.height > 0 && rect.width > 0) bottom = Math.max(bottom, rect.bottom)
  })
  return Math.ceil(Math.max(bottom, rootRect.height))
}

function reportHeight() {
  const height = measureHeight()
  if (height <= 0) return
  window.parent.postMessage({ type: 'framebase-demo:height', height }, '*')
}

/** 浮层挂载/卸载有过渡动画，等两帧再量，并补一次兜底测量。 */
function scheduleReport() {
  requestAnimationFrame(() => {
    requestAnimationFrame(reportHeight)
  })
  window.setTimeout(reportHeight, 200)
}

function handleMessage(event: MessageEvent) {
  const data = event.data as { type?: string; theme?: string } | undefined
  if (data?.type !== 'framebase-demo:theme') return
  applyTheme(data.theme ?? null)
}

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  name.value = params.get('demo') ?? ''
  demo.value = registry[name.value] ?? null
  applyTheme(params.get('theme'))
  ready.value = true

  await nextTick()
  root = document.getElementById('demo-root')
  if (root && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(reportHeight)
    observer.observe(root)
  }
  // 浮层由 Teleport 插到 body，监听 body 子节点变化即可感知开合
  if (typeof MutationObserver !== 'undefined') {
    popperObserver = new MutationObserver(scheduleReport)
    popperObserver.observe(document.body, { childList: true })
  }
  window.addEventListener('message', handleMessage)
  reportHeight()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  popperObserver?.disconnect()
  window.removeEventListener('message', handleMessage)
})

const missingText = computed(() => `未找到示例：${name.value}`)
</script>

<template>
  <div v-if="ready" id="demo-root" class="demo-runtime">
    <component :is="demo" v-if="demo" />
    <p v-else class="demo-runtime__missing">{{ missingText }}</p>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  background: transparent;
}
.demo-runtime {
  padding: 16px;
}
.demo-runtime__missing {
  margin: 0;
  color: #d33;
  font:
    13px/1.6 system-ui,
    sans-serif;
}
</style>
