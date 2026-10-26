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
let root: HTMLElement | null = null

function applyTheme(theme: string | null) {
  const dark = theme === 'dark'
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

function reportHeight() {
  if (!root) return
  window.parent.postMessage(
    { type: 'framebase-demo:height', height: Math.ceil(root.getBoundingClientRect().height) },
    '*'
  )
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
  window.addEventListener('message', handleMessage)
  reportHeight()
})

onBeforeUnmount(() => {
  observer?.disconnect()
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
