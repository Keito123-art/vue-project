<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 模式控制
const mode = ref(null) // null: 選擇模式 | 'simple': 1-50模式 | 'custom': 自訂名單模式
const selectedIndex = ref(null)
const selectedName = ref(null)
const isDrawing = ref(false)
const buttonText = ref('抽籤')
const displayIndex = ref(0)
const displayName = ref('')
const drawingInterval = ref(null)

// 自訂模式相關
const customCount = ref(0)
const customNames = ref([])
const excludedList = ref(new Set())
const showCountModal = ref(false)
const showNameModal = ref(false)
const countInput = ref('')
const namesInput = ref('')

// 音效
const clickSound = new Audio('/click.mp3')
const celebrateSound = new Audio('/celebrate.mp3')
clickSound.volume = 0.6
celebrateSound.volume = 0.8

const playClickSound = () => {
  clickSound.currentTime = 0
  clickSound.play().catch(() => {})
}

const playCelebrateSound = () => {
  celebrateSound.currentTime = 0
  celebrateSound.play().catch(() => {})
}

// 進階粒子效果系統
class Particle {
  constructor(startX, startY) {
    this.x = startX
    this.y = startY
    this.vx = (Math.random() - 0.5) * 12
    this.vy = (Math.random() - 0.5) * 12 - 5
    this.radius = Math.random() * 6 + 4
    this.colors = ['#FFD700', '#FF69B4', '#00CED1', '#FFB6C1', '#FF6347', '#98FB98', '#DDA0DD']
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)]
    this.life = 1
    this.gravity = 0.2
    this.bounce = 0.8
  }

  update() {
    this.vy += this.gravity
    this.x += this.vx
    this.y += this.vy
    this.life -= 0.01

    // 與邊框碰撞檢測
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (this.x + this.radius > viewportWidth) {
      this.x = viewportWidth - this.radius
      this.vx *= -this.bounce
    }
    if (this.x - this.radius < 0) {
      this.x = this.radius
      this.vx *= -this.bounce
    }
    if (this.y + this.radius > viewportHeight) {
      this.y = viewportHeight - this.radius
      this.vy *= -this.bounce
    }
    if (this.y - this.radius < 0) {
      this.y = this.radius
      this.vy *= -this.bounce
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color
    ctx.globalAlpha = this.life
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

// 創建高級粒子效果
const createAdvancedConfetti = () => {
  const canvas = document.createElement('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 100;
  `
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  const particles = []

  // 從左邊禮炮發射30個粒子
  const leftCannon = document.querySelector('.cannon-left')
  if (leftCannon) {
    const rect = leftCannon.getBoundingClientRect()
    for (let i = 0; i < 30; i++) {
      particles.push(new Particle(rect.left + rect.width / 2, rect.top + rect.height / 2))
    }
  }

  // 從右邊禮炮發射30個粒子
  const rightCannon = document.querySelector('.cannon-right')
  if (rightCannon) {
    const rect = rightCannon.getBoundingClientRect()
    for (let i = 0; i < 30; i++) {
      particles.push(new Particle(rect.left + rect.width / 2, rect.top + rect.height / 2))
    }
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update()
      particles[i].draw(ctx)

      if (particles[i].life <= 0) {
        particles.splice(i, 1)
      }
    }

    if (particles.length > 0) {
      requestAnimationFrame(animate)
    } else {
      canvas.remove()
    }
  }

  animate()
}

// 設定自訂模式的號碼數量
const setCustomCount = () => {
  const count = parseInt(countInput.value)
  if (count > 0) {
    customCount.value = count
    customNames.value = Array(count).fill('').map((_, i) => `${i + 1}`)
    showCountModal.value = false
    countInput.value = ''
    excludedList.value.clear()
    selectedIndex.value = null
    selectedName.value = null
    buttonText.value = '抽籤'
  }
}

// 設定自訂名稱
const setCustomNames = () => {
  if (!namesInput.value.trim()) return

  const lines = namesInput.value.split('\n').filter(line => line.trim())
  if (lines.length !== customCount.value) {
    alert(`請輸入 ${customCount.value} 個名稱，目前只有 ${lines.length} 個`)
    return
  }

  customNames.value = lines.map((name, i) => ({
    index: i + 1,
    name: name.trim()
  }))

  showNameModal.value = false
  namesInput.value = ''
  excludedList.value.clear()
  selectedIndex.value = null
  selectedName.value = null
  buttonText.value = '抽籤'
}

// 可用項目
const availableItems = computed(() => {
  if (mode.value === 'simple') {
    return Array.from({ length: 50 }, (_, i) => ({
      index: i + 1,
      name: `${i + 1}`
    })).filter(item => !excludedList.value.has(item.index))
  } else if (mode.value === 'custom') {
    // 檢查是否已經是對象格式 { index, name }
    if (customNames.value.length > 0 && typeof customNames.value[0] === 'object' && customNames.value[0].index !== undefined) {
      return customNames.value.filter(item => !excludedList.value.has(item.index))
    }
    // 否則轉換為對象格式
    return customNames.value
      .map((name, i) => ({
        index: i + 1,
        name: typeof name === 'string' ? name : name
      }))
      .filter(item => !excludedList.value.has(item.index))
  }
  return []
})

// 抽籤邏輯
const drawNumber = () => {
  playClickSound()

  if (isDrawing.value || availableItems.value.length === 0) return

  isDrawing.value = true
  selectedIndex.value = null
  selectedName.value = null
  displayIndex.value = 0
  displayName.value = ''
  let count = 0

  // 動畫效果：快速轉動
  drawingInterval.value = setInterval(() => {
    const randomItem = availableItems.value[Math.floor(Math.random() * availableItems.value.length)]
    displayIndex.value = randomItem.index
    // 確保displayName始終是字符串
    displayName.value = typeof randomItem.name === 'object' && randomItem.name.name ? randomItem.name.name : (typeof randomItem.name === 'string' ? randomItem.name : '')
    count++

    // 轉動30次後停止
    if (count > 30) {
      clearInterval(drawingInterval.value)
      const finalItem = availableItems.value[Math.floor(Math.random() * availableItems.value.length)]
      selectedIndex.value = finalItem.index
      // 確保selectedName和displayName始終是字符串
      if (typeof finalItem.name === 'object' && finalItem.name.name) {
        selectedName.value = finalItem.name.name
        displayName.value = finalItem.name.name
      } else if (typeof finalItem.name === 'string') {
        selectedName.value = finalItem.name
        displayName.value = finalItem.name
      }
      displayIndex.value = finalItem.index
      isDrawing.value = false
      createAdvancedConfetti()
      playCelebrateSound()
    }
  }, 50)
}

// 排除此人
const excludeStudent = () => {
  excludedList.value.add(selectedIndex.value)
  selectedIndex.value = null
  selectedName.value = null
  buttonText.value = '重抽'

  if (availableItems.value.length === 0) {
    alert('所有人都已經被抽到！')
  }
}

// 清除所有排除
const clearExcluded = () => {
  excludedList.value.clear()
  selectedIndex.value = null
  selectedName.value = null
  buttonText.value = '抽籤'
}

// 重置模式
const resetMode = () => {
  mode.value = null
  selectedIndex.value = null
  selectedName.value = null
  excludedList.value.clear()
  customCount.value = 0
  customNames.value = []
  buttonText.value = '抽籤'
}

// 返回首頁
const goBack = () => {
  playClickSound()
  router.push('/')
}
</script>

<template>
  <div class="rollcall-container">
    <!-- 返回按鈕 -->
    <button class="back-btn" @click="goBack">
      ← 返回首頁
    </button>

    <!-- 切換按鈕 -->
    <!-- 已移除 -->

    <!-- 禮炮左側 -->
    <div class="cannon cannon-left">🎉</div>
    <!-- 禮炮右側 -->
    <div class="cannon cannon-right">🎉</div>

    <!-- 模式選擇 -->
    <div v-if="mode === null" class="mode-selector">
      <h1 class="mode-title">🎲 選擇抽籤模式</h1>
      <div class="mode-buttons">
        <button class="mode-btn simple-mode" @click="mode = 'simple'">
          <div class="mode-icon">1️⃣</div>
          <div class="mode-name">簡單模式</div>
          <div class="mode-desc">默認抽選 1-50 號</div>
        </button>
        <button class="mode-btn custom-mode" @click="mode = 'custom'">
          <div class="mode-icon">📝</div>
          <div class="mode-name">自訂模式</div>
          <div class="mode-desc">匯入名單自訂抽籤</div>
        </button>
      </div>
    </div>

    <!-- 簡單模式 -->
    <div v-if="mode === 'simple'" class="draw-machine">
      <div class="mode-indicator">簡單模式 (1-50)</div>
      <h1 class="title">🎲 班級隨機抽籤機</h1>

      <div v-if="excludedList.size > 0" class="excluded-info">
        已排除：{{ excludedList.size }} 人 | 剩餘：{{ availableItems.length }} 人
      </div>

      <div class="result-area">
        <div class="result-display">
          <div class="number-slot">{{ displayIndex || 0 }}</div>
        </div>
        <p v-if="selectedIndex" class="result-text">
          恭喜抽到第 <span class="highlight">{{ selectedIndex }}</span> 號同學
        </p>
        <p v-else class="result-text placeholder">準備好了嗎？按下抽籤按鈕！</p>
      </div>

      <button
        class="draw-button"
        @click="drawNumber"
        :disabled="isDrawing || availableItems.length === 0"
        :class="{ 'redraw': buttonText === '重抽' }"
      >
        {{ buttonText }}
      </button>

      <button
        v-if="selectedIndex"
        class="exclude-btn"
        @click="excludeStudent"
      >
        ❌ 排除此人
      </button>

      <button
        v-if="excludedList.size > 0"
        class="clear-excluded-btn"
        @click="clearExcluded"
      >
        🔄 清除排除
      </button>

      <button class="switch-mode-btn" @click="resetMode">
        🔀 切換模式
      </button>

      <p class="tips">
        <span v-if="availableItems.length === 0">所有人都已經被抽到！</span>
        <span v-else-if="!selectedIndex">點擊按鈕開始抽籤</span>
        <span v-else>再次點擊可以重新抽籤</span>
      </p>
    </div>

    <!-- 自訂模式 -->
    <div v-if="mode === 'custom'" class="draw-machine custom-mode-machine">
      <div class="mode-indicator">自訂模式</div>
      <h1 class="title">🎲 自訂抽籤機</h1>

      <div v-if="customCount === 0" class="setup-area">
        <p class="setup-hint">請先設定抽籤的參數</p>
        <div class="setup-buttons">
          <button class="setup-btn" @click="showCountModal = true">
            🔢 設定號碼數量
          </button>
        </div>
      </div>

      <div v-else>
        <div v-if="excludedList.size > 0" class="excluded-info">
          已排除：{{ excludedList.size }} 人 | 剩餘：{{ availableItems.length }} 人
        </div>

        <div class="custom-info">
          共 {{ customCount }} 項 | 已設定名稱：{{ typeof customNames[0] === 'object' ? customNames.filter(n => n.name).length : customNames.filter(n => n).length }}
        </div>

        <div class="result-area">
          <div class="result-display">
            <div class="number-slot">{{ displayIndex || 0 }}</div>
            <div v-if="displayName" class="name-display">{{ displayName }}</div>
          </div>
          <p v-if="selectedIndex && selectedName" class="result-text">
            恭喜抽到：<span class="highlight">{{ selectedName }}</span>
          </p>
          <p v-else class="result-text placeholder">準備好了嗎？按下抽籤按鈕！</p>
        </div>

        <button
          class="draw-button"
          @click="drawNumber"
          :disabled="isDrawing || availableItems.length === 0"
          :class="{ 'redraw': buttonText === '重抽' }"
        >
          {{ buttonText }}
        </button>

        <div class="custom-buttons">
          <button class="setup-btn" @click="showCountModal = true">
            🔢 修改號碼數量
          </button>
          <button class="setup-btn" @click="showNameModal = true">
            📝 設定籤的名稱
          </button>
        </div>

        <button
          v-if="selectedIndex"
          class="exclude-btn"
          @click="excludeStudent"
        >
          ❌ 排除此人
        </button>

        <button
          v-if="excludedList.size > 0"
          class="clear-excluded-btn"
          @click="clearExcluded"
        >
          🔄 清除排除
        </button>

        <button class="switch-mode-btn" @click="resetMode">
          🔀 切換模式
        </button>

        <p class="tips">
          <span v-if="availableItems.length === 0">所有項目都已經被抽到！</span>
          <span v-else-if="!selectedIndex">點擊按鈕開始抽籤</span>
          <span v-else>再次點擊可以重新抽籤</span>
        </p>
      </div>
    </div>

    <!-- 設定號碼數量模態框 -->
    <div v-if="showCountModal" class="modal-overlay" @click="showCountModal = false">
      <div class="modal-content" @click.stop>
        <h2>🔢 設定號碼數量</h2>
        <p class="modal-hint">輸入要抽籤的項目數量</p>
        <input
          v-model.number="countInput"
          type="number"
          placeholder="例如：30"
          class="number-input"
          min="1"
          max="1000"
        />
        <div class="modal-buttons">
          <button class="modal-btn cancel-btn" @click="showCountModal = false">取消</button>
          <button class="modal-btn confirm-btn" @click="setCustomCount">確認</button>
        </div>
      </div>
    </div>

    <!-- 設定籤名稱模態框 -->
    <div v-if="showNameModal" class="modal-overlay" @click="showNameModal = false">
      <div class="modal-content" @click.stop>
        <h2>📝 設定籤的名稱</h2>
        <p class="modal-hint">每行輸入一個名稱，共需 {{ customCount }} 項</p>
        <textarea
          v-model="namesInput"
          placeholder="例如：
小明
小芬
小王"
          class="import-textarea"
        ></textarea>
        <div class="modal-buttons">
          <button class="modal-btn cancel-btn" @click="showNameModal = false">取消</button>
          <button class="modal-btn confirm-btn" @click="setCustomNames">確認</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rollcall-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  position: relative;
  overflow: hidden;
  color: #1f2937;
}

/* 禮炮效果 */
.cannon {
  position: absolute;
  font-size: 4rem;
  z-index: 5;
  animation: cannonBounce 0.6s ease-out infinite alternate;
  opacity: 0.8;
  cursor: default;
}

.cannon-left {
  left: 50px;
  top: 50%;
  transform: translateY(-50%) rotateZ(-15deg);
}

.cannon-right {
  right: 50px;
  top: 50%;
  transform: translateY(-50%) rotateZ(15deg);
}

@keyframes cannonBounce {
  0% { transform: translateY(-50%) rotateZ(-15deg) scale(1); }
  50% { transform: translateY(-50%) rotateZ(-15deg) scale(1.15); }
  100% { transform: translateY(-50%) rotateZ(-15deg) scale(1); }
}

/* 返回按鈕 */
.back-btn {
  position: absolute;
  top: 30px;
  left: 30px;
  padding: 10px 20px;
  border-radius: 25px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 400;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.back-btn:hover {
  transform: translateX(-5px);
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.back-btn:active {
  transform: scale(0.95);
}

/* 模式選擇器 */
.mode-selector {
  width: 100%;
  max-width: 600px;
  text-align: center;
  animation: slideIn 0.6s ease-out;
  z-index: 20;
}

.mode-title {
  font-size: 2.5rem;
  font-weight: 400;
  color: #ffffff;
  margin: 0 0 50px 0;
  letter-spacing: 2px;
}

.mode-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.mode-btn {
  padding: 40px 25px;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(10px);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.mode-btn:hover {
  transform: translateY(-5px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.mode-icon {
  font-size: 3rem;
}

.mode-name {
  font-size: 1.3rem;
  font-weight: 700;
}

.mode-desc {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* 抽籤機主區域 */
.draw-machine {
  width: 100%;
  max-width: 550px;
  padding: 50px 40px;
  border-radius: 30px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  text-align: center;
  animation: slideIn 0.6s ease-out;
  z-index: 20;
  position: relative;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mode-indicator {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(102, 126, 234, 0.3);
  border-radius: 20px;
  font-size: 0.85rem;
  color: #adb8f5;
  margin-bottom: 15px;
  border: 1px solid rgba(102, 126, 234, 0.5);
}

/* 標題 */
.title {
  font-size: 2rem;
  font-weight: 400;
  color: #ffffff;
  margin: 0 0 30px 0;
  letter-spacing: 2px;
}

/* 已排除提示 */
.excluded-info {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 15px 0;
  padding: 10px 15px;
  background: rgba(255, 107, 107, 0.2);
  border-radius: 10px;
  border-left: 3px solid #ff6b6b;
}

/* 自訂信息 */
.custom-info {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 15px 0;
  padding: 10px 15px;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 10px;
  border-left: 3px solid #667eea;
}

/* 設置區域 */
.setup-area {
  padding: 30px 0;
}

.setup-hint {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin: 0 0 30px 0;
}

.setup-buttons,
.custom-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin: 20px 0;
}

.setup-btn {
  padding: 14px 28px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.setup-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.setup-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 結果顯示區域 */
.result-area {
  margin: 40px 0;
  padding: 30px;
  background: rgba(191, 219, 254, 0.35);
  border-radius: 20px;
  border: 2px solid rgba(191, 219, 254, 0.55);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 結果顯示 */
.result-display {
  margin-bottom: 20px;
}

/* 數字插槽 */
.number-slot {
  font-size: 5rem;
  font-weight: 900;
  color: #4f46e5;
  line-height: 1;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(79, 70, 229, 0.1);
  border-radius: 15px;
  min-height: 100px;
  transition: all 0.1s ease;
}

/* 名字顯示 */
.name-display {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fbbf24;
  margin-top: 10px;
}

/* 結果文字 */
.result-text {
  font-size: 1.2rem;
  color: #ffffff;
  margin: 0;
  opacity: 0.9;
  animation: fadeIn 0.4s ease-out;
}

.result-text.placeholder {
  opacity: 0.6;
}

.highlight {
  font-size: 1.5rem;
  font-weight: 900;
  color: #fbbf24;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 0.9; }
}

/* 抽籤按鈕 */
.draw-button {
  width: 100%;
  max-width: 300px;
  padding: 20px 40px;
  font-size: 1.5rem;
  font-weight: 900;
  color: white;
  border: none;
  border-radius: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  letter-spacing: 2px;
  margin: 0 auto;
}

.draw-button:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
}

.draw-button:active:not(:disabled) {
  transform: translateY(-1px) scale(1.02);
}

.draw-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.draw-button.redraw {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
}

.draw-button.redraw:hover:not(:disabled) {
  box-shadow: 0 6px 25px rgba(245, 87, 108, 0.6);
}

/* 排除按鈕 */
.exclude-btn {
  width: 100%;
  max-width: 200px;
  padding: 12px 24px;
  margin-top: 15px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.exclude-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
}

/* 清除排除按鈕 */
.clear-excluded-btn {
  width: 100%;
  max-width: 200px;
  padding: 12px 25px;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.clear-excluded-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

/* 切換模式按鈕 */
.switch-mode-btn {
  width: 100%;
  max-width: 200px;
  padding: 12px 25px;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.switch-mode-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 提示文字 */
.tips {
  margin-top: 20px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  animation: fadeIn 0.5s ease-out 0.2s backwards;
}

/* 模態框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%);
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: slideIn 0.3s ease-out;
}

.modal-content h2 {
  color: #ffffff;
  margin: 0 0 15px 0;
  font-size: 1.8rem;
}

.modal-hint {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  margin: 0 0 20px 0;
}

.number-input {
  width: 100%;
  padding: 15px;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1.1rem;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.number-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.import-textarea {
  width: 100%;
  height: 200px;
  padding: 15px;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-family: monospace;
  font-size: 1rem;
  resize: none;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.import-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.modal-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.modal-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

/* 響應式設計 */
@media (max-width: 700px) {
  .cannon-left {
    left: 20px;
  }

  .cannon-right {
    right: 20px;
  }

  .mode-buttons {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .mode-btn {
    padding: 30px 20px;
  }

  .draw-machine {
    padding: 40px 25px;
    border-radius: 25px;
  }

  .title {
    font-size: 1.5rem;
    margin-bottom: 25px;
  }

  .number-slot {
    font-size: 3.5rem;
    min-height: 80px;
  }

  .name-display {
    font-size: 1.3rem;
  }

  .setup-buttons,
  .custom-buttons {
    grid-template-columns: 1fr;
  }
}


</style>
