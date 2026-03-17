<script setup>
/**
 * 中央画布核心引擎 (Center Canvas)
 */
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import FormRenderer from './FormRenderer.vue'
import { useCompiler } from '../hooks/useCompiler' 

const props = defineProps({
  schema: { type: Array, default: () => [] },
  activeId: { type: [String, Number], default: null },
  canUndo: { type: Boolean, default: false },
  canRedo: { type: Boolean, default: false },
  saveStatus: { type: String, default: 'saved' }
})

const emit = defineEmits(['drag-start', 'drop', 'select', 'undo', 'redo', 'clear'])

const isModalOpen = ref(false)
const generatedCode = ref('')

// 🚀 这里的解构依然使用 compile
const { compile } = useCompiler()

const generateVueCode = (currentSchema) => {
  try {
    // 🚀 调用 compile，不改名字
    generatedCode.value = compile(currentSchema)
    isModalOpen.value = true
  } catch (error) {
    console.error('出码失败:', error)
    ElMessage.error('出码失败，请检查控制台')
  }
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    ElMessage.success('🎉 代码已复制')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 预览逻辑
const isPreviewModalOpen = ref(false)
const previewFormData = ref({})

const openPreview = () => {
  if (props.schema.length === 0) return
  const data = {}
  const collect = (list) => {
    list.forEach(item => {
      if (!['text', 'image', 'divider', 'button', 'card'].includes(item.type)) {
        data[`field_${item.id}`] = item.defaultChecked || item.value || ''
      }
      if (item.children) collect(item.children)
      if (item.cols) item.cols.forEach(c => collect(c.children))
      if (item.panes) item.panes.forEach(p => collect(p.children))
    })
  }
  collect(props.schema)
  previewFormData.value = data
  emit('select', null)
  isPreviewModalOpen.value = true
}
</script>

<template>
  <div class="panel canvas">
    <div class="header-bar">
      <h3>效果预览区</h3>
      <div style="display: flex; gap: 5px;">
        <button @click="emit('undo')" :disabled="!canUndo" class="history-btn">撤销</button>
        <button @click="emit('redo')" :disabled="!canRedo" class="history-btn">重做</button>
      </div>
      <div style="flex: 1; text-align: right; display: flex; gap: 10px; align-items: center; justify-content: flex-end;">
        <span v-if="saveStatus === 'saving'" class="status saving">正在保存...</span>
        <button @click="openPreview" class="preview-btn">👁️ 预览效果</button>
        <button @click="generateVueCode(schema)" class="export-btn">导出 Vue 代码</button>
        <button @click="emit('clear')" class="clear-btn">清空</button>
      </div>
    </div>
    
    <div class="canvas-scroll-area">
      <FormRenderer 
        mode="edit" :schema="schema" :activeId="activeId"
        @drag-start="(p) => emit('drag-start', p)"
        @drop="(p) => emit('drop', p)"
        @select="(i) => emit('select', i)"
      />
      <div class="empty-drop-zone" @dragover.prevent @drop.stop="($event) => emit('drop', { event: $event, targetList: schema, index: schema.length })">
        拖拽到此处追加
      </div>
    </div>

    <el-dialog v-model="isPreviewModalOpen" title="📱 效果预览" width="800px" :lock-scroll="false">
      <div class="preview-modal-bg">
        <FormRenderer mode="preview" :schema="schema" :formData="previewFormData" />
      </div>
    </el-dialog>

    <el-dialog v-model="isModalOpen" title="✨ Vue 源码" width="800px" :modal="false" :lock-scroll="false">
      <el-input type="textarea" v-model="generatedCode" :autosize="{ minRows: 15, maxRows: 25 }" readonly />
      <template #footer>
        <el-button @click="isModalOpen = false">关闭</el-button>
        <el-button @click="copyCode" type="primary">复制代码</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.panel { display: flex; flex-direction: column; background: white; margin: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.canvas { flex: 1; min-width: 300px; overflow: hidden; position: relative; }
.header-bar { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-bottom: 1px solid #ebeef5; background-color: #fafafa; height: 32px;}
.header-bar h3 { margin: 0; font-size: 16px; color: #303133; }
.history-btn { padding: 4px 10px; font-size: 12px; background: white; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
.history-btn:hover:not(.disabled) { color: #409EFF; border-color: #c6e2ff; background-color: #ecf5ff; }
.history-btn.disabled { color: #c0c4cc; cursor: not-allowed; background-color: #f5f7fa; }
.status { font-size: 12px; }
.status.saving { color: #E6A23C; }
.status.saved { color: #67C23A; }
.preview-btn { padding: 6px 12px; border: 1px solid #b3e19d; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: bold; background-color: #f0f9eb; color: #67C23A; transition: all 0.2s; }
.preview-btn:hover { background-color: #67C23A; color: white; }
.export-btn, .clear-btn { padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: bold; transition: opacity 0.2s; }
.export-btn { background-color: #409EFF; color: white; }
.export-btn:hover { opacity: 0.8; }
.clear-btn { background-color: #F56C6C; color: white; }
.clear-btn:hover { opacity: 0.8; }
.canvas-scroll-area { flex: 1; overflow-y: auto; padding: 20px; box-sizing: border-box; }
.empty-drop-zone { min-height: 80px; display: flex; align-items: center; justify-content: center; border: 2px dashed #e4e7ed; margin-top: 10px; color: #909399; font-size: 14px; border-radius: 4px; transition: all 0.2s; }
.empty-drop-zone:hover { border-color: #409EFF; color: #409EFF; background: #ecf5ff; }
.preview-modal-bg { background-color: #f0f2f5; padding: 20px; border-radius: 8px; max-height: 60vh; overflow-y: auto; }
.preview-form-container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05); margin-bottom: 20px;}
.preview-data-panel { background: #282c34; color: #abb2bf; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 13px; overflow-x: auto;}
.preview-data-panel pre { margin: 0; }
</style>