<template>
  <LayoutDemo :store="store" :bind-theme="themeBinding !== 'external'">
    <template #header-actions>
      <el-select
        v-model="themeBinding"
        aria-label="主题变量绑定方式"
        style="width: 180px"
        size="small"
      >
        <el-option label="仅 Layout 局部绑定" value="local" />
        <el-option label="Layout + html 同步" value="sync" />
        <el-option label="仅外部 html 绑定" value="external" />
      </el-select>
      <el-button size="small" @click="dialogVisible = true">打开业务弹窗</el-button>
      <RouterLink to="/layout">返回示例</RouterLink>
    </template>
  </LayoutDemo>
  <el-dialog v-model="dialogVisible" title="外部业务弹窗" width="480px" append-to-body>
    <p>此弹窗没有绑定主题变量，直接继承 html 上的主题。切换绑定方式可对比效果。</p>
    <el-input placeholder="输入业务内容" />
    <template #footer>
      <el-button
        @click="store.setSetting('theme', store.config.theme === 'dark' ? 'light' : 'dark')"
      >
        切换应用主题
      </el-button>
      <el-button type="primary" @click="dialogVisible = false">确认</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { bindProLayoutTheme } from '@framebase/element-plus-pro-components'
import LayoutDemo from '../components/LayoutDemo.vue'
import { useProjectLayoutStore } from '../stores/layout'
const { layout: store } = useProjectLayoutStore()
const themeBinding = ref<'local' | 'sync' | 'external'>('external')
const dialogVisible = ref(false)
// 绑定由项目页面持有；切到局部模式或离开页面时恢复 html 原样式。
bindProLayoutTheme(store.config, () =>
  themeBinding.value === 'local' ? undefined : document.documentElement
)
</script>
