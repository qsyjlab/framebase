import type { ProPageBreadcrumbItem, ProPageBreadcrumbs } from './pro-page-container'

export function normalizeProPageBreadcrumbs(
  breadcrumb: ProPageBreadcrumbs | undefined
): ProPageBreadcrumbItem[] {
  if (!breadcrumb?.length) return []

  const items: ProPageBreadcrumbItem[] = []
  for (const item of breadcrumb) {
    const normalized: ProPageBreadcrumbItem = typeof item === 'string' ? { text: item } : item
    if (normalized?.text?.trim()) items.push(normalized)
  }
  return items
}

export function resolveProPageBackVisible(back: boolean | undefined, hasBackHandler: boolean) {
  return back ?? hasBackHandler
}
