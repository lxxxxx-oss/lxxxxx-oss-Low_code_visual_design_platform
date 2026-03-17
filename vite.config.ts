// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 引入两个自动导入魔法插件
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// 引入 Element Plus 官方提供的解析器 (Resolver)
// 职责：告诉那两个插件，当遇到 "el-" 开头的标签时，去 Element Plus 的库里找源码
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    
    // 配置自动导入 API 函数 (如 ref, reactive, ElMessage 等)
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    
    // 配置自动导入 Vue 组件 (如 el-button, el-input, el-icon 等)
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],

  // 强制 Vite 启动时就预构建 Element Plus
  optimizeDeps: {
    include: ['element-plus']
  }
})