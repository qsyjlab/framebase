<script setup lang="ts">
defineProps({
  file: {
    type: String,
    required: true
  },
  demo: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="example-showcase vp-raw">
    <ClientOnly>
      <component :is="demo" v-if="demo" class="vp-raw" v-bind="$attrs" />
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.example-showcase {
  width: 100%;
  overflow: auto;
}
</style>
