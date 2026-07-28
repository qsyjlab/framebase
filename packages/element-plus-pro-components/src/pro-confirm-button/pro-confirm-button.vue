<template>
  <template v-if="accessState.visible">
    <el-popconfirm
      v-if="confirmConfig.mode === 'popconfirm'"
      :title="confirmConfig.title"
      :confirm-button-text="confirmConfig.confirmText"
      :cancel-button-text="confirmConfig.cancelText"
      :confirm-button-type="confirmButtonType"
      :icon-color="confirmIconColor"
      @confirm="handleConfirmed"
      @cancel="handleCancelled"
    >
      <template #reference>
        <span class="pro-confirm-button__trigger" :title="deniedTitle">
          <el-button
            v-bind="buttonProps"
            :loading="mergedLoading"
            :disabled="mergedDisabled"
            @click="event => $emit('click', event)"
          >
            <slot />
          </el-button>
        </span>
      </template>
    </el-popconfirm>

    <span v-else class="pro-confirm-button__trigger" :title="deniedTitle">
      <el-button
        v-bind="buttonProps"
        :loading="mergedLoading"
        :disabled="mergedDisabled"
        @click="handleMessageBoxClick"
      >
        <slot />
      </el-button>
    </span>
  </template>
</template>

<script setup lang="ts" generic="TResult = unknown">
import { computed, watch } from 'vue'
import { omit } from 'lodash-es'
import { ElButton, ElMessage, ElMessageBox, ElPopconfirm, type ButtonProps } from 'element-plus'
import { useProAsyncAction } from '../pro-async-button/use-pro-async-action'
import type { ProConfirmButtonExpose, ProConfirmButtonProps } from './pro-confirm-button'
import { normalizeProConfirmConfig, resolveProConfirmAccess } from './pro-confirm-button-utils'

defineOptions({ name: 'ProConfirmButton' })

const props = withDefaults(defineProps<ProConfirmButtonProps<TResult>>(), {
  loading: undefined,
  disabled: false,
  autoLoading: true,
  preventRepeat: true,
  nativeType: 'button',
  access: true,
  deniedBehavior: 'hide'
})
const emit = defineEmits<{
  click: [event: MouseEvent]
  confirm: []
  cancel: []
  before: []
  success: [result: TResult]
  error: [error: unknown]
  settled: []
  'loading-change': [loading: boolean]
}>()

const confirmConfig = computed(() => normalizeProConfirmConfig(props.confirm))
const accessState = computed(() => resolveProConfirmAccess(props.access, props.deniedBehavior))
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
  () => props.disabled || accessState.value.disabled || (props.preventRepeat && mergedLoading.value)
)
const deniedTitle = computed(() => (accessState.value.disabled ? props.deniedReason : undefined))
const confirmButtonType = computed<ButtonProps['type']>(() =>
  confirmConfig.value.type === 'danger' ? 'danger' : 'primary'
)
const confirmIconColor = computed(() =>
  confirmConfig.value.type === 'danger'
    ? 'var(--el-color-danger, #f56c6c)'
    : 'var(--el-color-warning, #e6a23c)'
)
const buttonProps = computed(() =>
  omit(props, [
    'action',
    'confirm',
    'loading',
    'disabled',
    'autoLoading',
    'preventRepeat',
    'successMessage',
    'errorMessage',
    'access',
    'deniedBehavior',
    'deniedReason'
  ])
)

watch(mergedLoading, value => emit('loading-change', value))

function handleConfirmed(event?: MouseEvent) {
  emit('confirm')
  void actionState.execute(event, 'click').catch(() => undefined)
}

function handleCancelled() {
  emit('cancel')
}

async function handleMessageBoxClick(event: MouseEvent) {
  emit('click', event)
  if (mergedDisabled.value) return
  const config = confirmConfig.value
  try {
    await ElMessageBox.confirm(
      config.description ?? config.title,
      config.description ? config.title : '确认操作',
      {
        type: config.type === 'danger' ? 'warning' : config.type === 'warning' ? 'warning' : 'info',
        confirmButtonText: config.confirmText,
        cancelButtonText: config.cancelText,
        confirmButtonClass: config.type === 'danger' ? 'el-button--danger' : undefined,
        showCancelButton: true
      }
    )
    handleConfirmed(event)
  } catch {
    handleCancelled()
  }
}

const exposed: ProConfirmButtonExpose<TResult> = {
  execute: () => actionState.execute(undefined, 'api'),
  cancel: actionState.cancel,
  getLoading: () => mergedLoading.value,
  getError: () => actionState.error.value
}
defineExpose(exposed)
</script>

<style scoped>
.pro-confirm-button__trigger {
  display: inline-flex;
}
</style>
