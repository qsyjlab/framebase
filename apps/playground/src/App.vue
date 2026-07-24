<template>
  <div class="app-shell">
    <aside class="app-sidebar">
      <RouterLink class="brand" to="/">
        <span class="brand__mark">F</span>
        <span>
          <strong>Framebase</strong>
          <small>Pro Components</small>
        </span>
      </RouterLink>

      <nav class="app-nav" aria-label="组件示例导航">
        <section v-for="group in navigation" :key="group.title" class="nav-group">
          <h2>{{ group.title }}</h2>
          <RouterLink v-for="item in group.items" :key="item.path" :to="item.path">
            {{ item.title }}
            <small>{{ item.components.length }}</small>
          </RouterLink>
        </section>
      </nav>
    </aside>

    <div class="app-main">
      <header class="app-topbar">
        <div>
          <p>{{ route.meta.eyebrow ?? '@framebase/element-plus-pro-components' }}</p>
          <h1>{{ route.meta.title ?? '组件总览' }}</h1>
          <span>{{ route.meta.description }}</span>
        </div>
        <div class="topbar-actions">
          <el-tag type="success" effect="plain">dist consumer</el-tag>
          <el-tooltip :content="isDark ? '切换为亮色模式' : '切换为深色模式'">
            <el-button
              circle
              :icon="isDark ? Sunny : Moon"
              :aria-label="isDark ? '切换为亮色模式' : '切换为深色模式'"
              @click="toggleTheme"
            />
          </el-tooltip>
        </div>
      </header>

      <main class="app-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { navigation } from './router'

const route = useRoute()
const isDark = ref(document.documentElement.classList.contains('dark'))

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}
</script>
