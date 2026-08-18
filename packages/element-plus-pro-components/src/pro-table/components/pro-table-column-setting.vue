<template>
  <div class="pro-table-column-setting">
    <div class="pro-table-column-setting__title">
      <el-checkbox
        v-if="checkable"
        :model-value="allChecked"
        :indeterminate="indeterminate"
        @change="setAllSelectAction(Boolean($event))"
      >
        列展示
      </el-checkbox>
      <div v-else />
      <a class="pro-table-column-setting__reset" @click="$emit('reset')">重置</a>
    </div>

    <div class="pro-table-column-setting__list" :class="{ 'is-group': hasFixed }">
      <template v-for="group in groups" :key="group.key">
        <div
          v-if="group.list.length || group.key === 'normal'"
          class="pro-table-column-setting__group"
        >
          <span v-if="hasFixed" class="pro-table-column-setting__group-title">{{
            group.title
          }}</span>
          <el-tree
            v-if="group.list.length"
            :data="group.list"
            node-key="key"
            default-expand-all
            :draggable="draggable"
            :expand-on-click-node="false"
            :allow-drop="allowDrop"
            @node-drop="(drag: any, drop: any) => handleNodeDrop(group.key, drop)"
          >
            <template #default="{ data }">
              <div class="pro-table-column-setting__item">
                <ProTableIcon
                  class="pro-table-column-setting__drag"
                  name="holder"
                  aria-label="拖拽调整列顺序"
                />
                <el-checkbox
                  v-if="checkable"
                  class="pro-table-column-setting__checkbox"
                  :model-value="columnState[data.key]?.show !== false"
                  @click.stop
                  @change="$emit('visible-change', data.key, Boolean($event))"
                >
                  <span class="pro-table-column-setting__checkbox-label">
                    {{ data.title || data.key }}
                  </span>
                </el-checkbox>
                <span v-else class="pro-table-column-setting__checkbox-label">
                  {{ data.title || data.key }}
                </span>
                <span
                  v-if="data.isTopLevel"
                  class="pro-table-column-setting__option"
                  @mousedown.stop
                  @click.stop
                >
                  <el-tooltip v-if="data.fixed !== 'left'" content="固定在列首" placement="top">
                    <span
                      class="pro-table-column-setting__option-icon"
                      @click="$emit('fixed-change', data.key, 'left')"
                    >
                      <ProTableIcon name="verticalAlignTop" />
                    </span>
                  </el-tooltip>
                  <el-tooltip v-if="data.fixed" content="不固定" placement="top">
                    <span
                      class="pro-table-column-setting__option-icon"
                      @click="$emit('fixed-change', data.key, undefined)"
                    >
                      <ProTableIcon name="verticalAlignMiddle" />
                    </span>
                  </el-tooltip>
                  <el-tooltip v-if="data.fixed !== 'right'" content="固定在列尾" placement="top">
                    <span
                      class="pro-table-column-setting__option-icon"
                      @click="$emit('fixed-change', data.key, 'right')"
                    >
                      <ProTableIcon name="verticalAlignBottom" />
                    </span>
                  </el-tooltip>
                </span>
              </div>
            </template>
          </el-tree>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProTableIcon from './pro-table-icons.vue'
import type { ProTableColumnState } from '../pro-table'
import type { ProTableColumnSettingNode } from '../hooks/use-pro-table-columns'

interface NormalizedColumn extends ProTableColumnSettingNode {
  fixed?: 'left' | 'right' | undefined
  order: number
  isTopLevel: boolean
  children?: NormalizedColumn[]
}

interface TreeNodeLike {
  data: NormalizedColumn
  parent?: TreeNodeLike
  childNodes: TreeNodeLike[]
}

const props = withDefaults(
  defineProps<{
    columns: ProTableColumnSettingNode[]
    columnState: Record<string, ProTableColumnState>
    checkable?: boolean
    draggable?: boolean
  }>(),
  {
    checkable: true,
    draggable: true
  }
)

const emit = defineEmits<{
  reset: []
  'visible-change': [key: string, visible: boolean]
  'fixed-change': [key: string, fixed: 'left' | 'right' | undefined]
  reorder: [keys: string[]]
}>()

function flattenColumns(columns: NormalizedColumn[]): NormalizedColumn[] {
  return columns.flatMap(column => [column, ...flattenColumns(column.children ?? [])])
}

function normalizeColumns(
  columns: ProTableColumnSettingNode[],
  isTopLevel = true
): NormalizedColumn[] {
  return columns.map((column, index) => {
    const rawFixed = props.columnState[column.key]?.fixed
    return {
      ...column,
      fixed: rawFixed === 'left' || rawFixed === 'right' ? rawFixed : undefined,
      order: props.columnState[column.key]?.order ?? index,
      isTopLevel,
      children: column.children?.length ? normalizeColumns(column.children, false) : undefined
    }
  })
}

const normalizedColumns = computed(() => normalizeColumns(props.columns))
const flatColumns = computed(() => flattenColumns(normalizedColumns.value))
const topLevelColumns = computed(() =>
  [...normalizedColumns.value].sort((a, b) => a.order - b.order)
)

const groups = computed(() => [
  { key: 'left', title: '固定在左侧', list: orderedList('left') },
  { key: 'normal', title: '不固定', list: orderedList(undefined) },
  { key: 'right', title: '固定在右侧', list: orderedList('right') }
])

function orderedList(fixed: 'left' | 'right' | undefined): NormalizedColumn[] {
  return topLevelColumns.value.filter(column => column.fixed === fixed)
}

const hasFixed = computed(() => orderedList('left').length > 0 || orderedList('right').length > 0)

const visibleCount = computed(
  () => flatColumns.value.filter(c => props.columnState[c.key]?.show !== false).length
)
const allChecked = computed(
  () => flatColumns.value.length > 0 && visibleCount.value === flatColumns.value.length
)
const indeterminate = computed(
  () => visibleCount.value > 0 && visibleCount.value < flatColumns.value.length
)

function setAllSelectAction(show: boolean) {
  flatColumns.value.forEach(column => emit('visible-change', column.key, show))
}

function allowDrop(draggingNode: { parent: unknown }, dropNode: { parent: unknown }, type: string) {
  return type !== 'inner' && draggingNode.parent === dropNode.parent
}

function handleNodeDrop(_groupKey: string, dropNode: TreeNodeLike) {
  const keys = dropNode.parent?.childNodes.map(node => node.data.key) ?? []
  if (keys.length) emit('reorder', keys)
}
</script>

<style scoped lang="scss">
.pro-table-column-setting {
  width: 200px;

  &__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 32px;
  }

  &__reset {
    color: var(--el-color-primary);
    cursor: pointer;
  }

  &__list {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-top: 8px;

    &.is-group {
      padding-top: 0;
    }
  }

  &__group-title {
    display: block;
    margin-top: 6px;
    margin-bottom: 6px;
    padding-left: 24px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  :deep(.el-tree) {
    background: transparent;
    // 同步 drag 指示线的高度计算基准，必须与下面 __content height 一致
    --el-tree-node-content-height: 24px;
  }

  :deep(.el-tree-node__content) {
    height: var(--el-tree-node-content-height);
    border-radius: var(--framebase-radius-sm);
  }

  :deep(.el-tree-node__content > .el-tree-node__expand-icon) {
    display: none;
  }

  &__item {
    display: flex;
    min-width: 0;
    flex: 1;
    align-items: center;
    gap: 4px;
    padding-right: 2px;

    &:hover .pro-table-column-setting__option {
      display: inline-flex;
    }
  }

  &__drag {
    flex: none;
    color: var(--el-text-color-placeholder);
    cursor: grab;
    border-radius: 4px;
    padding: 2px;

    &:active {
      cursor: grabbing;
      color: var(--el-color-primary);
    }
  }

  &__checkbox {
    min-width: 0;
    flex: 1;
  }

  &__checkbox-label {
    display: inline-block;
    min-width: 0;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
  }

  // 右侧固定按钮组：默认隐藏，hover 显示（照抄 Ant Design）
  &__option {
    display: none;
    flex: none;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }

  &__option-icon {
    display: inline-flex;
    align-items: center;
    color: var(--el-color-primary);
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
