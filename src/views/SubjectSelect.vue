<script setup>
import { inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isDarkMode = inject('isDarkMode')
const toggleTheme = inject('toggleTheme')

const selectSubject = (subject) => {
  router.push({ name: 'Quiz', params: { subject } })
}
</script>

<template>
  <section class="subject-select">
    <div class="select-header">
      <button class="back-home" @click="router.push('/')">← 返回主頁</button>
      <div>
        <h1>選擇科目</h1>
        <p>請選擇您要練習或測驗的科目</p>
      </div>
      <button class="theme-toggle" @click="toggleTheme">
        {{ isDarkMode ? '☀️ 淺色' : '🌙 深色' }}
      </button>
    </div>

    <div class="subject-grid">
      <button class="subject-card" @click="selectSubject('chinese')">
        <div class="subject-icon">📖</div>
        <h3>國文科</h3>
        <p>文學、語文、閱讀理解</p>
      </button>

      <button class="subject-card" @click="selectSubject('social')">
        <div class="subject-icon">🌍</div>
        <h3>社會科</h3>
        <p>歷史、地理、公民</p>
      </button>

      <button class="subject-card" @click="selectSubject('science')">
        <div class="subject-icon">🔬</div>
        <h3>自然科</h3>
        <p>生物、物理、化學</p>
      </button>
    </div>
  </section>
</template>

<style scoped>
.subject-select {
  min-height: 100vh;
  padding: 28px;
  color: #ffffff;
  font-family: 'Noto Sans TC', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}

.select-header {
  text-align: center;
  margin-bottom: 40px;
}

.select-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
}

.select-header p {
  color: #a0a0a0;
  font-size: 1.1rem;
}

.back-home {
  position: absolute;
  top: 28px;
  left: 28px;
  background: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 10px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.back-home:hover {
  background: rgba(255, 255, 255, 0.1);
}

.subject-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 900px;
  width: 100%;
}

.subject-card {
  background: #2a2a2a;
  border: 1px solid #404040;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.subject-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: #60a5fa;
}

.subject-icon {
  font-size: 3rem;
  margin-bottom: 8px;
}

.subject-card h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.subject-card p {
  margin: 0;
  color: #a0a0a0;
  line-height: 1.5;
}

@media (max-width: 720px) {
  .subject-grid {
    grid-template-columns: 1fr;
  }

  .select-header h1 {
    font-size: 2rem;
  }
}

/* 深色模式樣式 */
:deep(.dark-mode) .subject-select {
  color: #e2e8f0;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}

:deep(.dark-mode) .select-header h1 {
  color: #f1f5f9;
}

:deep(.dark-mode) .select-header p {
  color: #94a3b8;
}

:deep(.dark-mode) .back-home {
  background: transparent;
  color: #e2e8f0;
  border-color: rgba(226, 232, 240, 0.2);
}

:deep(.dark-mode) .theme-toggle {
  background: #1e293b;
  color: #cbd5e1;
  border-color: #334155;
}

:deep(.dark-mode) .theme-toggle:hover {
  background: #334155;
}

:deep(.dark-mode) .subject-card {
  background: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
}

:deep(.dark-mode) .subject-card h3 {
  color: #f1f5f9;
}

:deep(.dark-mode) .subject-card p {
  color: #cbd5e1;
}
</style>