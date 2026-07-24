import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@framebase/element-plus-theme/style.css'
import './styles.css'
import ElementPlus from 'element-plus'
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).use(ElementPlus).mount('#app')
