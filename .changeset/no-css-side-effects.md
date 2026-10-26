---
'@framebase/element-plus-pro-components': patch
---

构建产物不再注入 Element Plus 的按需样式（`import 'element-plus/es/components/<name>/style/css'`）。此前 47 个产物文件带这类 CSS 副作用导入，会让 SSR 环境（Node 直接加载 ESM）抛 `ERR_UNKNOWN_FILE_EXTENSION: .css`，同时强制使用方接受 Element Plus 的组件样式、破坏自定义主题。升级后请自行引入 `element-plus/theme-chalk/index.css` 或按需样式。
