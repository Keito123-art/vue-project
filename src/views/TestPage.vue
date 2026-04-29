<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { useRouter } from 'vue-router'

// --- 路由與音效設定 ---
const router = useRouter()

// 1. 音效初始化 (預設瀏覽器會阻止自動播放，但點擊後通常會解鎖)
const hoverSound = new Audio('/hover.mp3')
const clickSound = new Audio('/click.mp3')
// 調整音量避免太吵
hoverSound.volume = 0.5
clickSound.volume = 0.6

// 2. 音效播放函式
const playHoverSound = () => {
hoverSound.currentTime = 0
hoverSound.play().catch(() => {}) // 捕獲錯誤避免報錯
}

const playClickSound = () => {
clickSound.currentTime = 0
clickSound.play().catch(() => {})
}

// 3. 路由跳轉 (整合音效)
const navigateTo = (path) => {
playClickSound()
// 稍微延遲一點點跳轉，確保音效有機會播放 (可選，視網路速度而定)
setTimeout(() => {
router.push(path)
}, 100)
}

// --- 時間與日期狀態 ---
const currentTime = ref('')
const currentDate = ref('')
let timer = null

// --- 日夜模式切換 ---
const isDarkMode = inject('isDarkMode')
const toggleTheme = inject('toggleTheme')

// --- 更新時間邏輯 ---
const updateTime = () => {
const now = new Date()

// 格式化時間 (HH:MM:SS)
const hours = String(now.getHours()).padStart(2, '0')
const minutes = String(now.getMinutes()).padStart(2, '0')
const seconds = String(now.getSeconds()).padStart(2, '0')
currentTime.value = `${hours}:${minutes}:${seconds}`

// 格式化日期 (YYYY年M月D日 星期X)
const year = now.getFullYear()
const month = now.getMonth() + 1
const date = now.getDate()
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const day = weekDays[now.getDay()]
currentDate.value = `${year}年${month}月${date}日 (星期${day})`
}

// --- 生命週期掛鉤 ---
onMounted(() => {
updateTime()
timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
if (timer) clearInterval(timer)
})
</script>

<template>
<div :class="['home-container', isDarkMode ? 'dark-mode' : 'light-mode']">
<!-- 切換按鈕 -->
<button class="theme-toggle" @click="toggleTheme" @mouseover="playHoverSound">
{{ isDarkMode ? '☀️ 淺色模式' : '🌙 深色模式' }}
</button>

<div class="main-content">
<!-- 左側時間區 -->
<div class="left-section">
<div class="logo-area">
<div class="triangle-logo"></div>
<h1>小課堂</h1>
</div>

<!-- 時間面板：增加了半透明背景框 -->
<div class="time-panel">
<div class="time-display">{{ currentTime }}</div>
<div class="date-display">{{ currentDate }}</div>
</div>
</div>

<!-- 右側按鈕區 -->
<div class="right-section">
<div class="button-grid">
<div
class="card-btn"
@click="navigateTo('/rollcall'); playClickSound()"
@mouseover="playHoverSound"
>
<div class="icon">🎲</div>
<div class="text-group">
<span class="title">抽籤機</span>
<span class="subtitle">隨機抽籤決定分組</span>
</div>
</div>

<div
class="card-btn"
@click="navigateTo('/timer')"
@mouseover="playHoverSound"
>
<div class="icon">⏱️</div>
<div class="text-group">
<span class="title">計時器</span>
<span class="subtitle">管理課堂活動時間</span>
</div>
</div>

<div
class="card-btn"
@click="navigateTo('/scoreboard')"
@mouseover="playHoverSound"
>
<div class="icon">📊</div>
<div class="text-group">
<span class="title">計分板</span>
<span class="subtitle">即時更新小組表現</span>
</div>
</div>

<div
class="card-btn"
@click="navigateTo('/quiz')"
@mouseover="playHoverSound"
>
<div class="icon">📝</div>
<div class="text-group">
<span class="title">數位測驗卷</span>
<span class="subtitle">線上作答即時回饋</span>
</div>
</div>
</div>
</div>
</div>
</div>
</template>

<style scoped>
/* --- 基礎佈局 --- */
.home-container {
min-height: 100vh;
width: 100%;
position: relative;
overflow: hidden;
font-family: 'Noto Sans TC', sans-serif;
transition: background-color 0.5s ease, color 0.5s ease;
display: flex;
justify-content: center;
align-items: center;
padding: 20px;
box-sizing: border-box;
}

/* --- 背景與模糊光暈效果 --- */

/* 深色模式：深藍底 + 紫/綠光暈 */
.dark-mode {
background-color: #0f172a;
color: #ffffff;
}

.dark-mode::before,
.dark-mode::after {
content: '';
position: absolute;
border-radius: 50%;
filter: blur(80px);
opacity: 0.6;
z-index: 0;
animation: float 10s infinite alternate;
}

.dark-mode::before {
top: -10%;
left: -10%;
width: 50vw;
height: 50vw;
background: #4f46e5;
}

.dark-mode::after {
bottom: -10%;
right: -10%;
width: 40vw;
height: 40vw;
background: #10b981;
animation-delay: -5s;
}

/* 淺色模式：米白底 + 粉紅/橘色光暈 */
.light-mode {
background-color: #fdf2f8;
color: #1e293b;
}

.light-mode::before,
.light-mode::after {
content: '';
position: absolute;
border-radius: 50%;
filter: blur(80px);
opacity: 0.5;
z-index: 0;
animation: float 12s infinite alternate;
}

.light-mode::before {
top: -5%;
left: -5%;
width: 60vw;
height: 60vw;
background: #f472b6;
}

.light-mode::after {
bottom: -10%;
right: -5%;
width: 40vw;
height: 40vw;
background: #fb923c;
animation-delay: -6s;
}

@keyframes float {
0% {
transform: translate(0, 0);
}
100% {
transform: translate(30px, 50px);
}
}

/* --- 內容容器 --- */
.main-content {
position: relative;
z-index: 10;
width: 100%;
max-width: 1200px;
display: flex;
justify-content: space-between;
align-items: center;
padding: 20px;
}

/* --- 左側區域 --- */
.left-section {
display: flex;
flex-direction: column;
justify-content: center;
flex: 1;
}

.logo-area {
display: flex;
align-items: center;
margin-bottom: 30px;
}

.triangle-logo {
width: 0;
height: 0;
border-left: 20px solid transparent;
border-right: 20px solid transparent;
border-bottom: 35px solid #f472b6;
margin-right: 15px;
animation: wiggle 3s infinite ease-in-out;
}

@keyframes wiggle {
0%,
100% {
transform: rotate(-10deg);
}
50% {
transform: rotate(10deg);
}
}

.logo-area h1 {
font-size: 2.5rem;
font-weight: 800;
margin: 0;
letter-spacing: 2px;
}

/* --- 時間面板 (新增半透明框樣式) --- */
.time-panel {
display: flex;
flex-direction: column;
align-items: flex-start;
padding: 25px 40px; /* 內距 */
border-radius: 30px; /* 圓角 */
width: 100%;
/* 玻璃擬態背景 */
background: rgba(0, 0, 0, 0.25);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px); /* Safari 支援 */
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
border: 1px solid rgba(255, 255, 255, 0.18);
}

/* 淺色模式下的時間面板調整 */
.light-mode .time-panel {
background: rgba(255, 255, 255, 0.45);
border: 1px solid rgba(255, 255, 255, 0.5);
box-shadow: 0 8px 32px 0 rgba(244, 114, 182, 0.15);
}

/* 巨大的時間 */
.time-display {
font-size: 6rem; /* 超級大字 */
font-weight: 900;
line-height: 1;
margin-bottom: 10px;
color: #38bdf8; /* 天藍色 */
text-shadow: 0 0 20px rgba(56, 189, 248, 0.6);
letter-spacing: 2px;
}

.light-mode .time-display {
color: #1e40af; /* 深藍色 */
text-shadow: none;
}

/* 較小的日期 */
.date-display {
font-size: 1.8rem;
font-weight: 600;
opacity: 0.95;
color: #ffffff;
letter-spacing: 1px;
}

.light-mode .date-display {
color: #334155;
}

/* --- 右側區域 (按鈕) --- */
.right-section {
flex: 1;
display: flex;
justify-content: flex-end;
}

.button-grid {
display: grid;
grid-template-columns: 1fr;
gap: 20px;
width: 320px;
}

.card-btn {
display: flex;
align-items: center;
padding: 20px;
border-radius: 20px;
cursor: pointer;
transition: all 0.3s ease;
background: rgba(255, 255, 255, 0.1);
border: 1px solid rgba(255, 255, 255, 0.2);
backdrop-filter: blur(10px);
overflow: hidden;
position: relative;
}

.light-mode .card-btn {
background: rgba(255, 255, 255, 0.6);
border: 1px solid rgba(255, 255, 255, 0.5);
box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.card-btn:hover {
transform: translateY(-5px) scale(1.02);
background: rgba(255, 255, 255, 0.25);
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.light-mode .card-btn:hover {
background: rgba(255, 255, 255, 0.9);
box-shadow: 0 10px 30px rgba(244, 114, 182, 0.3);
}

.icon {
font-size: 2rem;
margin-right: 15px;
background: rgba(255, 255, 255, 0.2);
width: 60px;
height: 60px;
border-radius: 15px;
display: flex;
justify-content: center;
align-items: center;
flex-shrink: 0;
}

.light-mode .icon {
background: rgba(255, 255, 255, 0.5);
}

.text-group {
display: flex;
flex-direction: column;
}

.title {
font-size: 1.25rem;
font-weight: 700;
color: #fff;
}

.light-mode .title {
color: #1e293b;
}

.subtitle {
font-size: 0.85rem;
margin-top: 5px;
opacity: 0.8;
color: #fff;
}

.light-mode .subtitle {
color: #475569;
}

/* --- 日夜切換按鈕 --- */
.theme-toggle {
position: absolute;
top: 30px;
right: 30px;
z-index: 20;
padding: 10px 20px;
border-radius: 30px;
border: none;
font-weight: bold;
cursor: pointer;
background: rgba(255, 255, 255, 0.2);
color: white;
backdrop-filter: blur(5px);
transition: transform 0.2s;
font-size: 0.9rem;
}

.light-mode .theme-toggle {
background: rgba(0, 0, 0, 0.05);
color: #333;
border: 1px solid rgba(0, 0, 0, 0.1);
}

.theme-toggle:hover {
transform: scale(1.1);
}

/* --- 響應式設計 --- */
@media (max-width: 900px) {
.main-content {
flex-direction: column;
text-align: center;
justify-content: center;
}

.left-section {
align-items: center;
margin-bottom: 50px;
}

.time-panel {
align-items: center;
}

.right-section {
justify-content: center;
width: 100%;
}

.button-grid {
width: 100%;
max-width: 400px;
}

.time-display {
font-size: 4rem;
text-align: center;
}

.date-display {
font-size: 1.5rem;
text-align: center;
}
}
</style>