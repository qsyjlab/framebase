<template>
  <div class="demo-stack">
    <DemoBlock title="ProList" description="列表与网格布局、分页、选择和操作插槽。">
      <template #actions>
        <el-radio-group v-model="layout" size="small">
          <el-radio-button value="list">列表</el-radio-button>
          <el-radio-button value="grid">网格</el-radio-button>
        </el-radio-group>
      </template>
      <ProList
        v-model:selected-keys="selectedKeys"
        :data="tasks"
        :item-meta="{ title: 'title', description: 'description', content: 'content' }"
        row-key="id"
        :layout="layout"
        :grid-columns="2"
        selectable
        bordered
        split
        :pagination="{ pageSize: 4 }"
      >
        <template #actions="{ record }">
          <el-button link type="primary" @click="openTask(record.title)">处理</el-button>
        </template>
      </ProList>
      <div class="demo-value">selectedKeys: {{ selectedKeys }}</div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { ProList } from '@framebase/element-plus-pro-components'
import DemoBlock from '../components/DemoBlock.vue'

const layout = ref<'list' | 'grid'>('list')
const selectedKeys = ref<Array<string | number>>([])
const tasks = Array.from({ length: 7 }, (_, index) => ({
  id: index + 1,
  title: `交付任务 ${index + 1}`,
  description: index % 2 ? '等待业务确认验收标准' : '负责人正在处理本周发布事项',
  content: `优先级 P${(index % 3) + 1} · 预计 ${index + 1} 天完成`
}))

function openTask(title: string) { ElMessage.info(`打开 ${title}`) }
</script>
