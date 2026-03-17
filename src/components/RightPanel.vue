<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Delete, Plus, Minus } from '@element-plus/icons-vue'
  import * as XLSX from 'xlsx'

  const props = defineProps({
    activeItem: Object
  })

  const emit = defineEmits(['remove'])

  const activeTab = ref('properties')
  const activeCollapse = ref([]) 

  const formComponentTypes = [
    'input', 'textarea', 'radio', 'checkbox', 'select', 
    'date', 'switch', 'slider', 'rate', 'upload-file', 'upload-img'
  ]

  const isFormComponent = computed(() => {
    if (!props.activeItem) return false
    return formComponentTypes.includes(props.activeItem.type)
  })

  watch(() => props.activeItem, (newItem) => {
    if (newItem) {
      if (newItem.width === undefined) newItem.width = 100
      if (newItem.marginTop === undefined) newItem.marginTop = 0
      if (newItem.marginBottom === undefined) newItem.marginBottom = 0
    }
  }, { immediate: true })

  const chartOptionsStr = ref('')
  const isJsonError = ref(false)

  const syncJsonToStr = () => {
    if (props.activeItem && props.activeItem.type === 'echarts') {
      chartOptionsStr.value = JSON.stringify(props.activeItem.options, null, 2)
    }
  }

  watch(() => props.activeItem, (newVal) => {
    if (newVal && newVal.type === 'echarts') {
      syncJsonToStr()
      isJsonError.value = false
    }
  }, { immediate: true })

  const updateChartOptions = () => {
    try {
      const parsed = JSON.parse(chartOptionsStr.value)
      props.activeItem.options = parsed
      isJsonError.value = false
      ElMessage.success('高级配置已覆盖生效')
    } catch (e) {
      isJsonError.value = true
      ElMessage.error('JSON格式不合法，请检查标点符号')
    }
  }

  const chartTitle = computed({
    get: () => props.activeItem?.options?.title?.text || '',
    set: (val) => {
      if (!props.activeItem.options.title) props.activeItem.options.title = {}
      props.activeItem.options.title.text = val
      syncJsonToStr()
    }
  })

  const chartLegendShow = computed({
    get: () => props.activeItem?.options?.legend?.show !== false, 
    set: (val) => {
      if (!props.activeItem.options.legend) props.activeItem.options.legend = {}
      props.activeItem.options.legend.show = val
      syncJsonToStr()
    }
  })

  const isAxisChart = computed(() => {
    return props.activeItem?.options?.xAxis !== undefined
  })

  // ==========================================
  // 🚀 核心修复：分离手动输入状态与图表底层数据
  // ==========================================
  const xAxisInput = ref('')
  const seriesInput = ref('')

  // 当点击不同的图表组件时，将图表底层数据提取到临时输入框变量中
  watch(() => props.activeItem, (newVal) => {
    if (newVal && newVal.type === 'echarts') {
      const xData = newVal.options?.xAxis?.data
      const sData = newVal.options?.series?.[0]?.data
      xAxisInput.value = xData ? xData.join(',') : ''
      seriesInput.value = sData ? sData.join(',') : ''
    }
  }, { immediate: true })

  // 只有当用户输入完毕且输入框失去焦点时，才将临时变量中的数据洗刷并注入图表底层
  const updateManualData = () => {
    if (props.activeItem && props.activeItem.options) {
      if (!props.activeItem.options.xAxis) props.activeItem.options.xAxis = {}
      if (!props.activeItem.options.series) props.activeItem.options.series = [{ type: 'bar' }]
      
      props.activeItem.options.xAxis.data = xAxisInput.value.split(',').map(item => item.trim())
      props.activeItem.options.series[0].data = seriesInput.value.split(',').map(item => Number(item.trim()) || 0)
      
      syncJsonToStr()
    }
  }

  const handleExcelUpload = (uploadFile) => {
    const file = uploadFile.raw
    if (!file) return

    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (json.length < 2) {
          ElMessage.error('表格数据为空或格式不正确')
          return
        }

        if (props.activeItem && props.activeItem.options && props.activeItem.options.series) {
          const chartType = props.activeItem.options.series[0]?.type || 'bar'

          if (chartType === 'pie') {
            const pieData = []
            for (let i = 1; i < json.length; i++) {
              const row = json[i]
              if (row && row.length >= 2) {
                pieData.push({ name: String(row[0]), value: Number(row[1]) || 0 })
              }
            }
            props.activeItem.options.series[0].data = pieData
          } else {
            const xAxisData = []
            const seriesData = []
            for (let i = 1; i < json.length; i++) {
              const row = json[i]
              if (row && row.length >= 2) {
                xAxisData.push(String(row[0]))
                seriesData.push(Number(row[1]) || 0)
              }
            }
            if (!props.activeItem.options.xAxis) props.activeItem.options.xAxis = {}
            props.activeItem.options.xAxis.data = xAxisData
            props.activeItem.options.series[0].data = seriesData
            
            // 确保通过 Excel 上传的数据也能实时同步更新到手动输入框中
            xAxisInput.value = xAxisData.join(',')
            seriesInput.value = seriesData.join(',')
          }

          syncJsonToStr()
          ElMessage.success('数据解析成功，图表已更新')
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('文件解析失败，请检查文件是否损坏')
      }
    }

    reader.readAsArrayBuffer(file)
  }

  function addOption(item) {
    if (!item.options) item.options = []
    item.options.push({ label: '新选项', value: Date.now().toString() })
  }

  function removeOption(item, index) {
    item.options.splice(index, 1)
  }
</script>

<template>
  <div class="panel right-panel">
    <el-empty v-if="!activeItem" description="请在画布中选中组件" />
    
    <div v-else class="config-container">
      <div class="panel-header">
        <span class="header-title">组件配置</span>
        <el-tag size="small" type="primary" effect="light">{{ activeItem.type }}</el-tag>
      </div>

      <el-tabs v-model="activeTab" class="property-tabs">
        
        <el-tab-pane label="属性" name="properties">
          <el-form label-position="top" size="small" @submit.prevent class="config-form">
            
            <template v-if="activeItem.type === 'echarts'">
              <el-form-item label="图表高度 (px)">
                <el-input-number v-model="activeItem.height" :min="100" :max="1000" :step="10" style="width: 100%;" />
              </el-form-item>

              <el-divider content-position="left">基础外观</el-divider>
              <el-form-item label="图表主标题">
                <el-input v-model="chartTitle" clearable placeholder="请输入图表顶部标题" />
              </el-form-item>
              <div class="switch-group">
                <div class="switch-item">
                  <span>显示图例</span>
                  <el-switch v-model="chartLegendShow" />
                </div>
              </div>

              <el-divider content-position="left">极速数据导入</el-divider>
              <el-upload
                action=""
                :auto-upload="false"
                :show-file-list="false"
                accept=".xlsx, .xls, .csv"
                @change="handleExcelUpload"
              >
                <el-button type="success" plain style="width: 100%;">
                  上传 Excel 自动生成图表
                </el-button>
              </el-upload>
              <div style="font-size: 12px; color: #909399; margin-top: 5px; line-height: 1.4; margin-bottom: 15px;">
                说明：请确保表格包含两列数据，第一列为分类依据，第二列为数值，首行为表头。
              </div>

              <template v-if="isAxisChart">
                <el-divider content-position="left">手动数据设置</el-divider>
                <el-form-item label="X轴分类 (使用英文逗号分隔)">
                  <el-input type="textarea" v-model="xAxisInput" :rows="2" placeholder="例如：一月,二月,三月" @change="updateManualData" />
                </el-form-item>
                <el-form-item label="核心数值 (使用英文逗号分隔)">
                  <el-input type="textarea" v-model="seriesInput" :rows="2" placeholder="例如：120,200,150" @change="updateManualData" />
                </el-form-item>
              </template>

              <el-divider content-position="left">极客模式</el-divider>
              <el-collapse v-model="activeCollapse" class="json-collapse">
                <el-collapse-item title="展开高级 JSON 编辑器" name="json">
                  <el-input 
                    type="textarea" 
                    v-model="chartOptionsStr" 
                    :rows="12" 
                    class="json-editor-input"
                    :class="{ 'has-error': isJsonError }"
                  />
                  <el-button type="primary" style="width: 100%; margin-top: 10px;" @click="updateChartOptions">
                    强制写入底层数据
                  </el-button>
                </el-collapse-item>
              </el-collapse>
            </template>

            <template v-if="isFormComponent">
              <el-form-item label="数据字段 (Field)">
                <el-input :value="`field_${activeItem.id}`" disabled />
              </el-form-item>
              <el-form-item label="标题 (Label)">
                <el-input v-model="activeItem.label" placeholder="请输入标题" clearable />
              </el-form-item>
            </template>

            <template v-if="['input', 'textarea'].includes(activeItem.type)">
              <el-form-item label="占位内容 (Placeholder)">
                <el-input v-model="activeItem.placeholder" clearable />
              </el-form-item>
              <el-form-item label="最大输入长度" v-if="activeItem.type === 'input'">
                <el-input-number v-model="activeItem.maxLength" :min="1" controls-position="right" style="width: 100%;" placeholder="不限制" />
              </el-form-item>
              <el-form-item label="显示行数 (Rows)" v-if="activeItem.type === 'textarea'">
                <el-input-number v-model="activeItem.rows" :min="2" :max="20" controls-position="right" style="width: 100%;" />
              </el-form-item>
            </template>

            <template v-if="['select', 'radio', 'checkbox'].includes(activeItem.type)">
              <el-form-item label="占位内容 (Placeholder)" v-if="activeItem.type === 'select'">
                <el-input v-model="activeItem.placeholder" clearable />
              </el-form-item>
              <el-form-item label="配置选项 (Options)">
                <div v-for="(opt, index) in activeItem.options" :key="index" style="display: flex; gap: 5px; margin-bottom: 5px;">
                  <el-input v-model="opt.label" placeholder="选项名" />
                  <el-input v-model="opt.value" placeholder="选项值" />
                  <el-button type="danger" plain @click="removeOption(activeItem, index)">删</el-button>
                </div>
                <el-button type="primary" plain style="width: 100%; border-style: dashed;" @click="addOption(activeItem)">添加新选项</el-button>
              </el-form-item>
            </template>

            <template v-if="['slider', 'rate'].includes(activeItem.type)">
              <el-form-item label="最大值 (Max)">
                <el-input-number v-model="activeItem.max" :min="1" controls-position="right" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="默认初始值 (Default)">
                <el-input-number v-model="activeItem.value" :min="0" :max="activeItem.max" controls-position="right" style="width: 100%;" />
              </el-form-item>
            </template>

            <template v-if="['upload-file', 'upload-img'].includes(activeItem.type)">
              <el-form-item label="按钮文案">
                <el-input v-model="activeItem.buttonText" clearable />
              </el-form-item>
            </template>
            <template v-if="activeItem.type === 'button'">
              <el-form-item label="按钮文字">
                <el-input v-model="activeItem.text" clearable />
              </el-form-item>
              <el-form-item label="主题颜色">
                <el-color-picker v-model="activeItem.color" />
              </el-form-item>
            </template>

            <template v-if="activeItem.type === 'text'">
              <el-form-item label="文本内容">
                <el-input type="textarea" v-model="activeItem.content" :rows="3" />
              </el-form-item>
              <el-form-item label="字体大小 (px)">
                <el-input-number v-model="activeItem.fontSize" :min="12" :max="72" controls-position="right" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="文本颜色">
                <el-color-picker v-model="activeItem.color" />
              </el-form-item>
            </template>
            <template v-if="activeItem.type === 'image'">
              <el-form-item label="图片地址 (URL)">
                <el-input v-model="activeItem.url" clearable />
              </el-form-item>
            </template>
            <template v-if="activeItem.type === 'divider'">
              <el-form-item label="线条样式">
                <el-select v-model="activeItem.borderStyle" style="width: 100%;">
                  <el-option label="实线 (Solid)" value="solid" />
                  <el-option label="虚线 (Dashed)" value="dashed" />
                  <el-option label="点线 (Dotted)" value="dotted" />
                </el-select>
              </el-form-item>
            </template>

            <template v-if="isFormComponent">
              <el-divider content-position="left">状态与校验</el-divider>
              <div class="switch-group">
                <div class="switch-item">
                  <span>必填项 (Required)</span>
                  <el-switch v-model="activeItem.required" />
                </div>
                <div class="switch-item" v-if="['input', 'textarea'].includes(activeItem.type)">
                  <span>只读 (Readonly)</span>
                  <el-switch v-model="activeItem.readonly" />
                </div>
                <div class="switch-item" v-if="['input', 'select', 'date'].includes(activeItem.type)">
                  <span>可清空 (Clearable)</span>
                  <el-switch v-model="activeItem.clearable" />
                </div>
                <div class="switch-item">
                  <span>禁用状态 (Disabled)</span>
                  <el-switch v-model="activeItem.disabled" />
                </div>
                <div class="switch-item">
                  <span>隐藏组件 (Hidden)</span>
                  <el-switch v-model="activeItem.hidden" />
                </div>
              </div>
            </template>

            <el-divider />
            <el-button type="danger" style="width: 100%;" @click="emit('remove', activeItem.id)">
              删除此组件
            </el-button>

          </el-form>
        </el-tab-pane>

        <el-tab-pane label="样式" name="styles">
          <el-form label-position="top" size="small" class="config-form">
            <el-form-item label="组件宽度 (%)">
              <el-slider v-model="activeItem.width" :min="10" :max="100" />
            </el-form-item>
            <el-form-item label="外边距 Top (px)">
              <el-input-number v-model="activeItem.marginTop" :min="0" controls-position="right" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="外边距 Bottom (px)">
              <el-input-number v-model="activeItem.marginBottom" :min="0" controls-position="right" style="width: 100%;" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="事件" name="events">
          <el-empty description="事件流引擎开发中..." :image-size="60" />
        </el-tab-pane>

      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
  .panel { padding: 0; background: white; margin: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: all 0.3s ease; display: flex; flex-direction: column; }
  .right-panel { width: 340px; box-sizing: border-box; overflow: hidden; }

  .config-container { display: flex; flex-direction: column; height: 100%; }
  .panel-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ebeef5; background-color: #fafafa; }
  .header-title { font-size: 15px; font-weight: bold; color: #303133; }

  :deep(.el-tabs__header) { margin-bottom: 0; padding: 0 20px; background-color: #fafafa; }
  :deep(.el-tabs__nav-wrap::after) { height: 1px; }

  .config-form { padding: 20px; overflow-y: auto; flex: 1; }

  .switch-group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
  .switch-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #606266; }

  :deep(.el-form-item__label) { font-weight: 500; color: #303133; padding-bottom: 4px; }
  :deep(.el-divider__text) { color: #909399; font-size: 12px; }

  .json-collapse { border-top: none; }
  :deep(.json-editor-input .el-textarea__inner) {
    font-family: 'Fira Code', Consolas, Monaco, monospace;
    font-size: 13px;
    background-color: #f8f9fa;
    color: #333;
    line-height: 1.5;
    border-radius: 4px;
  }
  :deep(.json-editor-input.has-error .el-textarea__inner) {
    border-color: #F56C6C;
    background-color: #fef0f0;
  }
</style>