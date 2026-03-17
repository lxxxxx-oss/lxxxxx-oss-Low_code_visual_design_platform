// src/composables/useHistory.js
// 负责管理撤销和恢复的历史记录。它维护了两个数组：past 和 future，分别存储过去的历史快照和撤销后产生的未来快照。
// 通过 commit 函数来记录新的历史状态，undo 函数来撤销到上一个状态，redo 函数来恢复到下一个状态。
// 同时它还使用了一个 isTracking 变量来防止在执行撤销或重做操作时触发自动保存，避免产生不必要的历史记录。
import { ref, watch } from 'vue'

export function useHistory(targetData, activeItem) {
  const past = ref([])   // 存储过去的历史快照
  const future = ref([]) // 存储撤销后产生的未来快照
  let isTracking = true  // 极其致命的静默开关：防止撤销本身触发自动保存
  let timeoutId = null

  // 存下当前状态的快照到历史记录里
  function commit() {
    if (!isTracking) return
    // 极其暴力的深拷贝：把当前数组变成纯字符串，切断一切 Vue 内存引用！
    const snapshot = JSON.stringify(targetData.value)

    // 防抖：如果跟上一次长得一模一样，就不存了，避免浪费内存
    if (past.value.length > 0 && past.value[past.value.length - 1] === snapshot) return

    past.value.push(snapshot)
    future.value = [] // 只要有了新的手动操作，未来就被彻底抹杀了！

    // 容量控制：最多只记 20 步，防止内存撑爆浏览器
    if (past.value.length > 20) past.value.shift()
  }

  // 启动上帝之眼：死死盯住大动脉。只要数据变了，就拍快照！
  watch(targetData, () => {
    if (!isTracking) return
    clearTimeout(timeoutId)
    // 加上 300ms 延迟。防止你在右侧面板连续打字时，每一个字母都存一次历史
    timeoutId = setTimeout(() => {
      commit()
    }, 300)
  }, { deep: true }) // deep: true 保证无论改了多深的属性都能监听到

  // 时光倒流 (Undo)
  function undo() {
    if (past.value.length === 0) return
    isTracking = false // 极其关键：屏蔽监控，现在是时空穿梭时间！

    // 1. 把当前的自己，流放到“未来”
    future.value.push(JSON.stringify(targetData.value))
    // 2. 从“过去”拽出一个历史快照
    const previousState = past.value.pop()
    // 3. 强行夺舍！恢复数据
    targetData.value = JSON.parse(previousState)
    activeItem.value = null // 清空选中状态，防止绑定的内存错乱

    // 穿梭结束，重启监控
    setTimeout(() => { isTracking = true }, 50)
  }

  // 预知未来 (Redo)
  function redo() {
    
    if (future.value.length === 0) return
    isTracking = false // 屏蔽监控

    // 1. 把当前的自己，存入“过去”
    past.value.push(JSON.stringify(targetData.value))
    // 2. 从“未来”拽出快照
    const nextState = future.value.pop()
    // 3. 强行夺舍！
    targetData.value = JSON.parse(nextState)
    activeItem.value = null

    setTimeout(() => { isTracking = true }, 50)
  }

  return { past, future, undo, redo, commit }
}