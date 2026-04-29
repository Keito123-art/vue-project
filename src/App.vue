<script setup>
import { ref, provide } from 'vue'

// 1. 定義狀態：是否為深色模式 (預設 false)
const isDarkMode = ref(false)

// 2. 定義切換函式
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
}

// 3. "廣播" 這個狀態和函式給所有子頁面 (RollCall, Quiz 等)
provide('isDarkMode', isDarkMode)
provide('toggleTheme', toggleTheme)
</script>

<template>
  <!-- 4. 根據狀態套用 class -->
  <div :class="isDarkMode ? 'dark-mode' : 'light-mode'" class="app-container">
    <router-view />
  </div>
</template>

<style>
/* 移除默認邊距 */
body { margin: 0; padding: 0; }

/* 容器設定 */
.app-container {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
}

/* --- 深色模式背景 --- */
.dark-mode {
  background-color: #0f172a;
  color: #ffffff;
}
.dark-mode::before, .dark-mode::after {
  content: ''; position: absolute; border-radius: 50%; filter: blur(80px); z-index: -1;
  opacity: 0.6; animation: float 10s infinite alternate;
}
.dark-mode::before { top: -10%; left: -10%; width: 50vw; height: 50vw; background: #4f46e5; }
.dark-mode::after { bottom: -10%; right: -10%; width: 40vw; height: 40vw; background: #10b981; animation-delay: -5s; }

/* --- 淺色模式背景 --- */
.light-mode {
  background-color: #fdf2f8;
  color: #1e293b;
}
.light-mode::before, .light-mode::after {
  content: ''; position: absolute; border-radius: 50%; filter: blur(80px); z-index: -1;
  opacity: 0.5; animation: float 12s infinite alternate;
}
.light-mode::before { top: -5%; left: -5%; width: 60vw; height: 60vw; background: #f472b6; }
.light-mode::after { bottom: -10%; right: -5%; width: 40vw; height: 40vw; background: #fb923c; animation-delay: -6s; }

@keyframes float {
  0% { transform: translate(0, 0); }
  100% { transform: translate(30px, 50px); }
}
</style>