<template>
  <div
    class="pro-light-filter"
    :class="[`is-${borderStyle}`, `is-${size}`, { 'is-disabled': disabled }]"
  >
    <div class="pro-light-filter__container">
      <template v-for="field in visibleFields" :key="field.key">
        <!-- switch 类型：直接渲染为可切换的 chip，不弹窗 -->
        <div
          v-if="resolveValueType(field) === 'switch'"
          class="pro-light-filter__chip"
          :class="{ 'is-active': !!values[field.key] }"
          @click="!disabled && toggleSwitch(field)"
        >
          <span class="pro-light-filter__chip-label">{{ field.label }}</span>
          <span v-if="values[field.key]" class="pro-light-filter__chip-value">
            : {{ resolveValueLabel(field) }}
          </span>
        </div>

        <!-- 其他类型：popover 弹出 ProField 编辑面板 -->
        <el-popover
          v-else
          :visible="popoverVisible[field.key]"
          placement="bottom-start"
          trigger="click"
          :width="resolvePopoverWidth(field)"
          :popper-class="`pro-light-filter__popover is-${size}`"
          @update:visible="(v: boolean) => handlePopoverChange(field.key, v)"
        >
          <template #reference>
            <div class="pro-light-filter__chip" :class="{ 'is-active': hasValue(field) }">
              <span class="pro-light-filter__chip-label">{{ field.label }}</span>
              <span v-if="hasValue(field)" class="pro-light-filter__chip-value">
                : {{ resolveValueLabel(field) }}
              </span>
              <el-icon class="pro-light-filter__chip-arrow">
                <ArrowDown />
              </el-icon>
            </div>
          </template>

          <!-- popover 内容：优先级 render > slot:field-{valueType} > slot:field > ProField -->
          <div class="pro-light-filter__panel">
            <component
              :is="
                field.render({
                  value: resolveRenderValue(field),
                  setValue: (v: any) => handleFieldValueChange(field, v),
                  field
                })
              "
              v-if="field.render"
            />

            <slot
              v-else-if="$slots[`field-${resolveValueType(field)}`]"
              :name="`field-${resolveValueType(field)}`"
              :field="field"
              :value="tempValues[field.key]"
              :set-value="(v: any) => handleFieldValueChange(field, v)"
            />

            <slot
              v-else-if="$slots.field"
              name="field"
              :field="field"
              :value="tempValues[field.key]"
              :set-value="(v: any) => handleFieldValueChange(field, v)"
            />

            <!-- ProField 编辑模式：即时型选中即提交，延迟型只更新 tempValue -->
            <ProField
              v-else
              :model-value="tempValues[field.key]"
              mode="edit"
              :value-type="field.valueType || 'text'"
              :value-enum="field.valueEnum"
              :options="field.options"
              :option-fields="field.optionFields"
              :field-props="resolveFieldProps(field)"
              block
              @update:model-value="(v: any) => handleFieldValueChange(field, v)"
            />
          </div>

          <!-- footer：仅延迟型字段显示（输入类需要确认/清除） -->
          <div v-if="!isInstantField(field)" class="pro-light-filter__footer" @click.stop>
            <slot
              name="footer"
              :field="field"
              :confirm="() => confirmField(field.key)"
              :clear="() => clearTemp(field.key)"
            >
              <el-button
                link
                :size="size === 'small' ? 'small' : 'default'"
                class="pro-light-filter__footer-clear"
                @click="clearTemp(field.key)"
              >
                清除
              </el-button>
              <el-button
                type="primary"
                :size="size === 'small' ? 'small' : 'default'"
                @click="confirmField(field.key)"
              >
                确认
              </el-button>
            </slot>
          </div>
        </el-popover>
      </template>

      <!-- 展开/收起按钮 -->
      <div
        v-if="showMoreToggle && hasCollapsible"
        class="pro-light-filter__collapse"
        @click="toggleCollapsed"
      >
        <span>{{ isCollapsed ? '更多筛选' : '收起' }}</span>
        <el-icon class="pro-light-filter__collapse-icon" :class="{ 'is-expanded': !isCollapsed }">
          <ArrowDown />
        </el-icon>
      </div>

      <!-- 清空按钮 -->
      <div v-if="hasAnyValue" class="pro-light-filter__reset" @click="reset">清空</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { ProField } from '../pro-field'
import {
  formatProFieldValue,
  resolveProFieldValueEnum,
  resolveProFieldValueType
} from '../pro-field/pro-field-utils'
import { DEFAULT_PRO_OPTION_FIELDS, type ProOption } from '../shared/pro-option'
import { useProConfigProvider } from '../pro-config-provider/pro-config-provider-context'
import type {
  ProLightFilterField,
  ProLightFilterModelValue,
  ProLightFilterProps
} from './pro-light-filter'

const props = withDefaults(defineProps<ProLightFilterProps>(), {
  modelValue: () => ({}),
  fields: () => [],
  size: 'default',
  borderStyle: 'outlined',
  collapsedCount: 3,
  showMoreToggle: true,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: ProLightFilterModelValue): void
  (e: 'change', value: ProLightFilterModelValue): void
}>()

const configProvider = useProConfigProvider()

const values = reactive<Record<string, any>>({ ...(props.modelValue ?? {}) })
const tempValues = reactive<Record<string, any>>({})
const collapsed = ref(true)
const popoverVisible = reactive<Record<string, boolean>>({})

let isUpdating = false

watch(
  () => props.modelValue,
  val => {
    if (isUpdating || !val) return
    isUpdating = true
    Object.keys(values).forEach(key => delete values[key])
    Object.assign(values, val)
    isUpdating = false
  }
)

watch(
  values,
  val => {
    if (isUpdating) return
    isUpdating = true
    emit('update:modelValue', { ...val })
    emit('change', { ...val })
    isUpdating = false
  },
  { deep: true }
)

const isCollapsed = computed(() => collapsed.value)

const hasCollapsible = computed(() => {
  if (!props.fields) return false
  return props.fields.length > (props.collapsedCount ?? 3)
})

const visibleFields = computed(() => {
  if (!props.fields) return []
  if (!isCollapsed.value) return props.fields
  const count = props.collapsedCount ?? 3
  return props.fields.slice(0, count)
})

const hasAnyValue = computed(() => {
  return Object.values(values).some(v => v !== null && v !== undefined && v !== '' && v !== false)
})

function resolveValueType(field: ProLightFilterField): string {
  return resolveProFieldValueType(field.valueType || 'text').type
}

// 即时型字段：select/cascader/date/dateRange 等选中即提交，不需要确认按钮
const INSTANT_VALUE_TYPES = new Set([
  'select',
  'cascader',
  'date',
  'dateRange',
  'dateTime',
  'dateTimeRange',
  'time',
  'timeRange',
  'week',
  'month',
  'year',
  'radio',
  'radioButton',
  'segmented'
])

function isInstantField(field: ProLightFilterField): boolean {
  // 字段可显式声明 instant 覆盖默认行为
  if (field.instant !== undefined) return field.instant
  return INSTANT_VALUE_TYPES.has(resolveValueType(field))
}

// popover 打开时渲染的值（即时型用已提交值，延迟型用临时值）
function resolveRenderValue(field: ProLightFilterField): any {
  return tempValues[field.key]
}

// 统一的字段值变更处理：即时型立即提交并关闭，延迟型只更新 tempValue
function handleFieldValueChange(field: ProLightFilterField, value: any) {
  tempValues[field.key] = value
  if (isInstantField(field)) {
    // 即时型：立即提交并关闭 popover
    if (value === undefined || value === null || value === '') {
      delete values[field.key]
    } else {
      values[field.key] = value
    }
    // 延迟一帧关闭，避免 select 选中动画被打断
    nextTick(() => {
      popoverVisible[field.key] = false
    })
  }
}

function hasValue(field: ProLightFilterField): boolean {
  const v = values[field.key]
  return v !== null && v !== undefined && v !== ''
}

function toggleSwitch(field: ProLightFilterField) {
  values[field.key] = !values[field.key]
}

function resolveValueLabel(field: ProLightFilterField): string {
  const v = values[field.key]
  if (v === null || v === undefined || v === '') return ''

  // 优先使用字段自定义 renderLabel
  if (field.renderLabel) {
    return field.renderLabel(v, field)
  }

  // 统一复用 ProField 的格式化逻辑
  const valueTypeConfig = resolveProFieldValueType(field.valueType || 'text')
  const resolvedEnum = resolveProFieldValueEnum(field.valueEnum, configProvider.value?.dictionaries)
  const options = field.options ?? (resolvedEnum ? enumToOptions(resolvedEnum) : [])
  const optionFields = { ...DEFAULT_PRO_OPTION_FIELDS, ...field.optionFields }

  return String(formatProFieldValue(v, valueTypeConfig, options, optionFields))
}

function enumToOptions(valueEnum: NonNullable<ProLightFilterField['valueEnum']>): ProOption[] {
  const entries = valueEnum instanceof Map ? [...valueEnum.entries()] : Object.entries(valueEnum)
  return entries.map(([value, item]) => ({
    label:
      typeof item === 'object' && item !== null && 'text' in item
        ? (item as { text: string }).text
        : String(item),
    value,
    disabled:
      typeof item === 'object' && item !== null && 'disabled' in item
        ? (item as { disabled: boolean }).disabled
        : undefined
  }))
}

function resolveFieldProps(field: ProLightFilterField): Record<string, unknown> {
  const extra: Record<string, unknown> = {}
  if (field.placeholder) {
    extra.placeholder = field.placeholder
  }
  return { ...extra, ...(field.fieldProps ?? {}) }
}

// 根据字段类型决定 popover 宽度，避免 select/输入框宽度不占满
function resolvePopoverWidth(field: ProLightFilterField): number | 'auto' {
  if (field.popoverWidth !== undefined) return field.popoverWidth
  const type = resolveValueType(field)
  // 宽型控件：日期/日期范围/级联 给固定宽度
  if (type === 'dateRange' || type === 'cascader') return 320
  if (type === 'date') return 240
  // 默认 select/text/number 用 200（与 Ant Design light filter 一致）
  return 200
}

function toggleCollapsed() {
  collapsed.value = !collapsed.value
}

function handlePopoverChange(key: string, visible: boolean) {
  popoverVisible[key] = visible
  // 打开时同步当前值到临时状态，关闭时丢弃未确认的临时值
  if (visible) {
    tempValues[key] = values[key] === undefined ? undefined : values[key]
  }
}

// 确认：提交临时值到 values 并关闭 popover
function confirmField(key: string) {
  const temp = tempValues[key]
  if (temp === undefined || temp === null || temp === '') {
    delete values[key]
  } else {
    values[key] = temp
  }
  popoverVisible[key] = false
}

// 清除：仅清空临时值，不直接提交（与 Ant Design 一致）
function clearTemp(key: string) {
  tempValues[key] = undefined
}

function setValue(key: string, value: unknown) {
  values[key] = value
}

function reset() {
  Object.keys(values).forEach(key => delete values[key])
  emit('update:modelValue', {})
  emit('change', {})
}

defineExpose({
  values: values as ProLightFilterModelValue,
  collapsed,
  toggleCollapsed,
  setValue,
  reset
})
</script>

<style scoped lang="scss">
.pro-light-filter {
  display: flex;
  width: 100%;

  &__container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  // ── Chip 标签 ──
  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    height: 32px;
    padding: 0 8px 0 12px;
    border-radius: 6px;
    border: 1px solid var(--el-border-color);
    background: var(--el-bg-color);
    color: var(--el-text-color-regular);
    font-size: var(--el-font-size-base);
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }

    &.is-active {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);

      .pro-light-filter__chip-value {
        color: var(--el-color-primary);
      }
    }
  }

  &__chip-label {
    font-weight: 500;
  }

  &__chip-value {
    color: var(--el-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
  }

  &__chip-arrow {
    margin-left: 2px;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    transition: transform 0.2s;

    .pro-light-filter__chip:hover & {
      color: var(--el-color-primary);
    }
  }

  // ── 展开/收起 ──
  &__collapse {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    height: 32px;
    padding: 0 4px;
    color: var(--el-color-primary);
    font-size: var(--el-font-size-base);
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }

  &__collapse-icon {
    font-size: 12px;
    transition: transform 0.2s;

    &.is-expanded {
      transform: rotate(180deg);
    }
  }

  // ── 清空 ──
  &__reset {
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 4px;
    color: var(--el-text-color-secondary);
    font-size: var(--el-font-size-base);
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    transition: color 0.2s;

    &:hover {
      color: var(--el-color-danger);
    }
  }

  // ── 尺寸 ──
  &.is-small {
    .pro-light-filter__chip {
      height: 24px;
      padding: 0 6px 0 10px;
      font-size: var(--el-font-size-small);
      border-radius: 4px;
    }

    .pro-light-filter__collapse,
    .pro-light-filter__reset {
      height: 24px;
      font-size: var(--el-font-size-small);
    }

    .pro-light-filter__chip-arrow {
      font-size: 10px;
    }
  }

  &.is-large {
    .pro-light-filter__chip {
      height: 40px;
      padding: 0 12px 0 16px;
      font-size: var(--el-font-size-medium);
    }

    .pro-light-filter__collapse,
    .pro-light-filter__reset {
      height: 40px;
      font-size: var(--el-font-size-medium);
    }
  }

  // ── 边框风格 ──
  &.is-borderless {
    .pro-light-filter__chip {
      border-color: transparent;
      background: var(--el-fill-color-light);

      &:hover {
        background: var(--el-fill-color);
        border-color: transparent;
      }

      &.is-active {
        background: var(--el-color-primary-light-9);
        border-color: transparent;
      }
    }
  }

  &.is-filled {
    .pro-light-filter__chip {
      border-color: transparent;
      background: var(--el-fill-color-light);

      &:hover {
        background: var(--el-fill-color);
        border-color: transparent;
      }

      &.is-active {
        background: var(--el-color-primary-light-9);
        border-color: transparent;
      }
    }
  }

  &.is-underlined {
    .pro-light-filter__chip {
      border: none;
      border-radius: 0;
      border-bottom: 2px solid var(--el-border-color);
      background: transparent;
      padding: 0 4px 0 0;

      &:hover {
        border-bottom-color: var(--el-color-primary);
        background: transparent;
      }

      &.is-active {
        border-bottom-color: var(--el-color-primary);
        background: transparent;
      }
    }
  }

  // ── 禁用 ──
  &.is-disabled {
    .pro-light-filter__chip,
    .pro-light-filter__collapse,
    .pro-light-filter__reset {
      cursor: not-allowed;
      opacity: 0.5;
      pointer-events: none;
    }
  }
}
</style>

<style lang="scss">
// popover 内容样式（非 scoped）
.pro-light-filter__popover {
  .pro-light-filter__panel {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 4px 0;

    // ProField 内部控件占满 panel 宽度
    .el-select,
    .el-input,
    .el-date-editor {
      width: 100%;
    }
  }

  .pro-light-filter__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  &.is-small {
    .pro-light-filter__panel {
      .el-input__wrapper,
      .el-select__wrapper {
        min-height: 24px;
      }
    }

    .pro-light-filter__footer {
      margin-top: 6px;
      padding-top: 6px;
    }
  }
}
</style>
