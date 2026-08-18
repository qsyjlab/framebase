<template>
  <div
    :class="['pro-table-cell', { 'is-editing': isEditing, 'pro-table-drag-handle': dragHandle }]"
  >
    <ProTableIcon v-if="dragHandle" class="pro-table-drag-handle__icon" name="holder" />
    <div class="pro-table-cell__content">
      <pro-table-render-content v-if="slot" :content="slotContent" />
      <div v-else-if="isEditing" class="pro-table-editable-cell" :class="{ 'is-error': error }">
        <component
          :is="editorComponent"
          v-if="editorComponent"
          v-bind="editorProps"
          :model-value="rawValue"
          @update:model-value="updateValue"
        />
        <pro-field
          v-else
          v-bind="editorProps"
          :model-value="rawValue"
          :value-type="valueType"
          :value-enum="valueEnum"
          mode="edit"
          @update:model-value="updateValue"
        />
        <div v-if="error" class="pro-table-editable-cell__error">{{ error }}</div>
      </div>
      <span v-else class="pro-table-cell__read">
        <pro-table-render-content v-if="column.render" :content="renderedContent" />
        <pro-field
          v-else
          :model-value="value"
          :value-type="valueType"
          :value-enum="valueEnum"
          :field-props="column.fieldProps"
          :empty-text="column.emptyText"
          :formatter="column.formatter"
          mode="read"
        />
        <el-tooltip v-if="column.copyable" content="复制" placement="top">
          <button
            type="button"
            class="pro-table-cell__copy"
            :aria-label="`复制${column.title ?? String(column.key)}`"
            @click.stop="copyValue"
          >
            <el-icon><DocumentCopy /></el-icon>
          </button>
        </el-tooltip>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts" generic="TRecord extends object = Record<string, unknown>">
import { computed, resolveDynamicComponent, type Slots, type VNodeChild } from 'vue'
import { DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ProTableIcon from './pro-table-icons.vue'
import { ProField } from '../../pro-field'
import { getProPathValue } from '../../shared/pro-path'
import { copyProText } from '../../shared/pro-copy'
import type {
  ProTableColumn,
  ProTableCopyConfig,
  ProTableEditableRowState,
  ProTableRenderScope
} from '../pro-table'
import { getProTableColumnKey, resolveProTableRenderText } from '../pro-table-utils'
import { ProTableRenderContent } from './pro-table-render-content'

const props = defineProps<{
  row: TRecord
  index: number
  column: ProTableColumn<TRecord>
  tableSlots?: Slots
  dragHandle?: boolean
  editableState?: ProTableEditableRowState<TRecord>
  updateEditableValue?: (row: TRecord, column: ProTableColumn<TRecord>, value: unknown) => void
  customRenderAfter?: (value: VNodeChild, scope: ProTableRenderScope<TRecord>) => VNodeChild
}>()

const source = computed(() => props.editableState?.data ?? props.row)
const rawValue = computed(() =>
  getProPathValue(source.value, props.column.dataIndex ?? String(props.column.key))
)
const rawScope = computed<ProTableRenderScope<TRecord>>(() => ({
  row: props.row,
  value: rawValue.value,
  index: props.index,
  column: props.column,
  editableState: props.editableState
}))
const value = computed(() => resolveProTableRenderText(rawScope.value))
const scope = computed<ProTableRenderScope<TRecord>>(() => ({
  ...rawScope.value,
  value: value.value
}))
const slot = computed(() => props.tableSlots?.[getProTableColumnKey(props.column)])
const slotContent = computed(() => slot.value?.(scope.value))
const isEditing = computed(() => {
  const editable =
    typeof props.column.editable === 'function'
      ? props.column.editable(scope.value)
      : props.column.editable
  return Boolean(editable && props.editableState)
})
const valueType = computed(() =>
  typeof props.column.valueType === 'function'
    ? props.column.valueType(scope.value)
    : props.column.valueType
)
const valueEnum = computed(() =>
  typeof props.column.valueEnum === 'function'
    ? props.column.valueEnum(scope.value)
    : props.column.valueEnum
)
const error = computed(() => props.editableState?.errors[String(props.column.key)]?.[0]?.message)
const editorComponent = computed(() => {
  const component = props.column.rowComponent?.el
  return component ? resolveDynamicComponent(component) : undefined
})
const editorProps = computed(() => ({
  ...props.column.fieldProps,
  ...(typeof props.column.rowComponent?.props === 'function'
    ? props.column.rowComponent.props(scope.value)
    : props.column.rowComponent?.props)
}))
const renderedContent = computed(() => {
  const rendered = props.column.render?.(scope.value)
  if (rendered == null) return []
  return props.customRenderAfter ? props.customRenderAfter(rendered, scope.value) : rendered
})

function updateValue(nextValue: unknown) {
  props.updateEditableValue?.(props.row, props.column, nextValue)
}

async function copyValue() {
  const config: ProTableCopyConfig<TRecord> =
    typeof props.column.copyable === 'object' ? props.column.copyable : {}
  const text =
    typeof config.text === 'function'
      ? config.text(scope.value)
      : (config.text ?? String(value.value ?? ''))

  try {
    await copyProText(text)
    ElMessage.success(config.successText ?? '复制成功')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
// inline-flex 保证与展开图标等同级行内元素同行展示，
// 并让 .cell.el-tooltip（show-overflow-tooltip）的 white-space: nowrap 正常继承生效
.pro-table-cell {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-width: 0;
  vertical-align: middle;

  // 编辑态恢复占满列宽，编辑控件不受省略号链路影响
  &.is-editing {
    display: block;
  }
}

.pro-table-cell__content {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pro-table-cell__read {
  display: inline-flex;
  max-width: 100%;
  min-width: 0;
  align-items: center;
  gap: 6px;
  overflow: hidden;

  :deep(.pro-field) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.pro-table-cell__copy {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--el-text-color-secondary);
  cursor: pointer;

  &:hover {
    color: var(--el-color-primary);
  }
}
</style>
