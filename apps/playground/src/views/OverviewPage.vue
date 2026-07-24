<template>
  <div class="demo-stack">
    <DemoBlock
      title="发布产物验收站"
      description="本应用不再 alias 到源码，也不全量注册 Element Plus；页面运行的就是 packages/*/dist。"
    >
      <el-alert type="success" :closable="false" show-icon>
        Playground 当前覆盖 {{ componentCount }} 个公开 UI 组件。构建失败、样式遗漏和运行时入口冲突都会在这里暴露。
      </el-alert>
    </DemoBlock>

    <section v-for="group in componentGroups" :key="group.title" class="demo-stack">
      <h2 class="group-title">{{ group.title }}</h2>
      <div class="component-grid">
        <RouterLink v-for="item in group.items" :key="item.path" class="component-link" :to="item.path">
          <strong>{{ item.title }}</strong>
          <span>{{ item.components.join(' · ') || 'Playground 使用说明' }}</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import DemoBlock from '../components/DemoBlock.vue'
import { navigation } from '../router'

const componentGroups = navigation.filter(group => group.items.some(item => item.components.length))
const componentCount = computed(() =>
  new Set(componentGroups.flatMap(group => group.items.flatMap(item => item.components))).size
)
</script>

<style scoped>
.group-title { margin: 6px 0 -6px; font-size: 16px; }
</style>
