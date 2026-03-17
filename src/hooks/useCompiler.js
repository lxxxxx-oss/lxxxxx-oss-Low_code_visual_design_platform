/**
 * 核心出码引擎 (Recursive AST Compiler)
 * 职责：将嵌套的 JSON Schema 转换为标准的 Element Plus Vue 源码
 */
import { ref } from 'vue'

export function useCompiler() {
  
  // 🚀 核心递归函数：解析不同层级的组件数组
  const generateTemplate = (list) => {
    let html = ''
    list.forEach(item => {
      // 1. 处理卡片容器 (Card)
      if (item.type === 'card') {
        html += `
    <el-card shadow="never" style="margin-bottom: 20px;">
      <template #header>
        <span>${item.label || '卡片容器'}</span>
      </template>
      ${generateTemplate(item.children || [])}
    </el-card>`
      } 
      
      // 2. 处理栅格布局 (Grid)
      else if (item.type === 'grid') {
        html += `
    <el-row :gutter="20">
      ${(item.cols || []).map(col => `
      <el-col :span="${col.span}">
        ${generateTemplate(col.children || [])}
      </el-col>`).join('')}
    </el-row>`
      }

      // 3. 处理标签页容器 (Tabs)
      else if (item.type === 'tabs') {
        html += `
    <el-tabs v-model="activeTab_${item.id}">
      ${(item.panes || []).map(pane => `
      <el-tab-pane label="${pane.label}" name="${pane.name}">
        ${generateTemplate(pane.children || [])}
      </el-tab-pane>`).join('')}
    </el-tabs>`
      }

      // 4. 处理基础表单项
      else {
        html += renderBaseComponent(item)
      }
    })
    return html
  }

  // 基础组件渲染逻辑
  const renderBaseComponent = (item) => {
    const vModel = `v-model="formData.field_${item.id}"`
    const commonProps = `:disabled="${item.disabled || false}"`
    
    switch (item.type) {
      case 'input':
        return `
    <el-form-item label="${item.label}">
      <el-input ${vModel} placeholder="${item.placeholder || ''}" ${commonProps} />
    </el-form-item>`
      case 'textarea':
        return `
    <el-form-item label="${item.label}">
      <el-input type="textarea" ${vModel} :rows="2" ${commonProps} />
    </el-form-item>`
      case 'select':
        return `
    <el-form-item label="${item.label}">
      <el-select ${vModel} style="width: 100%" ${commonProps}>
        ${(item.options || []).map(opt => `<el-option label="${opt.label}" value="${opt.value}" />`).join('')}
      </el-select>
    </el-form-item>`
      case 'date':
        return `
    <el-form-item label="${item.label}">
      <el-date-picker ${vModel} type="date" style="width: 100%" ${commonProps} />
    </el-form-item>`
      case 'switch':
        return `
    <el-form-item label="${item.label}">
      <el-switch ${vModel} ${commonProps} />
    </el-form-item>`
      case 'button':
        return `
    <el-button type="primary" style="width: 100%; margin-bottom: 15px;">${item.text || '按钮'}</el-button>`
      case 'divider':
        return `
    <el-divider content-position="left">${item.label || ''}</el-divider>`
      default:
        return ''
    }
  }

  /**
   * 🚀 保持原名：compile
   * 生成完整的 .vue 单文件组件代码
   */
  const compile = (schema) => {
    // 递归查找 Tabs 变量
    const tabVars = []
    const findTabNodes = (list) => {
      list.forEach(node => {
        if (node.type === 'tabs') {
          tabVars.push(`const activeTab_${node.id} = ref('${node.activeTab || ''}')`)
        }
        if (node.children) findTabNodes(node.children)
        if (node.cols) node.cols.forEach(c => findTabNodes(c.children))
        if (node.panes) node.panes.forEach(p => findTabNodes(p.children))
      })
    }
    findTabNodes(schema)

    return `<template>
  <div class="generated-container">
    <el-form label-position="top">
      ${generateTemplate(schema)}
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 响应式表单底座
const formData = reactive({})

// 容器状态变量
${tabVars.join('\n')}

const onSubmit = () => {
  console.log('提交数据:', formData)
}
<\/script>

<style scoped>
.generated-container { padding: 20px; background: #fff; }
</style>`
  }

  return { compile } // 👈 名字没变，还是 compile
}