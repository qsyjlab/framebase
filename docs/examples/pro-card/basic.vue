<template>
  <div class="card-stack">
    <ProCard title="基础卡片" subtitle="展示标题与正文内容">
      <p class="card-text">ProCard 提供统一的标题、副标题与正文区域，支持边框与阴影配置。</p>
    </ProCard>

    <ProCard title="带操作卡片" shadow="hover">
      <template #extra>
        <ElButton text type="primary">编辑</ElButton>
        <ElButton text type="danger">删除</ElButton>
      </template>
      <p class="card-text">通过 extra 插槽在头部右侧放置操作按钮，hover 时显示阴影。</p>
    </ProCard>

    <div class="statistic-row">
      <ProStatisticCard
        title="本月销售额"
        :value="128600"
        prefix="¥"
        :precision="2"
        trend="up"
        trend-value="12.5%"
        description="较上月增长"
      />
      <ProStatisticCard
        title="活跃用户"
        :value="8420"
        trend="down"
        trend-value="3.2%"
        description="较上周下降"
      />
      <ProStatisticCard title="待处理订单" :value="36" description="需要尽快处理" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus'
import { ProCard, ProStatisticCard } from '@framebase/element-plus-pro-components'
</script>

<style scoped>
.card-stack {
  display: grid;
  gap: 16px;
}
.card-text {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 1.6;
}
.statistic-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
@media (max-width: 720px) {
  .statistic-row {
    grid-template-columns: 1fr;
  }
}
</style>
