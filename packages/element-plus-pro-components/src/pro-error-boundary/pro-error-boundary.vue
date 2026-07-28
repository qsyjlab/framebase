<template>
  <slot v-if="!hasError" />
  <template v-else>
    <slot name="fallback" :error="error" :reset="reset">
      <component :is="resolvedFallback" v-if="resolvedFallback" />
      <pro-exception
        v-else
        status="500"
        :title="title"
        :sub-title="subTitle"
        :show-back="false"
        :show-home="false"
        :show-reload="true"
        :reload-text="reloadText"
        full-page
        @reload="reset"
      />
    </slot>
  </template>
</template>

<script setup lang="ts">
import { computed, onErrorCaptured, ref, watch } from 'vue'
import { ProException } from '../pro-exception'
import type { ProErrorBoundaryProps, ProErrorBoundarySlots } from './pro-error-boundary'

defineOptions({ name: 'ProErrorBoundary' })
const props = withDefaults(defineProps<ProErrorBoundaryProps>(), {
  stopPropagation: true
})
const emit = defineEmits<{
  error: [error: unknown, info: string]
  reset: []
}>()
defineSlots<ProErrorBoundarySlots>()

const hasError = ref(false)
const error = ref<unknown>(null)

const resolvedFallback = computed<(() => unknown) | null>(() => {
  if (typeof props.fallback === 'function') return () => props.fallback
  if (props.fallback !== undefined) return () => props.fallback
  return null
})

onErrorCaptured((err, _instance, info) => {
  hasError.value = true
  error.value = err
  props.onError?.(err, info)
  emit('error', err, info)
  return props.stopPropagation ? false : true
})

watch(
  () => (props.resetKeys ? [...props.resetKeys] : []),
  () => {
    if (hasError.value) reset()
  },
  { deep: true }
)

function reset() {
  hasError.value = false
  error.value = null
  emit('reset')
}

defineExpose({ error, hasError, reset })
</script>
