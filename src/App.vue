<script setup>
/**
 * 低代码引擎大总管 (Main Controller)
 */
import LeftPanel from './components/LeftPanel.vue'
import CenterCanvas from './components/CenterCanvas.vue'
import RightPanel from './components/RightPanel.vue'

// 🚀 极其优雅的依赖注入！直接呼叫总台！
import { useEditor } from './hooks/useEditor'

// 一键解构所有暴露的属性和操作指令
const {
  pageSchema,
  activeItem,
  saveStatus,
  addComponent,
  selectItem,
  handleDragStart,
  handleDrop,
  removeComponent,
  clearCanvas,
  undo,
  redo
} = useEditor()

</script>

<template>
  <div class="app-container">
    <div class="main-content">
      <LeftPanel @add="addComponent" />

      <CenterCanvas
        :schema="pageSchema"
        :activeId="activeItem ? activeItem.id : null"
        :canUndo="true" 
        :canRedo="true" 
        :saveStatus="saveStatus"
        @select="selectItem"
        @drag-start="handleDragStart"
        @drop="handleDrop"
        @undo="undo"
        @redo="redo"
        @clear="clearCanvas"
      />

      <RightPanel
        :activeItem="activeItem"
        @remove="removeComponent"
      />
    </div>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #f0f2f5; 
}
#app { height: 100vh; }
.app-container { display: flex; flex-direction: column; height: 100%; }
.main-content { display: flex; flex: 1; overflow: hidden; }
</style>