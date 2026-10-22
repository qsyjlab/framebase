<template>
  <div class="demo-stack">
    <DemoBlock
      title="ProLayout"
      description="四种导航模式，嵌入式实例局部绑定主题变量。独立预览支持局部绑定、同步绑定 html、仅外部 html 绑定，并可用业务弹窗验证继承。"
    >
      <template #actions>
        <el-button size="small" @click="store.toggleCollapsed()">项目 Store 切换折叠</el-button>
        <RouterLink to="/layout/preview"
          ><el-button type="primary" size="small">打开独立预览</el-button></RouterLink
        >
        <el-switch v-model="mobile" active-text="移动端" />
      </template>
      <div class="layout-frame"><LayoutDemo :store="store" height="640px" :mobile="mobile" /></div>
    </DemoBlock>
    <DemoBlock
      title="共享配置"
      description="两个实例和独立预览使用项目 store 的同一份配置。离开页面再返回，布局设置仍保留；内容区独立滚动，页头、标签栏和页脚保持固定。"
    >
      <template #actions
        ><el-button size="small" @click="store.resetSettings()">重置布局</el-button></template
      >
      <div class="layout-frame">
        <LayoutDemo :store="store" height="420px" :show-settings="false" />
      </div>
    </DemoBlock>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import DemoBlock from '../components/DemoBlock.vue'
import LayoutDemo from '../components/LayoutDemo.vue'
import { useProjectLayoutStore } from '../stores/layout'
const { layout: store } = useProjectLayoutStore()
const mobile = ref(false)
</script>
<style scoped>
.layout-frame {
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}
</style>
