# @framebase/core

Framework-agnostic pure utilities for path access and paginated data sources.

`@framebase/core` holds the framework-agnostic foundation of Framebase — pure TypeScript helpers and types with **no framework runtime dependency** (Vue, React, etc.). Path runtime helpers delegate to [`lodash-es`](https://lodash.com/) for battle-tested bracket-notation support; the path type inference (`DataPath` / `DataIndex`) is hand-rolled on top to provide editor autocomplete. Vue 3 composables that previously lived here have moved to [`@framebase/vue`](../vue), which provides the reactive layer on top of these utilities.

## Installation

```bash
pnpm add @framebase/core
```

## Features

- **Path utilities** — `getPathValue` / `setPathValue` / `unsetPathValue` for dot-notation **and bracket-notation** access to nested values (`a[0].b`, `a['name']`), powered by lodash `toPath` / `get` / `set` / `unset`; plus hand-rolled `DataPath` / `DataIndex` / `LiteralUnion` type helpers for editor autocomplete
- **Data helpers** — `normalizePagedResponse` / `paginateData` / `getRowKey` / `moveItem` for paginated data sources, plus the shared `PageInfo` / `PagedResponse` types

## Related packages

- `@framebase/vue` — Vue 3 composables (`useRequest`, `usePagination`, `useSelection`, `useUrlState`) built on this package
- `@framebase/element-plus-pro-components` — Pro components consuming both `@framebase/core` and `@framebase/vue`

## License

MIT
