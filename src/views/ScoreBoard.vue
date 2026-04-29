<script setup>
import { ref, computed, onMounted, watch, nextTick, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isDarkMode = inject('isDarkMode')
const toggleTheme = inject('toggleTheme')

// 基础状态
const teams = ref([])
const showSetupModal = ref(true)
const newTeamName = ref('')
const viewMode = ref('cards') // cards | chart
const floatingNumbers = ref([])
const teamInput = ref(null)

// 音效
const celebrateSound = new Audio('/celebrate.mp3')
const hoverSound = new Audio('/hover.mp3')
celebrateSound.volume = 0.6
hoverSound.volume = 0.4

// 组别颜色
const teamColors = [
  { name: 'red', bg: '#EF4444', light: '#FEE2E2', dark: '#DC2626' },
  { name: 'orange', bg: '#F97316', light: '#FFEDD5', dark: '#EA580C' },
  { name: 'yellow', bg: '#EAB308', light: '#FEF3C7', dark: '#CA8A04' },
  { name: 'green', bg: '#22C55E', light: '#DCFCE7', dark: '#16A34A' },
  { name: 'blue', bg: '#3B82F6', light: '#DBEAFE', dark: '#2563EB' },
  { name: 'purple', bg: '#A855F7', light: '#EDE9FE', dark: '#9333EA' }
]

// 生成随机颜色
const getRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 自定义加分
const customPoints = ref(10)
const showCustomModal = ref(false)

// 新比赛选项
const showNewGameModal = ref(false)

// 数据持久化
const STORAGE_KEY = 'scoreboard-teams'

const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams.value))
}

const loadFromStorage = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    teams.value = JSON.parse(saved)
    showSetupModal.value = false
  }
}

// 初始化
onMounted(() => {
  loadFromStorage()
})

// 监听数据变化并保存
watch(teams, () => {
  saveToStorage()
}, { deep: true })

// 监听设置模态框显示状态
watch(showSetupModal, (newValue) => {
  if (newValue) {
    nextTick(() => {
      if (teamInput.value) {
        teamInput.value.focus()
      }
    })
  }
})

// 添加小组
const addTeam = () => {
  if (newTeamName.value.trim()) {
    const colorIndex = teams.value.length % teamColors.length
    teams.value.push({
      id: Date.now(),
      name: newTeamName.value.trim(),
      score: 0,
      color: teamColors[colorIndex],
      position: teams.value.length
    })
    newTeamName.value = ''
    // 聚焦回输入框
    nextTick(() => {
      if (teamInput.value) {
        teamInput.value.focus()
      }
    })
  }
}

// 删除小组
const removeTeam = (teamId) => {
  const index = teams.value.findIndex(t => t.id === teamId)
  if (index > -1) {
    teams.value.splice(index, 1)
    // 重新分配颜色
    teams.value.forEach((team, idx) => {
      team.color = teamColors[idx % teamColors.length]
    })
  }
}

// 播放音效
const playSound = (isPositive) => {
  if (isPositive) {
    celebrateSound.currentTime = 0
    celebrateSound.play().catch(() => {})
  } else {
    hoverSound.currentTime = 0
    hoverSound.play().catch(() => {})
  }
}

// 创建飘浮数字动画
const createFloatingNumber = (points, x, y, isPositive) => {
  const id = Date.now() + Math.random()
  floatingNumbers.value.push({
    id,
    text: (isPositive ? '+' : '') + points,
    x,
    y,
    opacity: 1,
    isPositive
  })

  // 动画结束后移除
  setTimeout(() => {
    const index = floatingNumbers.value.findIndex(f => f.id === id)
    if (index > -1) {
      floatingNumbers.value.splice(index, 1)
    }
  }, 1000)
}

// 加分函数
const addPoints = (teamId, points, event = null) => {
  const team = teams.value.find(t => t.id === teamId)
  if (team) {
    const oldScore = team.score
    team.score += points

    // 播放音效
    playSound(points > 0)

    // 创建飘浮数字动画
    if (event) {
      const rect = event.target.getBoundingClientRect()
      createFloatingNumber(points, rect.left + rect.width / 2, rect.top, points > 0)
    }

    // 立即排序，不使用nextTick延迟
    sortTeams()
  }
}

// 减分函数
const subtractPoints = (teamId, points, event = null) => {
  addPoints(teamId, -points, event)
}

// 自定义加分
const applyCustomPoints = () => {
  if (customPoints.value !== 0) {
    addPointsToAll(customPoints.value)
    showCustomModal.value = false
    customPoints.value = 10
  }
}

// 全班加分
const addPointsToAll = (points) => {
  teams.value.forEach(team => {
    team.score += points
  })
  playSound(points > 0)
  sortTeams()
}

// 排序团队（带动画）
const sortTeams = () => {
  teams.value.sort((a, b) => b.score - a.score)
  teams.value.forEach((team, index) => {
    team.position = index
  })
}

// 计算属性
const sortedTeams = computed(() => {
  return [...teams.value].sort((a, b) => b.score - a.score)
})

const maxScore = computed(() => {
  return Math.max(...teams.value.map(t => t.score), 0)
})

const chartHeight = computed(() => {
  return maxScore.value > 0 ? 300 : 100
})

// 重置所有分数
const resetAllScores = () => {
  if (confirm('確定要重置所有分數嗎？')) {
    teams.value.forEach(team => {
      team.score = 0
    })
    sortTeams()
  }
}

// 开始新比赛
const startNewGame = () => {
  showNewGameModal.value = true
}

// 只重置分数
const resetScoresOnly = () => {
  teams.value.forEach(team => {
    team.score = 0
  })
  sortTeams()
  showNewGameModal.value = false
}

// 重新分組（回到设置界面）
const regroupTeams = () => {
  // 清除所有数据
  teams.value = []
  showSetupModal.value = true
  showNewGameModal.value = false
  // 清空localStorage
  localStorage.removeItem(STORAGE_KEY)
}

// 返回首页
const goBack = () => {
  router.push('/')
}

// 键盘事件
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    addTeam()
  }
}
</script>

<template>
  <div class="scoreboard-container">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">← 返回首頁</button>

    <!-- 切換按鈕 -->
    <button class="theme-toggle" @click="toggleTheme">
      {{ isDarkMode ? '☀️ 淺色' : '🌙 深色' }}
    </button>

    <!-- 设置模态框 -->
    <div v-if="showSetupModal" class="modal-overlay" @click="showSetupModal = false">
      <div class="setup-modal" @click.stop>
        <h2>🏆 設定競賽小組</h2>
        <p class="setup-desc">輸入小組名稱並按 Enter 新增</p>

        <div class="team-input-section">
          <input
            v-model="newTeamName"
            type="text"
            placeholder="輸入小組名稱..."
            class="team-input"
            @keypress="handleKeyPress"
            ref="teamInput"
          >
          <button @click="addTeam" class="add-btn">新增小組</button>
        </div>

        <div v-if="teams.length > 0" class="teams-preview">
          <h3>已新增小組：</h3>
          <div class="preview-list">
            <div
              v-for="team in teams"
              :key="team.id"
              class="preview-item"
              :style="{ backgroundColor: team.color.light }"
            >
              <span class="preview-name">{{ team.name }}</span>
              <button @click="removeTeam(team.id)" class="remove-btn">✕</button>
            </div>
          </div>
        </div>

        <div v-if="teams.length >= 2" class="start-btn-container">
          <button @click="showSetupModal = false" class="start-competition-btn">
            🚀 開始競賽
          </button>
        </div>
      </div>
    </div>

    <!-- 主界面 -->
    <div v-else class="main-content">
      <!-- 标题栏 -->
      <div class="header">
        <h1>🏆 小組競賽記分板</h1>
        <div class="header-controls">
          <button @click="viewMode = viewMode === 'cards' ? 'chart' : 'cards'" class="mode-toggle">
            {{ viewMode === 'cards' ? '📊 圖表模式' : '🃏 卡片模式' }}
          </button>
          <button @click="resetAllScores" class="reset-btn">🔄 重置分數</button>
          <button @click="startNewGame" class="new-game-btn">🎯 新比賽</button>
        </div>
      </div>

      <!-- 全班操作区 -->
      <div class="global-controls">
        <button @click="addPointsToAll(1)" class="global-btn add-all">➕ 全班 +1</button>
        <button @click="addPointsToAll(5)" class="global-btn add-all">➕ 全班 +5</button>
        <button @click="addPointsToAll(-1)" class="global-btn subtract-all">➖ 全班 -1</button>
        <button @click="showCustomModal = true" class="global-btn custom">🎯 自訂加分</button>
      </div>

      <!-- 卡片模式 -->
      <div v-if="viewMode === 'cards'" class="cards-view">
        <div class="teams-grid">
          <div
            v-for="(team, index) in sortedTeams"
            :key="team.id"
            class="team-card"
            :class="{ 'leader': index === 0 }"
            :style="{ '--team-color': team.color.bg, '--team-light': team.color.light }"
          >
            <!-- 冠冕特效 -->
            <div v-if="index === 0" class="crown-effect">👑</div>

            <!-- 小组信息 -->
            <div class="team-header">
              <div class="team-name">{{ team.name }}</div>
              <div class="team-rank">#{{ index + 1 }}</div>
            </div>

            <!-- 分数显示 -->
            <div class="score-display">
              <span class="score-number">{{ team.score }}</span>
              <span class="score-label">分</span>
            </div>

            <!-- 操作按钮 -->
            <div class="score-controls">
              <button @click="addPoints(team.id, 1, $event)" class="score-btn add-btn">+1</button>
              <button @click="addPoints(team.id, 5, $event)" class="score-btn add-btn">+5</button>
              <button @click="subtractPoints(team.id, 1, $event)" class="score-btn subtract-btn">-1</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表模式 -->
      <div v-else class="chart-view">
        <div class="chart-container">
          <div class="chart-bars">
            <div
              v-for="team in sortedTeams"
              :key="team.id"
              class="chart-bar-wrapper"
            >
              <div class="bar-info">
                <span class="bar-name">{{ team.name }}</span>
                <span class="bar-score">{{ team.score }}</span>
              </div>
              <div class="bar-container">
                <div
                  class="bar"
                  :style="{
                    height: maxScore > 0 ? (team.score / maxScore * 100) + '%' : '20px',
                    backgroundColor: getRandomColor()
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义加分模态框 -->
    <div v-if="showCustomModal" class="modal-overlay" @click="showCustomModal = false">
      <div class="custom-modal" @click.stop>
        <h3>🎯 自訂加分</h3>
        <div class="custom-input-group">
          <input
            v-model.number="customPoints"
            type="number"
            class="custom-input"
            placeholder="輸入分數"
          >
          <span class="points-label">分</span>
        </div>
        <div class="custom-actions">
          <button @click="showCustomModal = false" class="cancel-btn">取消</button>
          <button @click="applyCustomPoints" class="apply-btn">套用至所有小組</button>
        </div>
      </div>
    </div>

    <!-- 新比赛选项模态框 -->
    <div v-if="showNewGameModal" class="modal-overlay" @click="showNewGameModal = false">
      <div class="new-game-modal" @click.stop>
        <h3>🎯 新比賽選項</h3>
        <p class="modal-description">選擇您想要的動作：</p>
        <div class="new-game-options">
          <button @click="resetScoresOnly" class="option-btn reset-only">
            🔄 只重置分數<br>
            <small>保留組別，歸零分數</small>
          </button>
          <button @click="regroupTeams" class="option-btn regroup">
            👥 重新分組<br>
            <small>回到組別設定</small>
          </button>
        </div>
        <div class="modal-actions">
          <button @click="showNewGameModal = false" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>

    <!-- 飘浮数字动画 -->
    <div
      v-for="floating in floatingNumbers"
      :key="floating.id"
      class="floating-number"
      :class="{ 'positive': floating.isPositive, 'negative': !floating.isPositive }"
      :style="{ left: floating.x + 'px', top: floating.y + 'px', opacity: floating.opacity }"
    >
      {{ floating.text }}
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.scoreboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow-x: hidden;
  color: #1f2937;
  text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  z-index: 1000;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.setup-modal, .custom-modal {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.setup-modal h2 {
  color: #1e293b;
  margin-bottom: 10px;
  font-size: 24px;
}

.setup-desc {
  color: #64748b;
  margin-bottom: 20px;
}

.team-input-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.team-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.team-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.add-btn {
  padding: 12px 20px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 400;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.teams-preview {
  margin-bottom: 20px;
}

.teams-preview h3 {
  color: #374151;
  margin-bottom: 10px;
  font-size: 16px;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.preview-name {
  font-weight: 600;
  color: #374151;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.start-btn-container {
  text-align: center;
}

.start-competition-btn {
  padding: 15px 30px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 400;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.start-competition-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);
}

/* 主界面 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.header h1 {
  color: white;
  font-size: 32px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.header-controls {
  display: flex;
  gap: 10px;
}

.mode-toggle, .reset-btn, .new-game-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 400;
  font-size: 14px;
  transition: all 0.3s ease;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.mode-toggle {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.mode-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.reset-btn {
  background: rgba(239, 68, 68, 0.8);
}

.reset-btn:hover {
  background: rgba(239, 68, 68, 1);
}

.new-game-btn {
  background: rgba(34, 197, 94, 0.8);
}

.new-game-btn:hover {
  background: rgba(34, 197, 94, 1);
}

/* 全班操作区 */
.global-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.global-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  color: white;
}

.global-btn.add-all {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.global-btn.subtract-all {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.global-btn.custom {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.global-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

/* 卡片模式 */
.cards-view {
  padding: 0 20px;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.team-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 3px solid transparent;
}

.team-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--team-color);
  border-radius: 16px 16px 0 0;
}

.team-card.leader {
  border-color: #ffd700;
  box-shadow: 0 12px 35px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.3);
  animation: leaderGlow 2s ease-in-out infinite alternate;
  transform: scale(1.02);
}

@keyframes leaderGlow {
  from {
    box-shadow: 0 12px 35px rgba(255, 215, 0, 0.3);
  }
  to {
    box-shadow: 0 12px 35px rgba(255, 215, 0, 0.6);
  }
}

.crown-effect {
  position: absolute;
  top: -10px;
  right: 20px;
  font-size: 32px;
  animation: crownFloat 3s ease-in-out infinite;
  z-index: 10;
}

@keyframes crownFloat {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-5px) rotate(5deg); }
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.team-name {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.team-rank {
  background: var(--team-light);
  color: var(--team-color);
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 18px;
}

.score-display {
  text-align: center;
  margin: 24px 0;
}

.score-number {
  font-size: 48px;
  font-weight: 900;
  color: #1e293b;
  display: block;
  line-height: 1;
}

.score-label {
  font-size: 16px;
  color: #64748b;
  font-weight: 600;
}

.score-controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.score-btn {
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 400;
  font-size: 16px;
  transition: all 0.2s ease;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.score-btn.add-btn {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.score-btn.add-btn:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.score-btn.subtract-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.score-btn.subtract-btn:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* 图表模式 */
.chart-view {
  padding: 0 20px;
}

.chart-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 300px;
  gap: 20px;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 120px;
}

.bar-info {
  text-align: center;
  margin-bottom: 10px;
}

.bar-name {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  margin-bottom: 4px;
  display: block;
}

.bar-score {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.bar-container {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px 8px 0 0;
  position: relative;
  overflow: hidden;
}

.bar {
  width: 100%;
  position: absolute;
  bottom: 0;
  border-radius: 8px 8px 0 0;
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 自定义加分模态框 */
.custom-modal {
  max-width: 400px;
  text-align: center;
}

.custom-modal h3 {
  color: #1e293b;
  margin-bottom: 20px;
  font-size: 20px;
}

.custom-input-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.custom-input {
  width: 100px;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 18px;
  text-align: center;
  font-weight: 600;
}

.custom-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.points-label {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.custom-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.cancel-btn {
  padding: 10px 20px;
  background: #e2e8f0;
  color: #64748b;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #cbd5e1;
}

.apply-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* 新比赛模态框 */
.new-game-modal {
  max-width: 450px;
  text-align: center;
}

.new-game-modal h3 {
  color: #1e293b;
  margin-bottom: 10px;
  font-size: 24px;
}

.modal-description {
  color: #64748b;
  margin-bottom: 25px;
  font-size: 16px;
}

.new-game-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.option-btn {
  padding: 20px 15px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.option-btn small {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.8;
}

.option-btn.reset-only {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.option-btn.reset-only:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.option-btn.regroup {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.option-btn.regroup:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

.modal-actions {
  display: flex;
  justify-content: center;
}

/* 飘浮数字动画 */
.floating-number {
  position: fixed;
  pointer-events: none;
  font-size: 24px;
  font-weight: 900;
  z-index: 3000;
  animation: floatUp 1s ease-out forwards;
}

.floating-number.positive {
  color: #22c55e;
  text-shadow: 0 2px 10px rgba(34, 197, 94, 0.5);
}

.floating-number.negative {
  color: #ef4444;
  text-shadow: 0 2px 10px rgba(239, 68, 68, 0.5);
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) scale(1.2);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .teams-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .header h1 {
    text-align: center;
    margin-bottom: 20px;
  }

  .header-controls {
    justify-content: center;
  }

  .global-controls {
    flex-direction: column;
    align-items: center;
  }

  .score-controls {
    grid-template-columns: 1fr;
  }

  .chart-bars {
    flex-direction: column;
    height: auto;
    gap: 15px;
  }

  .chart-bar-wrapper {
    flex-direction: row;
    align-items: center;
    max-width: none;
  }

  .bar-container {
    height: 200px;
    width: 40px;
    margin-left: 15px;
  }

  .bar {
    width: 100%;
    height: 0;
  }
}

/* 深色模式樣式 */
:deep(.dark-mode) .scoreboard-container {
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

:deep(.dark-mode) .team-card,
:deep(.dark-mode) .setup-modal,
:deep(.dark-mode) .custom-modal,
:deep(.dark-mode) .new-game-modal {
  background: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
}

:deep(.dark-mode) .team-name,
:deep(.dark-mode) .score-display {
  color: #f1f5f9;
}

:deep(.dark-mode) .score-btn,
:deep(.dark-mode) .reset-btn,
:deep(.dark-mode) .setup-btn,
:deep(.dark-mode) .modal-btn,
:deep(.dark-mode) .view-toggle-btn {
  background: #334155;
  color: #e2e8f0;
  border-color: #475569;
}

:deep(.dark-mode) .score-btn:hover,
:deep(.dark-mode) .reset-btn:hover,
:deep(.dark-mode) .setup-btn:hover,
:deep(.dark-mode) .modal-btn:hover,
:deep(.dark-mode) .view-toggle-btn:hover {
  background: #475569;
}

:deep(.dark-mode) .input-field {
  background: #334155;
  color: #e2e8f0;
  border-color: #475569;
}

:deep(.dark-mode) .chart-container {
  background: #1e293b;
  border-color: #334155;
}
</style>