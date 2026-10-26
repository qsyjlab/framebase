<script setup lang="ts">
import { ProList } from '@framebase/element-plus-pro-components'

interface Record {
  id: number
  name: string
  email: string
  avatar: string
}

const data: Record[] = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', avatar: 'https://i.pravatar.cc/80?img=1' },
  { id: 2, name: '李四', email: 'lisi@example.com', avatar: 'https://i.pravatar.cc/80?img=2' }
]
</script>

<template>
  <ProList
    :data="data"
    row-key="id"
    :item-meta="{
      title: 'name',
      description: 'email',
      avatar: 'avatar'
    }"
  />
</template>
