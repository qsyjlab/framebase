# @framebase/vue

Vue 3 composables built on `@framebase/core`. Provides reactive primitives for request lifecycle, pagination, selection and URL state synchronization.

## Installation

```bash
pnpm add @framebase/vue @framebase/core
```

## Exports

- `useRequest` / `useProRequest` — abortable async state with debounce, retry and latest-request-wins semantics
- `usePagination` / `useProPagination` — reactive pagination state container
- `useSelection` / `useProSelection` — row selection state with optional cross-page retention
- `useUrlState` / `useProUrlState` — bidirectional URL query ↔ reactive state sync

## Design

`@framebase/core` holds framework-agnostic pure utilities (path access, data helpers, shared types). This package provides the Vue 3 reactive layer on top, implemented with `ref` / `computed` / `watch`. A future `@framebase/react` package would provide equivalent hooks for React without wrapping this package.
