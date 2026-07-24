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
  assert.match(controls, /var\(--framebase-border-radius-base\)/)
  assert.match(select, /\.el-select-dropdown\s*\{[\s\S]*\.el-select-dropdown__item/)
  assert.match(select, /height: var\(--framebase-control-height\);/)
  assert.match(select, /padding: 0 12px;/)
})

test('theme exposes stable customization tokens', async () => {
  const tokens = await readFile(new URL('tokens.scss', sourceRoot), 'utf8')
  const dark = await readFile(new URL('dark.scss', sourceRoot), 'utf8')
  assert.match(tokens, /^html:root\s*\{/)
  assert.match(tokens, /--framebase-color-bg:/)
  assert.match(tokens, /--framebase-color-text-primary:/)
  assert.match(tokens, /--framebase-color-primary: #1677ff;/)
  assert.match(tokens, /--framebase-color-primary-light-1: #2d85ff;/)
  assert.match(tokens, /--framebase-color-primary-light-9: #e8f1ff;/)
  assert.match(tokens, /--el-color-primary: var\(--framebase-color-primary\);/)
  assert.match(tokens, /--el-color-primary-light-1: var\(--framebase-color-primary-light-1\);/)
  assert.match(tokens, /--el-color-primary-light-9: var\(--framebase-color-primary-light-9\);/)
  assert.match(dark, /--el-color-primary: var\(--framebase-color-primary\);/)
  assert.match(tokens, /--framebase-border-radius-base:/)
  assert.match(tokens, /--framebase-shadow-light:/)
})

test('table theme exposes Ant Design inspired semantic styling', async () => {
  const tokens = await readFile(new URL('tokens.scss', sourceRoot), 'utf8')
  const dark = await readFile(new URL('dark.scss', sourceRoot), 'utf8')
  const table = await readFile(new URL('components/table.scss', sourceRoot), 'utf8')

  assert.match(tokens, /--framebase-table-current-row-bg: #e6f4ff;/)
  assert.match(dark, /--framebase-table-current-row-bg: rgba\(22, 119, 255, 0\.18\);/)
  assert.match(table, /\.el-table\.el-table\s*\{/)
  assert.doesNotMatch(table, /--el-table-header-(?:bg|text)-color:/)
  assert.doesNotMatch(table, /thead th\.el-table__cell/)
  assert.match(table, /\.el-table\.el-table\s*\{[\s\S]*\.el-table__cell\s*\{\s*padding: 12px 0;/)
  assert.match(table, /\.el-table\.el-table--large \.el-table__cell\s*\{\s*padding: 16px 0;/)
  assert.match(table, /\.el-table\.el-table--small \.el-table__cell\s*\{\s*padding: 8px 0;/)
})
