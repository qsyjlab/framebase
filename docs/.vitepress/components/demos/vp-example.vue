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
  /** `:::demo isolated` —— 用 iframe 彻底隔离；默认内联渲染 */
  isolated: Boolean
})
</script>

<template>
  <div class="example-showcase vp-raw">
    <ClientOnly>
      <DemoFrame v-if="isolated" :file="file" />
      <component :is="demo" v-else-if="demo" class="vp-raw" v-bind="$attrs" />
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.example-showcase {
  width: 100%;
  overflow: auto;
}
</style>
