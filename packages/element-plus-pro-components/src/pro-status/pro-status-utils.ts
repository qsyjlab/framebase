import type {
  ProStatusColor,
  ProStatusColors,
  ProStatusMeta,
  ProStatusTone,
  ProStatusValueEnum
} from './pro-status'

const toneColors: Record<ProStatusTone, Required<ProStatusColors>> = {
  default: {
    foreground: 'var(--el-text-color-regular, #606266)',
    background: 'var(--el-fill-color-light, #f5f7fa)',
    border: 'var(--el-border-color, #dcdfe6)',
    dot: 'var(--el-text-color-placeholder, #a8abb2)'
  },
  primary: createSemanticColors('primary', '#409eff'),
  processing: createSemanticColors('primary', '#409eff'),
  success: createSemanticColors('success', '#67c23a'),
  warning: createSemanticColors('warning', '#e6a23c'),
  danger: createSemanticColors('danger', '#f56c6c'),
  info: createSemanticColors('info', '#909399')
}

function createSemanticColors(name: string, fallback: string): Required<ProStatusColors> {
  return {
    foreground: `var(--el-color-${name}, ${fallback})`,
    background: `var(--el-color-${name}-light-9, color-mix(in srgb, ${fallback} 10%, transparent))`,
    border: `var(--el-color-${name}-light-7, color-mix(in srgb, ${fallback} 30%, transparent))`,
    dot: `var(--el-color-${name}, ${fallback})`
  }
}

export function resolveProStatusColors(
  tone: ProStatusTone = 'default',
  color?: ProStatusColor
): Required<ProStatusColors> {
  const defaults = toneColors[tone]
  if (!color) return { ...defaults }
  if (typeof color === 'string') {
    return {
      foreground: color,
      background: `color-mix(in srgb, ${color} 10%, transparent)`,
      border: `color-mix(in srgb, ${color} 30%, transparent)`,
      dot: color
    }
  }
  return { ...defaults, ...color }
}

export function getProStatusMeta<TValue extends PropertyKey>(
  valueEnum: ProStatusValueEnum<TValue> | undefined,
  value: TValue | null | undefined
): ProStatusMeta | undefined {
  if (!valueEnum || value === null || value === undefined) return undefined
  const current = valueEnum instanceof Map ? valueEnum.get(value) : valueEnum[value]
  if (current === undefined) return undefined
  return typeof current === 'string' ? { text: current } : current
}

export function getProStatusText(value: PropertyKey | null | undefined, text?: string) {
  if (text !== undefined) return text
  return value === null || value === undefined || value === '' ? '' : String(value)
}

export function resolveProStatusTagColors(
  colors: Required<ProStatusColors>,
  effect: 'light' | 'plain' | 'dark'
) {
  if (effect === 'dark') {
    return {
      color: 'var(--el-color-white, #fff)',
      backgroundColor: colors.foreground,
      borderColor: colors.foreground
    }
  }
  return {
    color: colors.foreground,
    backgroundColor: effect === 'plain' ? 'transparent' : colors.background,
    borderColor: colors.border
  }
}
