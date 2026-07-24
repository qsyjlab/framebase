<template>
  <section class="demo-block">
    <header>
      <div>
        <p v-if="eyebrow">{{ eyebrow }}</p>
        <h2>{{ title }}</h2>
        <span v-if="description">{{ description }}</span>
      </div>
      <div v-if="$slots.actions" class="demo-block__actions"><slot name="actions" /></div>
    </header>
    <div class="demo-block__body"><slot /></div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string; description?: string; eyebrow?: string }>()
</script>
