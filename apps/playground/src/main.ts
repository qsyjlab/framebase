import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/es/components/message/style/css'
import '@framebase/element-plus-pro-components/style.css'
import '@framebase/element-plus-theme/style.css'
import './styles.css'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

createApp(App).use(router).mount('#app')
