<template>
  <el-button
    v-bind="buttonProps"
    :loading="mergedLoading"
    :disabled="mergedDisabled"
    @click="handleClick"
  >
    <template v-if="$slots.loading" #loading><slot name="loading" /></template>
    <slot />
  </el-button>
</template>

<script setup lang="ts" generic="TResult = unknown">
import { computed, watch } from 'vue'
import { omit } from 'lodash-es'
import { ElButton, ElMessage } from 'element-plus'
import type { ProAsyncButtonExpose, ProAsyncButtonProps } from './pro-async-button'
import { useProAsyncAction } from './use-pro-async-action'

defineOptions({ name: 'ProAsyncButton' })

const props = withDefaults(defineProps<ProAsyncButtonProps<TResult>>(), {
  loading: undefined,
  disabled: false,
  autoLoading: true,
  preventRepeat: true,
  nativeType: 'button'
})
const emit = defineEmits<{
  click: [event: MouseEvent]
  before: []
  success: [result: TResult]
  error: [error: unknown]
  settled: []
  'loading-change': [loading: boolean]
}>()

const actionState = useProAsyncAction<TResult>({
  action: () => props.action,
  preventRepeat: () => props.preventRepeat,
  successMessage: () => props.successMessage,
  errorMessage: () => props.errorMessage,
  onBefore: () => emit('before'),
  onSuccess: result => emit('success', result),
  onError: error => emit('error', error),
  onSettled: () => emit('settled'),
  onFeedback: (type, message) => ElMessage({ type, message })
})
const mergedLoading = computed(
  () => props.loading ?? (props.autoLoading ? actionState.loading.value : false)
)
const mergedDisabled = computed(
  () => props.disabled || (props.preventRepeat && mergedLoading.value)
)
const buttonProps = computed(() =>
  omit(props, [
    'action',
    'loading',
    'disabled',
    'autoLoading',
    'preventRepeat',
    'successMessage',
    'errorMessage'
  ])
)

watch(mergedLoading, value => emit('loading-change', value))

function handleClick(event: MouseEvent) {
  emit('click', event)
  void actionState.execute(event, 'click').catch(() => undefined)
}

const exposed: ProAsyncButtonExpose<TResult> = {
  execute: () => actionState.execute(undefined, 'api'),
  cancel: actionState.cancel,
  getLoading: () => mergedLoading.value,
  getError: () => actionState.error.value
}
defineExpose(exposed)
</script>
