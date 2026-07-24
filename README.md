# Framebase

Framebase is a monorepo for reusable frontend foundations, including UI components, themes and developer tooling.

## Packages

- `@framebase/element-plus-pro-components`: Vue 3 and Element Plus business-level components.
- `@framebase/element-plus-theme`: Optional Element Plus visual theme for light and dark mode.

## Development

```bash
pnpm install
pnpm verify
```

Run the interactive component examples:

```bash
pnpm dev
```

## Releases

This repository uses Changesets for independent package versioning.

```bash
pnpm changeset
pnpm release:version
pnpm release:publish
```

## Automation

GitHub Actions verifies pull requests and pushes to `main`. The release workflow uses Changesets to create a version PR, then publishes versioned packages after that PR is merged. Configure the repository `NPM_TOKEN` secret before enabling npm publishing.
