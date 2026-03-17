import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

// 第一步：极其严谨地创建 Vue 根实例，创造出 app 容器
const app = createApp(App)

// 第二步：实例化 Pinia 状态大脑
const pinia = createPinia()

// 第三步：将所有插件挂载到已经明确创建好的 app 容器上
app.use(pinia)
app.use(ElementPlus)

// 第四步：完成所有的武装后，最后执行 DOM 挂载
app.mount('#app')