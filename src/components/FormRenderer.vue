<script setup lang="ts">
/**
 * 核心渲染器 (Recursive Engine + TypeScript)
 */
import { Plus } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import draggable from 'vuedraggable'
// 🚀 引入强类型接口
import type { ComponentSchema } from '../types/schema'

use([
  CanvasRenderer,
  BarChart, LineChart, PieChart,
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
])

defineOptions({ name: 'FormRenderer' })

// 🚀 使用 TS 泛型极其严谨地定义 Props
const props = withDefaults(defineProps<{
  schema: ComponentSchema[];
  mode?: 'edit' | 'preview';
  activeId?: string | number | null;
  formData?: Record<string, any>;
}>(), {
  schema: () => [],
  mode: 'edit',
  activeId: null,
  formData: () => ({})
})

// 🚀 使用 TS 泛型约束向上抛出的事件
const emit = defineEmits<{
  (e: 'select', item: ComponentSchema): void
}>()

const handleSelect = (item: ComponentSchema) => {
  if (props.mode === 'edit') emit('select', item)
}
</script>

<template>
  <el-form label-position="top" style="width: 100%; height: 100%;" @submit.prevent>
    <draggable
      :list="schema"
      group="components"
      item-key="id"
      :animation="250"
      ghost-class="ghost-item"
      class="drag-area"
      :disabled="mode !== 'edit'"
    >
      <template #item="{ element }">
        <div 
          class="render-item"
          :class="{ 
            'is-edit': mode === 'edit',
            'active': mode === 'edit' && activeId === element.id,
            'is-hidden-mock': mode === 'edit' && element.hidden
          }"
          :style="{ width: element.width ? element.width + '%' : '100%', boxSizing: 'border-box' }"
          @click.stop="handleSelect(element)"
        >
          <template v-if="element.type === 'card'">
            <el-card shadow="never" class="nested-container" :class="{'mock-no-events': mode === 'edit'}">
              <template #header>
                <div style="font-weight: bold; font-size: 14px; pointer-events: auto;">
                  {{ element.label || '卡片容器' }}
                </div>
              </template>
              <FormRenderer 
                :schema="element.children || []" 
                :mode="mode" :activeId="activeId" :formData="formData" 
                style="pointer-events: auto;" 
                @select="(subItem) => emit('select', subItem)" 
              />
            </el-card>
          </template>

          <template v-else-if="element.type === 'grid'">
            <div class="nested-container grid-container" :class="{'mock-no-events': mode === 'edit'}">
              <el-row :gutter="element.gutter || 20" style="pointer-events: auto;">
                <el-col :span="col.span" v-for="(col, colIndex) in element.cols" :key="colIndex" class="grid-col">
                  <FormRenderer 
                    :schema="col.children || []" 
                    :mode="mode" :activeId="activeId" :formData="formData" 
                    @select="(subItem) => emit('select', subItem)" 
                  />
                </el-col>
              </el-row>
            </div>
          </template>

          <template v-else-if="element.type === 'tabs'">
            <div class="nested-container tabs-container" :class="{'mock-no-events': mode === 'edit'}">
              <el-tabs v-model="element.activeTab" style="pointer-events: auto;">
                <el-tab-pane v-for="(pane, paneIndex) in element.panes" :key="paneIndex" :label="pane.label" :name="pane.name">
                  <FormRenderer 
                    :schema="pane.children || []" 
                    :mode="mode" :activeId="activeId" :formData="formData" 
                    @select="(subItem) => emit('select', subItem)" 
                  />
                </el-tab-pane>
              </el-tabs>
            </div>
          </template>

          <template v-else-if="element.type === 'echarts'">
            <div class="nested-container" :class="{'mock-no-events': mode === 'edit'}" style="background: #fff;">
              <v-chart :option="element.options" :style="{ height: (element.height || 300) + 'px', width: '100%' }" autoresize />
            </div>
          </template>

          <el-form-item v-else-if="!['text', 'image', 'divider', 'button'].includes(element.type)" :label="element.label || '未命名字段'" :required="element.required" style="margin-bottom: 0;">
            <el-input v-if="element.type === 'input'" v-model="formData['field_'+element.id]" :placeholder="element.placeholder" disabled :class="{ 'mock-no-events': mode === 'edit' }" style="width: 100%;" />
            <el-input v-else-if="element.type === 'textarea'" type="textarea" v-model="formData['field_'+element.id]" :rows="element.rows || 2" :placeholder="element.placeholder" disabled :class="{ 'mock-no-events': mode === 'edit' }" style="width: 100%;" />
            <el-date-picker v-else-if="element.type === 'date'" type="date" v-model="formData['field_'+element.id]" :placeholder="element.placeholder || '选择日期'" disabled :class="{ 'mock-no-events': mode === 'edit' }" style="width: 100%;" />
            <div v-else-if="element.type === 'switch'" :class="{ 'mock-no-events': mode === 'edit' }">
              <el-switch v-model="formData['field_'+element.id]" disabled />
            </div>
            <el-select v-else-if="element.type === 'select'" v-model="formData['field_'+element.id]" :placeholder="element.placeholder || '请选择'" disabled :class="{ 'mock-no-events': mode === 'edit' }" style="width: 100%;">
              <el-option v-for="(opt, i) in element.options" :key="i" :label="opt.label" :value="opt.value" />
            </el-select>
            <el-radio-group v-else-if="element.type === 'radio'" v-model="formData['field_'+element.id]" disabled :class="{ 'mock-no-events': mode === 'edit' }">
              <el-radio v-for="(opt, i) in element.options" :key="i" :value="opt.value">{{ opt.label }}</el-radio>
            </el-radio-group>
            <el-checkbox-group v-else-if="element.type === 'checkbox'" v-model="formData['field_'+element.id]" disabled :class="{ 'mock-no-events': mode === 'edit' }">
              <el-checkbox v-for="(opt, i) in element.options" :key="i" :value="opt.value">{{ opt.label }}</el-checkbox>
            </el-checkbox-group>
            <el-slider v-else-if="element.type === 'slider'" v-model="formData['field_'+element.id]" :max="Number(element.max || 100)" disabled :class="{ 'mock-no-events': mode === 'edit' }" style="margin: 0 10px; width: 100%;" />
            <el-rate v-else-if="element.type === 'rate'" v-model="formData['field_'+element.id]" :max="Number(element.max || 5)" disabled :class="{ 'mock-no-events': mode === 'edit' }" />
            <el-upload v-else-if="element.type === 'upload-file'" action="#" disabled :class="{ 'mock-no-events': mode === 'edit' }" style="width: 100%;">
              <el-button type="primary" disabled>📁 {{ element.buttonText || '上传文件' }}</el-button>
            </el-upload>
            <el-upload v-else-if="element.type === 'upload-img'" action="#" list-type="picture-card" disabled :class="{ 'mock-no-events': mode === 'edit' }">
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <template v-else>
            <el-button v-if="element.type === 'button'" :color="element.color" :class="{ 'mock-no-events': mode === 'edit' }" style="width: 100%;">{{ element.text || '按钮' }}</el-button>
            <div v-else-if="element.type === 'text'" :class="{ 'mock-no-events': mode === 'edit' }" :style="{ fontSize: (element.fontSize || 14) + 'px', color: element.color || '#333', textAlign: element.textAlign || 'left' }">{{ element.content || '请输入文本内容' }}</div>
            <div v-else-if="element.type === 'image'" :class="{ 'mock-no-events': mode === 'edit' }" style="text-align: center;">
              <img :src="element.url || 'https://via.placeholder.com/300x150?text=Image+Placeholder'" style="width: 100%; max-width: 100%; border-radius: 4px;" alt="图片" />
            </div>
            <el-divider v-else-if="element.type === 'divider'" :class="{ 'mock-no-events': mode === 'edit' }" :border-style="element.borderStyle || 'solid'" />
          </template>
        </div>
      </template>
    </draggable>
  </el-form>
</template>

<style scoped>
.drag-area { min-height: 80px; height: 100%; width: 100%; display: flex; flex-direction: column; gap: 5px; }
.ghost-item { opacity: 0.4; background: #ecf5ff; border: 2px dashed #409EFF !important; border-radius: 4px; }
.render-item { position: relative; padding: 10px; border: 1px dashed transparent; transition: all 0.2s; }
.render-item.is-edit { cursor: grab; }
.render-item.is-edit:hover { border-color: #a0cfff; background: #ecf5ff; }
.render-item.active { border-color: #409EFF; background: #ecf5ff; box-shadow: 0 0 5px rgba(64,158,255,0.3); z-index: 10; }
.nested-container { border: 1px dashed #d9ecff; background: #fcfcfc; padding: 10px; border-radius: 4px; }
.nested-container:hover { border-color: #409EFF; }
.grid-container { border-color: #e6a23c; background: #fdf6ec; }
.tabs-container { border-color: #67c23a; background: #f0f9eb; }
.grid-col { border: 1px dashed #ebeef5; padding: 5px; transition: all 0.2s; }
.grid-col:hover { background-color: #ffffff; border-color: #c6e2ff; }
.mock-no-events { pointer-events: none; }
</style>