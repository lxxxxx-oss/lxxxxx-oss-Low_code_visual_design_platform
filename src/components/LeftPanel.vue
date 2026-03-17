<script setup>
/**
 * 左侧物料面板
 * 架构更新：接入 vuedraggable，配置为 Clone 引擎输出源。
 */
import { ref } from 'vue'
import draggable from 'vuedraggable'
import { cloneDeep } from 'lodash-es'
import { nanoid } from 'nanoid'
import {
  Document, Edit, EditPen, Operation, Select, Check,
  Calendar, Upload, Picture, Setting, Menu, Mouse,
  Postcard, Grid, CollectionTag, Star,
  DataAnalysis, DataLine, PieChart
} from '@element-plus/icons-vue'

const emit = defineEmits(['add'])

const activeNames = ref(['form', 'layout', 'charts'])

const componentCategories = [
  {
    name: 'form',
    title: '表单组件',
    list: [
      { type: 'input', label: '输入框', icon: Edit },
      { type: 'textarea', label: '文本域', icon: EditPen },
      { type: 'radio', label: '单选框', icon: Select },
      { type: 'checkbox', label: '复选框', icon: Check },
      { type: 'select', label: '选择框', icon: Menu },
      { type: 'date', label: '日期选择器', icon: Calendar },
      { type: 'upload-file', label: '上传文件', icon: Upload },
      { type: 'upload-img', label: '上传图片', icon: Picture },
      { type: 'switch', label: '开关', icon: Setting },
      { type: 'slider', label: '滑块', icon: Operation },
      { type: 'rate', label: '评分', icon: Star },
      { type: 'button', label: '按钮', icon: Mouse }
    ]
  },
  {
    name: 'layout',
    title: '布局组件',
    list: [
      { type: 'card', label: '卡片布局', icon: Postcard, children: [] },
      { 
        type: 'grid', label: '栅格布局', icon: Grid, 
        cols: [{ span: 12, children: [] }, { span: 12, children: [] }] 
      },
      { 
        type: 'tabs', label: '标签页', icon: CollectionTag, activeTab: 'tab-1',
        panes: [{ label: '标签一', name: 'tab-1', children: [] }, { label: '标签二', name: 'tab-2', children: [] }] 
      },
      { type: 'divider', label: '分割线', icon: Document }
    ]
  },
  {
    name: 'charts',
    title: '图表组件',
    list: [
      {
        type: 'echarts', label: '柱状图', icon: DataAnalysis, height: 300,
        options: { title: { text: '业务销量统计', left: 'center' }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: ['一月', '二月', '三月', '四月', '五月', '六月'] }, yAxis: { type: 'value' }, series: [{ type: 'bar', data: [120, 200, 150, 80, 70, 110], itemStyle: { color: '#409EFF' } }] }
      },
      {
        type: 'echarts', label: '折线图', icon: DataLine, height: 300,
        options: { title: { text: '用户增长趋势', left: 'center' }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] }, yAxis: { type: 'value' }, series: [{ type: 'line', data: [820, 932, 901, 934, 1290, 1330, 1320], smooth: true, areaStyle: { opacity: 0.1 } }] }
      },
      {
        type: 'echarts', label: '饼图', icon: PieChart, height: 300,
        options: { title: { text: '访问来源分布', left: 'center' }, tooltip: { trigger: 'item' }, legend: { orient: 'vertical', left: 'left' }, series: [{ type: 'pie', radius: '50%', data: [{ value: 1048, name: '搜索引擎' }, { value: 735, name: '直接访问' }, { value: 580, name: '邮件营销' }, { value: 484, name: '视频广告' }], emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } } }] }
      }
    ]
  }
]

// 🚀 核心克隆引擎：彻底脱离原生拖拽，由 vuedraggable 自动调用
const cloneComponent = (origin) => {
  const clone = cloneDeep(origin)
  clone.id = nanoid(10)
  delete clone.icon
  if (clone.type === 'card' && !clone.children) clone.children = []
  return clone
}

const handleClick = (item) => {
  emit('add', item)
}
</script>

<template>
  <div class="panel left-panel">
    <div class="panel-header">
      <span class="header-title">组件物料库</span>
    </div>
    <div class="components-scroll-area">
      <el-collapse v-model="activeNames" class="custom-collapse">
        <el-collapse-item v-for="category in componentCategories" :key="category.name" :name="category.name">
          <template #title>
            <span class="category-title">{{ category.title }}</span>
          </template>
          <draggable
            class="component-grid"
            :list="category.list"
            :group="{ name: 'components', pull: 'clone', put: false }"
            :clone="cloneComponent"
            item-key="label"
            :sort="false"
          >
            <template #item="{ element }">
              <div class="component-item" @click="handleClick(element)">
                <el-icon class="item-icon"><component :is="element.icon" /></el-icon>
                <span class="item-label">{{ element.label }}</span>
              </div>
            </template>
          </draggable>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<style scoped>
.panel { background: white; margin: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
.left-panel { width: 280px; box-sizing: border-box; overflow: hidden; }
.panel-header { padding: 15px 20px; border-bottom: 1px solid #ebeef5; background-color: #fafafa; }
.header-title { font-size: 15px; font-weight: bold; color: #303133; }
.components-scroll-area { flex: 1; overflow-y: auto; padding: 10px 15px; }
:deep(.el-collapse) { border-top: none; border-bottom: none; }
:deep(.el-collapse-item__header) { border-bottom: none; background-color: transparent; height: 40px; line-height: 40px; }
:deep(.el-collapse-item__wrap) { border-bottom: none; background-color: transparent; }
.category-title { font-weight: bold; font-size: 14px; color: #303133; }
.component-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding-bottom: 10px; min-height: 50px; }
.component-item { display: flex; align-items: center; background: #f6f7f9; padding: 8px 12px; border-radius: 4px; cursor: grab; border: 1px solid transparent; transition: all 0.2s ease; }
.component-item:hover { color: #409EFF; border-color: #409EFF; background: #ecf5ff; }
.component-item:active { cursor: grabbing; }
.item-icon { font-size: 16px; margin-right: 8px; color: inherit; }
.item-label { font-size: 13px; white-space: nowrap; color: inherit; }
</style>