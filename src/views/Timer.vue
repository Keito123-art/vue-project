<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isDarkMode = inject('isDarkMode')
const toggleTheme = inject('toggleTheme')

// 基础状态
const currentMode = ref('setup') // setup | timing | qa | record
const timerState = ref('idle') // idle | running | paused | finished
const groupName = ref('')
const totalSeconds = ref(0)
const remainingSeconds = ref(0)
const timerInterval = ref(null)
const tickInterval = ref(null)

// 音效
const tickSound = new Audio('/click.mp3')
const completeSound = new Audio('/celebrate.mp3')
tickSound.volume = 0.3
completeSound.volume = 0.8

// 时间记录
const groupRecords = ref([])

// Q&A 模式参数
const qaMode = ref('timer') // timer | qa
const qaTimePreset = ref(120) // 默认 2 分钟

// 音效和视觉效果
const flashingRed = ref(false)
const showCompletionModal = ref(false)

const playTick = () => {
  tickSound.currentTime = 0
  tickSound.play().catch(() => {})
}

const playComplete = () => {
  completeSound.currentTime = 0
  completeSound.play().catch(() => {})
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 状态颜色
const timerStatus = computed(() => {
  if (timerState.value === 'finished') return 'finished'
  if (remainingSeconds.value <= 10) return 'critical'
  if (remainingSeconds.value <= 60) return 'warning'
  return 'active'
})

// 能量条宽度百分比（根据总时间计算）
const progressPercent = computed(() => {
  if (totalSeconds.value === 0) return 100
  return Math.max(0, (remainingSeconds.value / totalSeconds.value) * 100)
})

// 能量条颜色
const barColor = computed(() => {
  if (remainingSeconds.value <= 10) return '#FF3333'
  if (remainingSeconds.value <= 60) return '#FFD700'
  return '#22C55E'
})

// 开始计时
const startTimer = (seconds, name = '') => {
  groupName.value = name || `第 ${groupRecords.value.length + 1} 组`
  totalSeconds.value = seconds
  remainingSeconds.value = seconds
  timerState.value = 'running'
  currentMode.value = 'timing'
  
  // 开始计时循环
  timerInterval.value = setInterval(() => {
    remainingSeconds.value--

    // 最后 10 秒播放 tick 声和闪烁
    if (remainingSeconds.value <= 10 && remainingSeconds.value > 0) {
      playTick()
      if (remainingSeconds.value <= 10) {
        flashingRed.value = !flashingRed.value
      }
    }

    // 计时完成
    if (remainingSeconds.value <= 0) {
      clearInterval(timerInterval.value)
      timerState.value = 'finished'
      flashingRed.value = false
      playComplete()
      
      // 记录此组的时间
      groupRecords.value.push({
        name: groupName.value,
        planTime: totalSeconds.value,
        actualTime: totalSeconds.value,
        timestamp: new Date().toLocaleTimeString()
      })
      
      showCompletionModal.value = true
    }
  }, 1000)
}

// 暂停计时
const pauseTimer = () => {
  clearInterval(timerInterval.value)
  timerState.value = 'paused'
}

// 恢复计时
const resumeTimer = () => {
  if (remainingSeconds.value > 0) {
    timerState.value = 'running'
    timerInterval.value = setInterval(() => {
      remainingSeconds.value--

      if (remainingSeconds.value <= 10 && remainingSeconds.value > 0) {
        playTick()
        flashingRed.value = !flashingRed.value
      }

      if (remainingSeconds.value <= 0) {
        clearInterval(timerInterval.value)
        timerState.value = 'finished'
        playComplete()
      }
    }, 1000)
  }
}

// 停止计时
const stopTimer = () => {
  clearInterval(timerInterval.value)
  timerState.value = 'idle'
  flashingRed.value = false
  remainingSeconds.value = 0
  totalSeconds.value = 0
  groupName.value = ''
  currentMode.value = 'setup'
}

// 切换到 Q&A 模式
const switchToQA = (duration) => {
  showCompletionModal.value = false
  qaMode.value = 'qa'
  startTimer(duration, `Q&A (${groupName.value})`)
}

// 继续下一组
const nextGroup = () => {
  showCompletionModal.value = false
  currentMode.value = 'setup'
  timerState.value = 'idle'
  remainingSeconds.value = 0
  totalSeconds.value = 0
}

// 查看记录清单
const viewRecords = () => {
  currentMode.value = 'record'
}

// 导出到计分板
const goToScoreBoard = () => {
  router.push('/scoreboard')
}

// 返回首页
const goBack = () => {
  clearInterval(timerInterval.value)
  router.push('/')
}
</script>

<template>
  <div class="timer-container" :class="{ flashing: flashingRed && timerState === 'running' && remainingSeconds <= 10 }">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">← 返回首頁</button>

    <!-- 切換按鈕 -->
    <button class="theme-toggle" @click="toggleTheme">
      {{ isDarkMode ? '☀️ 淺色' : '🌙 深色' }}
    </button>

    <!-- 设置模式 -->
    <div v-if="currentMode === 'setup'" class="setup-screen">
      <h1>🎯 小組報告計時器</h1>
      
      <div class="group-input">
        <label>小組名稱（選填）</label>
        <input 
          v-model="groupName" 
          type="text" 
          placeholder="例如：第 1 組、隊伍 A、小組名稱"
          class="group-name-input"
        >
      </div>

      <div class="preset-times">
        <p class="preset-label">預設時間</p>
        <div class="button-grid">
          <button class="preset-btn time-btn-3" @click="startTimer(180, groupName || '第 1 組')">
            <span class="time">3分</span>
            <span class="label">分鐘</span>
          </button>
          <button class="preset-btn time-btn-5" @click="startTimer(300, groupName || '第 2 組')">
            <span class="time">5分</span>
            <span class="label">分鐘</span>
          </button>
          <button class="preset-btn time-btn-10" @click="startTimer(600, groupName || '第 3 組')">
            <span class="time">10分</span>
            <span class="label">分鐘</span>
          </button>
          <button class="preset-btn time-btn-15" @click="startTimer(900, groupName || '第 4 組')">
            <span class="time">15分</span>
            <span class="label">分鐘</span>
          </button>
        </div>
      </div>

      <div class="custom-time">
        <label>自訂時間（秒）</label>
        <div class="custom-input-group">
          <input 
            v-model.number="totalSeconds" 
            type="number" 
            min="1"
            placeholder="輸入秒數"
            class="custom-input"
          >
          <button 
            v-if="totalSeconds > 0"
            class="custom-btn" 
            @click="startTimer(totalSeconds, groupName || `自訂 ${totalSeconds}秒`)">
            開始
          </button>
        </div>
      </div>

      <div v-if="groupRecords.length > 0" class="records-link">
        <button class="view-records-btn" @click="viewRecords">
          📋 查看記錄清單 ({{ groupRecords.length }} 組)
        </button>
      </div>
    </div>

    <!-- 计时模式 -->
    <div v-if="currentMode === 'timing'" class="timing-screen">
      <!-- 小组名称 -->
      <div class="group-title">
        <h2>🎤 {{ groupName }}</h2>
      </div>

      <!-- 主要计时显示 -->
      <div class="timer-display" :class="timerStatus">
        <div class="time-text">{{ formatTime(remainingSeconds) }}</div>
        <div v-if="timerState === 'finished'" class="finished-badge">⏹️ 完成</div>
      </div>

      <!-- 状态指示灯 -->
      <div class="status-lights">
        <div class="light" :class="{ active: timerStatus === 'active' }">進行中</div>
        <div class="light" :class="{ active: timerStatus === 'warning' }">收尾</div>
        <div class="light" :class="{ active: timerStatus === 'critical' }">加速</div>
      </div>

      <!-- 控制按钮 -->
      <div class="controls">
        <button 
          v-if="timerState === 'running'"
          class="control-btn pause-btn"
          @click="pauseTimer">
          ⏸️ 暫停
        </button>
        <button 
          v-if="timerState === 'paused'"
          class="control-btn resume-btn"
          @click="resumeTimer">
          ▶️ 繼續
        </button>
        <button 
          class="control-btn stop-btn"
          @click="stopTimer">
          ⏹️ 停止
        </button>
      </div>

      <!-- 完成选项 -->
      <div v-if="timerState === 'finished'" class="completion-options">
        <button class="option-btn qa-btn" @click="switchToQA(120)">
          💬 Q&A 2分鐘
        </button>
        <button class="option-btn qa-btn" @click="switchToQA(240)">
          💬 Q&A 4分鐘
        </button>
        <button class="option-btn next-btn" @click="nextGroup">
          👥 下一組
        </button>
      </div>
    </div>

    <!-- 记录清单模式 -->
    <div v-if="currentMode === 'record'" class="record-screen">
      <h1>📋 各組計時統計</h1>
      
      <div class="records-table">
        <div class="table-header">
          <div class="col-group">小組名稱</div>
          <div class="col-time">計畫時間</div>
          <div class="col-time">實際時間</div>
          <div class="col-time">差異</div>
          <div class="col-time">時間戳</div>
        </div>
        
        <div 
          v-for="(record, idx) in groupRecords" 
          :key="idx"
          class="table-row"
          :class="{ 'precise': Math.abs(record.actualTime - record.planTime) < 5 }"
        >
          <div class="col-group">{{ record.name }}</div>
          <div class="col-time">{{ formatTime(record.planTime) }}</div>
          <div class="col-time">{{ formatTime(record.actualTime) }}</div>
          <div class="col-time">
            <span v-if="Math.abs(record.actualTime - record.planTime) < 5" class="precise-badge">✨ 精準</span>
            <span v-else>{{ Math.abs(record.actualTime - record.planTime) }}秒</span>
          </div>
          <div class="col-time">{{ record.timestamp }}</div>
        </div>
      </div>

      <div class="best-group">
        <h3>🏆 控時最精準組別</h3>
        <div class="best-candidates">
          <div 
            v-for="(record, idx) in groupRecords.sort((a, b) => 
              Math.abs(a.actualTime - a.planTime) - Math.abs(b.actualTime - b.planTime)
            ).slice(0, 3)"
            :key="idx"
            class="candidate"
            :class="{ 'gold': idx === 0, 'silver': idx === 1, 'bronze': idx === 2 }"
          >
            <div v-if="idx === 0" class="medal">🥇</div>
            <div v-else-if="idx === 1" class="medal">🥈</div>
            <div v-else-if="idx === 2" class="medal">🥉</div>
            <div class="name">{{ record.name }}</div>
            <div class="error">誤差 {{ Math.abs(record.actualTime - record.planTime) }} 秒</div>
          </div>
        </div>
      </div>

      <div class="record-actions">
        <button class="action-btn" @click="goToScoreBoard">
          📊 前往計分板扣分
        </button>
        <button class="action-btn" @click="currentMode = 'setup'">
          ⬅️ 返回計時器
        </button>
      </div>
    </div>

    <!-- 能量条（全屏底部） -->
    <div v-if="currentMode === 'timing'" class="energy-bar-container">
      <div class="energy-bar" :style="{ width: progressPercent + '%', backgroundColor: barColor }"></div>
      <div class="energy-label">
        <span class="percent">{{ Math.round(progressPercent) }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.timer-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  transition: background-color 0.3s ease;
  color: #1f2937;
  text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
}

.timer-container.flashing {
  animation: flashRed 0.5s infinite;
}

@keyframes flashRed {
  0%, 100% { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  50% { background: linear-gradient(135deg, #FF3333 0%, #CC0000 100%); }
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 设置屏幕 */
.setup-screen {
  max-width: 800px;
  margin: 60px auto 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.setup-screen h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 32px;
}

.group-input {
  margin-bottom: 30px;
}

.group-input label {
  display: block;
  color: #666;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.group-name-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.group-name-input:focus {
  outline: none;
  border-color: #667eea;
}

.preset-label {
  color: #666;
  font-weight: 600;
  margin-bottom: 15px;
  font-size: 14px;
}

.preset-times {
  margin-bottom: 30px;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.preset-btn {
  padding: 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 400;
  font-size: 18px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.time-btn-3 {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.time-btn-5 {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.time-btn-10 {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.time-btn-15 {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.preset-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.time {
  font-size: 24px;
}

.label {
  font-size: 12px;
  opacity: 0.9;
}

.custom-time {
  margin-bottom: 30px;
}

.custom-time label {
  display: block;
  color: #666;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.custom-input-group {
  display: flex;
  gap: 10px;
}

.custom-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.custom-input:focus {
  outline: none;
  border-color: #667eea;
}

.custom-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 400;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.custom-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.records-link {
  margin-top: 20px;
  text-align: center;
}

.view-records-btn {
  padding: 12px 24px;
  background: #f5576c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 400;
  font-size: 14px;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.view-records-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 计时屏幕 */
.timing-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding-bottom: 100px;
}

.group-title {
  margin-bottom: 40px;
  text-align: center;
}

.group-title h2 {
  color: white;
  font-size: 36px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.timer-display {
  font-size: 120px;
  font-weight: 400;
  color: white;
  text-shadow: 0 6px 30px rgba(0, 0, 0, 0.35);
  margin: 40px 0;
  position: relative;
  font-family: 'Courier New', monospace;
  text-align: center;
  transition: all 0.3s ease;
}

.timer-display.active {
  text-shadow: 0 4px 20px rgba(34, 197, 94, 0.5);
}

.timer-display.warning {
  text-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
  animation: pulse-yellow 1s infinite;
}

.timer-display.critical {
  text-shadow: 0 4px 20px rgba(255, 51, 51, 0.8);
  animation: pulse-red 0.5s infinite;
}

.timer-display.finished {
  text-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
}

@keyframes pulse-yellow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes pulse-red {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.finished-badge {
  position: absolute;
  top: -30px;
  right: -60px;
  background: #FFD700;
  color: #333;
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 24px;
  font-weight: 600;
  animation: bounce 0.6s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.status-lights {
  display: flex;
  gap: 20px;
  margin: 40px 0;
  justify-content: center;
}

.light {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 400;
  font-size: 12px;
  text-align: center;
  padding: 8px;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.light:nth-child(1) {
  border: 3px solid #22C55E;
}

.light:nth-child(2) {
  border: 3px solid #FFD700;
}

.light:nth-child(3) {
  border: 3px solid #FF3333;
}

.light.active {
  transform: scale(1.2);
  box-shadow: 0 0 30px currentColor;
}

.light.active:nth-child(1) {
  background: rgba(34, 197, 94, 0.6);
}

.light.active:nth-child(2) {
  background: rgba(255, 215, 0, 0.6);
}

.light.active:nth-child(3) {
  background: rgba(255, 51, 51, 0.6);
  animation: flash 0.3s infinite;
}

@keyframes flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.controls {
  display: flex;
  gap: 15px;
  margin: 30px 0;
}

.control-btn {
  padding: 15px 30px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 400;
  font-size: 16px;
  transition: all 0.3s ease;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.pause-btn {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.pause-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}

.resume-btn {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.resume-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.stop-btn {
  background: rgba(255, 51, 51, 0.8);
}

.stop-btn:hover {
  background: rgba(255, 51, 51, 1);
  transform: translateY(-2px);
}

.completion-options {
  display: flex;
  gap: 15px;
  margin-top: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.option-btn {
  padding: 15px 25px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  color: white;
}

.qa-btn {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.qa-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.next-btn {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* 能量条 */
.energy-bar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  z-index: 1000;
}

.energy-bar {
  height: 100%;
  transition: all 0.1s linear;
  position: relative;
  overflow: hidden;
}

.energy-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.energy-label {
  position: absolute;
  right: 20px;
  color: white;
  font-weight: 600;
  font-size: 18px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

/* 记录屏幕 */
.record-screen {
  max-width: 1000px;
  margin: 60px auto 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.record-screen h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
}

.records-table {
  margin-bottom: 40px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr 1.5fr;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 16px;
  font-weight: 600;
  font-size: 14px;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr 1.5fr;
  padding: 16px;
  border-bottom: 1px solid #eee;
  align-items: center;
  transition: all 0.3s ease;
}

.table-row:hover {
  background: #f5f5f5;
}

.table-row.precise {
  background: #f0f9ff;
  border-left: 4px solid #22C55E;
}

.col-group {
  font-weight: 600;
  color: #333;
}

.col-time {
  text-align: center;
  color: #666;
  font-family: 'Courier New', monospace;
}

.precise-badge {
  background: #22C55E;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.best-group {
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #fff5e1, #ffe8cc);
  border-radius: 12px;
  border: 2px solid #FFD700;
}

.best-group h3 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-size: 20px;
}

.best-candidates {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.candidate {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.candidate:hover {
  transform: translateY(-4px);
}

.candidate.gold {
  border: 3px solid #FFD700;
  background: linear-gradient(135deg, #fffacd, #fff8dc);
}

.candidate.silver {
  border: 2px solid #C0C0C0;
  background: linear-gradient(135deg, #f5f5f5, #efefef);
}

.candidate.bronze {
  border: 2px solid #CD7F32;
  background: linear-gradient(135deg, #fff8f0, #ffe4d4);
}

.medal {
  font-size: 36px;
  margin-bottom: 10px;
}

.name {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.error {
  color: #666;
  font-size: 12px;
}

.record-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  color: white;
}

.action-btn:first-child {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.action-btn:last-child {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .timer-display {
    font-size: 60px;
  }

  .button-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .col-time:nth-child(n+3) {
    display: none;
  }

  .best-candidates {
    grid-template-columns: 1fr;
  }
}

/* 深色模式樣式 */
:deep(.dark-mode) .timer-container {
  color: #e2e8f0;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}

:deep(.dark-mode) .back-btn,
:deep(.dark-mode) .theme-toggle {
  background: #1e293b;
  color: #cbd5e1;
  border-color: #334155;
}

:deep(.dark-mode) .back-btn:hover,
:deep(.dark-mode) .theme-toggle:hover {
  background: #334155;
}

:deep(.dark-mode) .setup-screen,
:deep(.dark-mode) .timing-screen,
:deep(.dark-mode) .qa-screen,
:deep(.dark-mode) .record-screen,
:deep(.dark-mode) .completion-modal {
  background: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
}

:deep(.dark-mode) .input-field,
:deep(.dark-mode) .time-input {
  background: #334155;
  color: #e2e8f0;
  border-color: #475569;
}

:deep(.dark-mode) .start-btn,
:deep(.dark-mode) .pause-btn,
:deep(.dark-mode) .reset-btn,
:deep(.dark-mode) .qa-btn,
:deep(.dark-mode) .record-btn,
:deep(.dark-mode) .modal-btn {
  background: #334155;
  color: #e2e8f0;
  border-color: #475569;
}

:deep(.dark-mode) .start-btn:hover,
:deep(.dark-mode) .pause-btn:hover,
:deep(.dark-mode) .reset-btn:hover,
:deep(.dark-mode) .qa-btn:hover,
:deep(.dark-mode) .record-btn:hover,
:deep(.dark-mode) .modal-btn:hover {
  background: #475569;
}

:deep(.dark-mode) .time-display,
:deep(.dark-mode) .group-name-display {
  color: #f1f5f9;
}

:deep(.dark-mode) .record-table {
  background: #1e293b;
  border-color: #334155;
}

:deep(.dark-mode) .record-table th,
:deep(.dark-mode) .record-table td {
  border-color: #475569;
  color: #e2e8f0;
}
</style>