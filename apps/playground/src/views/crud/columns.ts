import type { CrudTableHelpers, ProTableColumns } from '@framebase/element-plus-pro-components'
import { departments, type UserRecord } from './api'

export const statusEnum = {
  active: { text: '启用', type: 'success' },
  disabled: { text: '禁用', type: 'info' }
} as const

export const departmentEnum = departments.reduce<Record<string, { text: string; type: 'primary' }>>(
  (result, name) => {
    result[name] = { text: name, type: 'primary' }
    return result
  },
  {}
)

/**
 * 列定义：只描述「数据怎么展示」，操作按钮交给 helpers.actionColumn，
 * 避免每个页面重复写 h(ElButton, ...)。
 */
export function userColumns({
  actionColumn
}: CrudTableHelpers<UserRecord>): ProTableColumns<UserRecord> {
  return [
    { key: 'name', dataIndex: 'name', title: '姓名', minWidth: 120, serverSort: 'name' },
    { key: 'email', dataIndex: 'email', title: '邮箱', minWidth: 200 },
    {
      key: 'department',
      dataIndex: 'department',
      title: '部门',
      width: 110,
      valueType: 'tag',
      valueEnum: departmentEnum
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: '状态',
      width: 100,
      valueType: 'status',
      valueEnum: statusEnum
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: '创建时间',
      width: 180,
      valueType: 'datetime',
      serverSort: true
    },
    actionColumn({ width: 130 })
  ]
}
