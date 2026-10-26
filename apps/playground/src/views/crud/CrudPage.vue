<template>
  <div class="demo-stack">
    <DemoBlock
      title="useCrudTable 全链路 CRUD"
      description="查询条件、选中、列定义、增删改查动作由同一个 hook 承接；页面只负责布局，不再手写 params / selectedKeys / 确认弹窗 / 刷新策略。"
    >
      <template #actions>
        <el-tag size="small" type="info">共 {{ total }} 条</el-tag>
        <el-tag size="small" :type="selectedKeys.length ? 'warning' : 'info'">
          已选 {{ selectedKeys.length }}
        </el-tag>
      </template>

      <div class="crud-toolbar">
        <el-input
          v-model="params.keyword"
          class="crud-toolbar__field"
          placeholder="搜索姓名 / 邮箱"
          clearable
          @keyup.enter="table.reload()"
        />
        <el-select v-model="params.status" class="crud-toolbar__field" placeholder="状态" clearable>
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <el-select
          v-model="params.department"
          class="crud-toolbar__field"
          placeholder="部门"
          clearable
        >
          <el-option v-for="item in departments" :key="item" :label="item" :value="item" />
        </el-select>
        <el-button :disabled="!isDirtyParams" @click="resetParams()">重置条件</el-button>
        <span class="crud-toolbar__spacer" />
        <el-button type="primary" @click="openCreate()">新增用户</el-button>
        <el-button
          type="danger"
          plain
          :disabled="!selectedKeys.length"
          :loading="removing"
          @click="removeMany()"
        >
          批量删除
        </el-button>
      </div>

      <ProTable
        ref="tableRef"
        v-bind="tableProps"
        header-title="用户列表"
        :border="false"
        :pagination="{ pageSize: 8 }"
      />

      <div class="demo-value">
        params = {{ JSON.stringify(params) }}<br />
        selectedKeys = {{ selectedKeys }}<br />
        isDirtyParams = {{ isDirtyParams }}
      </div>

      <UserForm ref="formRef" :submit="submitForm" />
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  ProTable,
  useCrudTable,
  type CrudTableFormController
} from '@framebase/element-plus-pro-components'
import DemoBlock from '../../components/DemoBlock.vue'
import {
  createUser,
  deleteUser,
  deleteUsers,
  departments,
  fetchUsers,
  updateUser,
  type UserFormModel,
  type UserQuery,
  type UserRecord
} from './api'
import { userColumns } from './columns'
import UserForm from './UserForm.vue'

const formRef = shallowRef<CrudTableFormController<UserFormModel> | null>(null)

const crud = useCrudTable<UserRecord, UserQuery, UserFormModel>({
  request: fetchUsers,
  defaultParams: { keyword: '' },
  columns: userColumns,
  create: createUser,
  update: (row, values) => updateUser(row.id, values),
  remove: row => deleteUser(row.id),
  removeMany: (_rows, keys) => deleteUsers(keys as number[]),
  form: {
    ref: formRef,
    titles: { create: '新增用户', edit: '编辑用户' },
    toFormValues: row => ({
      name: row.name,
      email: row.email,
      department: row.department,
      status: row.status
    })
  }
})

const {
  table,
  tableRef,
  tableProps,
  params,
  selectedKeys,
  isDirtyParams,
  removing,
  openCreate,
  resetParams,
  removeMany,
  submitForm
} = crud

const total = table.total
</script>

<style scoped>
.crud-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}
.crud-toolbar__field {
  width: 180px;
}
.crud-toolbar__spacer {
  flex: 1 1 auto;
}
</style>
