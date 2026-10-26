<script setup lang="ts">
import DemoFrame from './DemoFrame.vue'

defineProps({
  file: {
    type: String,
    required: true
  },
  demo: {
    type: Object,
    required: true
  },
  /** `:::demo inline` —— 内联渲染，依赖 .vp-raw 重置；默认走 iframe 隔离 */
  inline: Boolean
})
</script>

<template>
  <div class="example-showcase vp-raw">
    <ClientOnly>
      <component :is="demo" v-if="inline && demo" class="vp-raw" v-bind="$attrs" />
      <DemoFrame v-else :file="file" />
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.example-showcase {
  width: 100%;
  overflow: auto;
}
</style>
