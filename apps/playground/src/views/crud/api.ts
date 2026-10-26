import type {
  ProTableRequestParams,
  ProTableRequestResult
} from '@framebase/element-plus-pro-components'

export type UserStatus = 'active' | 'disabled'

export interface UserRecord {
  id: number
  name: string
  email: string
  department: string
  status: UserStatus
  createdAt: string
}

/** 业务查询条件：由搜索表单产生，不属于表格协议。 */
export interface UserQuery {
  keyword?: string
  status?: UserStatus
  department?: string
}

export interface UserFormModel {
  name: string
  email: string
  department: string
  status: UserStatus
}

export const departments = ['产品', '研发', '设计', '运营'] as const

const familyNames = ['张', '李', '王', '赵', '陈', '刘', '杨', '黄']
const givenNames = ['伟', '娜', '强', '敏', '磊', '静', '洋', '芳']

function seedUser(index: number): UserRecord {
  return {
    id: index + 1,
    name: `${familyNames[index % familyNames.length]}${givenNames[(index * 3) % givenNames.length]}`,
    email: `user${index + 1}@framebase.dev`,
    department: departments[index % departments.length]!,
    status: index % 4 === 3 ? 'disabled' : 'active',
    createdAt: new Date(2026, 0, 1 + index * 3, 9, 30).toISOString()
  }
}

/** 内存数据库：模拟后端，刷新页面即重置。 */
const database: UserRecord[] = Array.from({ length: 46 }, (_, index) => seedUser(index))
let sequence = database.length

const delay = (ms = 220) => new Promise<void>(resolve => setTimeout(resolve, ms))

/** 列表：过滤 → 排序 → 分页，全部在「服务端」完成。 */
export async function fetchUsers(
  params: ProTableRequestParams<UserQuery>
): Promise<ProTableRequestResult<UserRecord>> {
  await delay()
  const { current, pageSize, keyword, status, department, sorter } = params
  let rows = [...database]

  const trimmed = keyword?.trim()
  if (trimmed) {
    rows = rows.filter(row => row.name.includes(trimmed) || row.email.includes(trimmed))
  }
  if (status) rows = rows.filter(row => row.status === status)
  if (department) rows = rows.filter(row => row.department === department)

  if (sorter) {
    const direction = sorter.order === 'descending' ? -1 : 1
    const field = sorter.field ?? sorter.key
    rows.sort((left, right) => {
      if (field === 'createdAt') {
        return (
          (new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()) * direction
        )
      }
      if (field === 'name') return left.name.localeCompare(right.name, 'zh-Hans-CN') * direction
      return 0
    })
  }

  const start = (current - 1) * pageSize
  return { data: rows.slice(start, start + pageSize), total: rows.length, success: true }
}

export async function createUser(values: UserFormModel) {
  await delay()
  sequence += 1
  database.unshift({ id: sequence, ...values, createdAt: new Date().toISOString() })
}

export async function updateUser(id: number, values: UserFormModel) {
  await delay()
  const index = database.findIndex(row => row.id === id)
  if (index < 0) throw new Error('用户不存在或已被删除')
  database[index] = { ...database[index]!, ...values }
}

export async function deleteUser(id: number) {
  await delay()
  const index = database.findIndex(row => row.id === id)
  if (index >= 0) database.splice(index, 1)
}

export async function deleteUsers(ids: number[]) {
  await delay()
  const targets = new Set(ids)
  for (let index = database.length - 1; index >= 0; index -= 1) {
    if (targets.has(database[index]!.id)) database.splice(index, 1)
  }
}
