import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import { cloneDeep, debounce } from 'lodash-es'
import { nanoid } from 'nanoid'
import type { ComponentSchema, LayoutComponent } from '../types/schema'

export const useDesignerStore = defineStore('designer', () => {
  const STORAGE_KEY = 'form_designer_saved_schema'
  const savedData = localStorage.getItem(STORAGE_KEY)
  
  // 强类型初始化
  const initialData: ComponentSchema[] = savedData ? JSON.parse(savedData) : []

  // 核心响应式状态
  const pageSchema: Ref<ComponentSchema[]> = ref(initialData)
  const activeId: Ref<string | null> = ref(null)

  // 防抖保存逻辑
  const debouncedSave = debounce((newVal: ComponentSchema[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
  }, 500)

  // 深度监听图纸变化
  watch(pageSchema, (newVal) => {
    debouncedSave(newVal)
  }, { deep: true })

  // 递归查找当前选中的组件
  const activeItem = computed<ComponentSchema | null>(() => {
    if (!activeId.value) return null
    let result: ComponentSchema | null = null
    
    const findNode = (list: ComponentSchema[]): boolean => {
      for (const item of list) {
        if (item.id === activeId.value) {
          result = item
          return true
        }
        if ('children' in item && item.children && findNode(item.children)) return true
        if ('cols' in item && item.cols) {
          for (const col of item.cols) {
            if (col.children && findNode(col.children)) return true
          }
        }
        if ('panes' in item && item.panes) {
          for (const pane of item.panes) {
            if (pane.children && findNode(pane.children)) return true
          }
        }
      }
      return false
    }
    
    findNode(pageSchema.value)
    return result
  })

  // 添加新组件
  const addComponent = (item: any) => {
    const newItem = cloneDeep(item) as ComponentSchema
    newItem.id = nanoid(10)
    delete (newItem as any).icon
    
    if (newItem.type === 'card' && !('children' in newItem)) {
      (newItem as LayoutComponent).children = []
    }
    
    pageSchema.value.push(newItem)
    activeId.value = newItem.id
  }

  // 选中组件
  const selectItem = (item: ComponentSchema | null) => {
    activeId.value = item ? item.id : null
  }

  // 递归删除组件
  const removeComponent = (id: string) => {
    const removeNode = (list: ComponentSchema[], targetId: string): boolean => {
      for (let i = 0; i < list.length; i++) {
        if (list[i].id === targetId) {
          list.splice(i, 1)
          return true
        }
        const item = list[i]
        
        if ('children' in item && item.children && removeNode(item.children, targetId)) return true
        if ('cols' in item && item.cols) {
          for (const col of item.cols) {
            if (col.children && removeNode(col.children, targetId)) return true
          }
        }
        if ('panes' in item && item.panes) {
          for (const pane of item.panes) {
            if (pane.children && removeNode(pane.children, targetId)) return true
          }
        }
      }
      return false
    }
    
    removeNode(pageSchema.value, id)
    if (activeId.value === id) {
      activeId.value = null
    }
  }

  // 清空画布
  const clearCanvas = () => {
    pageSchema.value = []
    activeId.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  // 必须暴露出这些方法和属性，这是报错的核心对应点
  return {
    pageSchema,
    activeId,
    activeItem,
    addComponent,
    selectItem,
    removeComponent,
    clearCanvas
  }
})