import { createRouter, createWebHistory } from 'vue-router'

// 重点：使用相对路径 ../views/... (两个点代表回到上一层 src 目录)
import Home from '../views/TestPage.vue'
import RollCall from '../views/RollCall.vue'
import ScoreBoard from '../views/ScoreBoard.vue'
import Timer from '../views/Timer.vue'
import SubjectSelect from '../views/SubjectSelect.vue'
import Quiz from '../views/Quiz.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/rollcall', name: 'RollCall', component: RollCall },
  { path: '/scoreboard', name: 'ScoreBoard', component: ScoreBoard },
  { path: '/timer', name: 'Timer', component: Timer },
  { path: '/quiz', name: 'SubjectSelect', component: SubjectSelect },
  { path: '/quiz/:subject', name: 'Quiz', component: Quiz, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router