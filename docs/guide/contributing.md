# 贡献与发版

本文档说明如何在 Framebase 仓库本地开发、提交代码、以及发版流程。

## 本地开发

### 环境准备

- Node.js 20.19+
- pnpm 10+

### 克隆并安装

```bash
git clone https://github.com/qsyjlab/framebase.git
cd framebase
pnpm install
```

### 常用脚本

在仓库根目录执行：

| 命令                  | 说明                             |
| --------------------- | -------------------------------- |
| `pnpm dev`            | 构建包并启动 playground 示例     |
| `pnpm docs:dev`       | 启动文档站点（VitePress）        |
| `pnpm build:packages` | 构建组件库与主题包               |
| `pnpm build`          | 构建包 + playground              |
| `pnpm typecheck`      | 类型检查                         |
| `pnpm lint`           | ESLint 检查                      |
| `pnpm test`           | 单元测试（Vitest）               |
| `pnpm verify`         | typecheck + lint + test 全量校验 |

### 开发建议

- 修改组件库源码后，需执行 `pnpm build:packages` 让 playground / docs 拿到最新产物
- 文档站点支持热更新，修改 `docs/` 下 `.md` 或 `examples/*.vue` 会自动刷新
- playground 用于完整场景验证，docs 用于组件示例与 API 文档

## 代码规范

- 使用 ESLint + Prettier 统一风格，提交前会通过 husky + lint-staged 自动修复
- 组件库源码位于 `packages/element-plus-pro-components/src/`，按组件分目录组织
- 每个组件目录包含：`index.ts`（导出）、`*.vue`（实现）、`*-utils.ts`（工具）、`use-*.ts`（Hook）、`__tests__/`（测试）

## 提交规范

- 建议使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：`feat:`、`fix:`、`docs:`、`refactor:`、`test:`、`chore:`
- 提交前确保 `pnpm verify` 通过

## 发版流程（Changesets）

Framebase 使用 [Changesets](https://github.com/changesets/changesets) 管理版本与 CHANGELOG。

### 1. 添加 changeset

当你提交了一个需要发版的改动（新功能、Bug 修复等），在本地执行：

```bash
pnpm changeset
```

按提示选择影响的包、版本类型（major / minor / patch）、填写变更说明。这会在 `.changeset/` 下生成一个临时文件，需一并提交。

### 2. 消费 changeset

合并到主分支后，维护者执行：

```bash
pnpm release:version
```

这会消费所有未处理的 changeset，更新对应包的 `package.json` 版本号与 `CHANGELOG.md`，并更新 lockfile。

### 3. 发布

```bash
pnpm release:publish
```

该命令会先执行 `pnpm verify` 全量校验，通过后调用 `changeset publish` 发布到 npm。

### 配置说明

- `baseBranch`: `main`
- `access`: `public`（公开包）
- `updateInternalDependencies`: `patch`（内部包互相依赖时，跟随 patch 升级）
- `privatePackages.version`: `false`（私有包如 playground、docs 不参与发版）

## 文档贡献

- 文档源码位于 `docs/`，VitePress 驱动
- 组件示例放在 `docs/examples/`，通过 `:::demo` 语法嵌入文档
- 新增组件文档后，需在 `docs/.vitepress/config.mts` 的 `sidebar` 中注册

## 文档部署

文档站点通过 GitHub Actions 自动部署到 GitHub Pages。

### 触发条件

- push 到 `main` 分支，且 `docs/` 或 `packages/` 有变更
- 手动触发（workflow_dispatch）

### 部署流程

`.github/workflows/docs.yml` 定义了部署流程：

1. 安装依赖
2. `pnpm build:packages` 构建组件库与主题包（文档示例依赖产物）
3. `pnpm docs:build` 构建文档站点
4. 上传 `docs/.vitepress/dist` 为 Pages artifact
5. 部署到 GitHub Pages

### 访问地址

部署成功后访问：`https://<org>.github.io/framebase/`

> `base` 配置在 `docs/.vitepress/config.mts` 中，当前为 `/framebase/`，对应仓库名。如果仓库名变化，需同步修改 `base`。

### 一次性配置

首次使用前需在 GitHub 仓库设置：

1. 进入 **Settings → Pages**
2. **Source** 选择 **GitHub Actions**
3. 确保仓库已开启 Actions 权限
