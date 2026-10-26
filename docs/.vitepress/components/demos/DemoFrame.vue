<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'

const props = withDefaults(
  defineProps<{
    file: string
    /** 初始高度，避免首帧塌陷；拿到真实高度后覆盖 */
    minHeight?: number
  }>(),
  { minHeight: 180 }
)

const { isDark } = useData()
const frameRef = ref<HTMLIFrameElement>()
const height = ref(props.minHeight)

const src = computed(
  () => `${withBase('/demo-runtime.html')}?demo=${encodeURIComponent(props.file)}`
)

function postTheme() {
  frameRef.value?.contentWindow?.postMessage(
    { type: 'framebase-demo:theme', theme: isDark.value ? 'dark' : 'light' },
    '*'
  )
}

function handleMessage(event: MessageEvent) {
  const data = event.data as { type?: string; height?: number } | undefined
  if (data?.type !== 'framebase-demo:height') return
  // 只接受本 iframe 发来的消息，避免多实例互相串台
  if (event.source !== frameRef.value?.contentWindow) return
  if (typeof data.height === 'number' && data.height > 0) height.value = data.height
}

onMounted(() => window.addEventListener('message', handleMessage))
onBeforeUnmount(() => window.removeEventListener('message', handleMessage))
watch(isDark, postTheme)
</script>

<template>
  <div class="demo-frame" :style="{ height: `${height}px` }">
    <iframe
      ref="frameRef"
      :src="src"
      :title="file"
      class="demo-frame__viewport"
      loading="lazy"
      @load="postTheme"
    />
  </div>
</template>

<style scoped>
.demo-frame {
  width: 100%;
  overflow: hidden;
  transition: height 0.18s ease;
}
.demo-frame__viewport {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;
}
</style>
