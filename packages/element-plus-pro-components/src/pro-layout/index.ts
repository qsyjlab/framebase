import { withInstall } from '../shared/with-install'
import ProLayoutComponent from './pro-layout.vue'
import ProLayoutAsideComponent from './pro-layout-aside.vue'
import ProLayoutHeaderComponent from './pro-layout-header.vue'
import ProLayoutLogoComponent from './pro-layout-logo.vue'
import ProLayoutMenuItemComponent from './pro-layout-menu-item.vue'
import ProLayoutMixSidebarComponent from './pro-layout-mix-sidebar.vue'
import ProLayoutMixMenuComponent from './pro-layout-mix-menu.vue'
import ProLayoutSettingsComponent from './pro-layout-settings.vue'
import ProLayoutCheckButtonGroupComponent from './pro-layout-check-button-group.vue'
import ProLayoutTabsComponent from './pro-layout-tabs.vue'
import ProLayoutBreadcrumbComponent from './pro-layout-breadcrumb.vue'
import ProLayoutFooterComponent from './pro-layout-footer.vue'

import {
  CheckIcon,
  LayoutIconSide,
  LayoutIconSideMix,
  LayoutIconTop,
  LayoutIconTopMix,
  PushpinIcon
} from './icons/mode-icons'

export * from './types'
export * from './utils'
export * from './use-pro-layout'
export { resolveProLayoutThemeVars, useProLayoutTheme, bindProLayoutTheme } from './theme'
export type { ProLayoutThemeVars, ProLayoutThemeTarget } from './theme'

export const ProLayout = withInstall(ProLayoutComponent, {
  ProLayoutAside: ProLayoutAsideComponent,
  ProLayoutHeader: ProLayoutHeaderComponent,
  ProLayoutLogo: ProLayoutLogoComponent,
  ProLayoutMenuItem: ProLayoutMenuItemComponent,
  ProLayoutMixSidebar: ProLayoutMixSidebarComponent,
  ProLayoutMixMenu: ProLayoutMixMenuComponent,
  ProLayoutSettings: ProLayoutSettingsComponent,
  ProLayoutCheckButtonGroup: ProLayoutCheckButtonGroupComponent,
  ProLayoutTabs: ProLayoutTabsComponent,
  ProLayoutBreadcrumb: ProLayoutBreadcrumbComponent,
  ProLayoutFooter: ProLayoutFooterComponent,
  ProLayoutIconSide: LayoutIconSide,
  ProLayoutIconTop: LayoutIconTop,
  ProLayoutIconTopMix: LayoutIconTopMix,
  ProLayoutIconSideMix: LayoutIconSideMix,
  ProLayoutIconCheck: CheckIcon,
  ProLayoutIconPushpin: PushpinIcon
})

export {
  ProLayoutAsideComponent as ProLayoutAside,
  ProLayoutHeaderComponent as ProLayoutHeader,
  ProLayoutLogoComponent as ProLayoutLogo,
  ProLayoutMenuItemComponent as ProLayoutMenuItem,
  ProLayoutMixSidebarComponent as ProLayoutMixSidebar,
  ProLayoutMixMenuComponent as ProLayoutMixMenu,
  ProLayoutSettingsComponent as ProLayoutSettings,
  ProLayoutCheckButtonGroupComponent as ProLayoutCheckButtonGroup,
  ProLayoutTabsComponent as ProLayoutTabs,
  ProLayoutBreadcrumbComponent as ProLayoutBreadcrumb,
  ProLayoutFooterComponent as ProLayoutFooter,
  LayoutIconSide as ProLayoutIconSide,
  LayoutIconTop as ProLayoutIconTop,
  LayoutIconTopMix as ProLayoutIconTopMix,
  LayoutIconSideMix as ProLayoutIconSideMix,
  CheckIcon as ProLayoutIconCheck,
  PushpinIcon as ProLayoutIconPushpin
}

export default ProLayout
