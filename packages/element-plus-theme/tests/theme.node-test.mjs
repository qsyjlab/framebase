import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const sourceRoot = new URL('../src/', import.meta.url)

test('theme sources do not depend on application variables or layout selectors', async () => {
  const files = [
    'tokens.scss',
    'dark.scss',
    'components/menu.scss',
    'components/card.scss',
    'components/form-controls.scss',
    'components/select.scss',
    'components/table.scss'
  ]
  const source = (
    await Promise.all(files.map(file => readFile(new URL(file, sourceRoot), 'utf8')))
  ).join('\n')

  assert.doesNotMatch(source, /--global-/)
  assert.doesNotMatch(source, /--layout-/)
  assert.doesNotMatch(source, /basic-layout|is-dark-navigation-menu/)
})

test('form controls keep Framebase dimensions when Element Plus styles load later', async () => {
  const controls = await readFile(new URL('components/form-controls.scss', sourceRoot), 'utf8')
  const select = await readFile(new URL('components/select.scss', sourceRoot), 'utf8')

  assert.match(controls, /\.el-select \.el-select__wrapper/)
  assert.match(controls, /var\(--framebase-radius-md\)/)
  assert.match(select, /\.el-select-dropdown\s*\{[\s\S]*\.el-select-dropdown__item/)
  assert.match(select, /height: var\(--framebase-control-height\);/)
  assert.match(select, /padding: 0 12px;/)
})

test('theme exposes stable customization tokens', async () => {
  const tokens = await readFile(new URL('tokens.scss', sourceRoot), 'utf8')
  const dark = await readFile(new URL('dark.scss', sourceRoot), 'utf8')
  assert.match(tokens, /^html:root\s*\{/m)
  assert.match(tokens, /--framebase-color-bg:/)
  assert.match(tokens, /--framebase-color-text-primary:/)
  assert.match(tokens, /--framebase-color-primary: #2b62e8;/)
  assert.match(tokens, /--framebase-color-primary-light-1: #4a76ef;/)
  assert.match(tokens, /--framebase-color-primary-light-9: #eef4ff;/)
  assert.match(tokens, /--el-color-primary: var\(--framebase-color-primary\);/)
  assert.match(tokens, /--el-color-primary-light-1: var\(--framebase-color-primary-light-1\);/)
  assert.match(tokens, /--el-color-primary-light-9: var\(--framebase-color-primary-light-9\);/)
  assert.match(dark, /--el-color-primary: var\(--framebase-color-primary\);/)
  assert.match(tokens, /--framebase-border-radius-base:/)
  assert.match(tokens, /--framebase-shadow-light:/)
})

test('table theme exposes re-ap inspired semantic styling', async () => {
  const tokens = await readFile(new URL('tokens.scss', sourceRoot), 'utf8')
  const dark = await readFile(new URL('dark.scss', sourceRoot), 'utf8')
  const table = await readFile(new URL('components/table.scss', sourceRoot), 'utf8')

  assert.match(
    tokens,
    /--framebase-table-current-row-bg: var\(--framebase-color-primary-light-9\);/
  )
  assert.match(dark, /--framebase-table-current-row-bg: rgba\(77, 124, 254, 0\.15\);/)
  assert.match(table, /\.el-table\.el-table\s*\{/)
  // 表头 EP 变量映射到 framebase token
  assert.match(table, /--el-table-header-bg-color: var\(--framebase-table-header-bg\);/)
  assert.match(table, /--el-table-header-text-color: var\(--framebase-table-header-text\);/)
  assert.doesNotMatch(table, /thead th\.el-table__cell/)
  // padding 由 --el-table-cell-padding 变量驱动（tokens.scss 中定义）
  assert.match(tokens, /--el-table-cell-padding: var\(--framebase-table-cell-padding\);/)
  assert.match(
    tokens,
    /--el-table-cell-padding-small: var\(--framebase-table-cell-padding-small\);/
  )
  assert.match(
    tokens,
    /--el-table-cell-padding-large: var\(--framebase-table-cell-padding-large\);/
  )
})

test('table header and body use the same border color token', async () => {
  const tokens = await readFile(new URL('tokens.scss', sourceRoot), 'utf8')
  const table = await readFile(new URL('components/table.scss', sourceRoot), 'utf8')
  const borderDeclarations = table.match(/border-bottom: 1px solid ([^;]+);/g) ?? []

  assert.match(tokens, /--framebase-table-border-color: var\(--framebase-color-border\);/)
  assert.ok(borderDeclarations.length >= 2)
  assert.ok(
    borderDeclarations.every(declaration =>
      declaration.includes('var(--framebase-table-border-color)')
    )
  )
})
