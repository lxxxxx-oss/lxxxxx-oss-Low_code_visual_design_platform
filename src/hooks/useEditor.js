/**
 * 编辑器总控 Hook (Facade)
 * 架构更新：彻底剔除原生拖拽逻辑，全面拥抱 vuedraggable 的响应式数组驱动。
 */
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDesignerStore } from '../store/designer'
import { useHistory } from './useHistory'

export function useEditor() {
  const store = useDesignerStore()
  const { pageSchema, activeId, activeItem } = storeToRefs(store)
  const { addComponent, selectItem, removeComponent, clearCanvas } = store

  const { undo, redo } = useHistory(pageSchema)

  const saveStatus = ref('saved')
  let saveTimer = null

  watch(pageSchema, () => {
    saveStatus.value = 'saving'
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveStatus.value = 'saved'
    }, 500)
  }, { deep: true })

  function handleKeyDown(e) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') {
        e.preventDefault()
        undo()
      } else if (e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    pageSchema,
    activeItem,
    saveStatus,
    addComponent,
    selectItem,
    removeComponent,
    clearCanvas,
    undo,
    redo
  }
}