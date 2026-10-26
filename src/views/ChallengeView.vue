<script setup lang="ts">
import { computed, ref } from 'vue'
import { randomBatch } from '@/core/generate'
import { judge } from '@/core/evaluate'
import ExerciseCard from '@/components/ExerciseCard.vue'
import type { Exercise } from '@/types'

const questions = ref<Exercise[]>(randomBatch(10, Date.now()))
const idx = ref(0)
const solved = ref<string[]>([])
const finished = ref(false)
const streak = ref(0)
const bestStreak = ref(0)

const current = computed(() => questions.value[idx.value])
const pct = computed(() => Math.round((solved.value.length / questions.value.length) * 100))

function onSolved(id: string) {
  if (!solved.value.includes(id)) solved.value = [...solved.value, id]
  streak.value++
  bestStreak.value = Math.max(bestStreak.value, streak.value)
}

function onFailed() {
  streak.value = 0
}

function next() {
  if (idx.value < questions.value.length - 1) idx.value++
  else finished.value = true
}

function restart() {
  questions.value = randomBatch(10, Date.now())
  idx.value = 0
  solved.value = []
  finished.value = false
  streak.value = 0
  bestStreak.value = 0
}

/** 结果页：按知识点统计本轮错题 */
const wrongKnowledge = computed(() => {
  const map = new Map<string, number>()
  for (const q of questions.value) {
    if (solved.value.includes(q.id)) continue
    for (const k of q.knowledge) map.set(k, (map.get(k) || 0) + 1)
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
})

const answeredCount = computed(() => solved.value.length)
</script>

<template>
  <div class="challenge">
    <div class="head">
      <div>
        <h1>随机挑战</h1>
        <p class="tiny muted">
          每轮 10 题，知识点固定、数据每次都变 —— 你能过，说明你真的会写，而不是记住了答案。
        </p>
      </div>
      <el-button size="small" plain @click="restart">换一批题</el-button>
    </div>

    <div v-if="!finished" class="wrap">
      <div class="dots">
        <span
          v-for="(q, i) in questions"
          :key="q.id"
          class="dot"
          :class="{ on: i === idx, done: solved.includes(q.id), cur: i === idx }"
          :title="`第 ${i + 1} 题`"
        />
        <span class="spacer" />
        <span class="tiny muted">已通过 {{ answeredCount }}/10 · 连击 {{ streak }}（最高 {{ bestStreak }}）</span>
      </div>

      <ExerciseCard
        :exercise="current"
        lesson-id="challenge"
        @solved="onSolved(current.id)"
        @failed="onFailed"
      >
        <template #footer>
          <el-button size="small" type="primary" plain @click="next">
            {{ idx === questions.length - 1 ? '本轮结束' : '下一题' }}
          </el-button>
        </template>
      </ExerciseCard>

      <div class="bar">
        <span :style="{ width: pct + '%' }" />
      </div>
    </div>

    <div v-else class="result panel">
      <div class="r-icon">{{ answeredCount >= 8 ? '🎯' : answeredCount >= 5 ? '💪' : '🌱' }}</div>
      <h2>本轮 {{ answeredCount }} / 10</h2>
      <p class="tiny muted">
        {{
          answeredCount >= 8
            ? '很稳。可以试试去实战案例里挑战更复杂的组合。'
            : answeredCount >= 5
              ? '基础在成型。错题已经进错题本，回去重练一遍再开一轮。'
              : '别急，先回到对应小节，把"例 1"在实验室里亲手改一遍。'
        }}
      </p>

      <div v-if="wrongKnowledge.length" class="weak">
        <div class="wk-title tiny">本轮薄弱知识点</div>
        <div class="wk-list">
          <span v-for="[k, c] in wrongKnowledge" :key="k" class="tag tag-red">{{ k }} ×{{ c }}</span>
        </div>
      </div>

      <div class="r-actions">
        <el-button type="primary" @click="restart">再来一轮</el-button>
        <el-button @click="$router.push('/mistakes')">去错题本</el-button>
        <el-button @click="$router.push('/learn')">回到课程</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.challenge {
  max-width: 880px;
  margin: 0 auto;
  padding: 20px 20px 60px;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.head h1 {
  font-size: 20px;
  margin: 0 0 3px;
}
.dots {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.dot {
  width: 18px;
  height: 5px;
  border-radius: 3px;
  background: var(--border);
}
.dot.done {
  background: var(--success);
}
.dot.cur {
  background: var(--accent);
  width: 26px;
}
.spacer {
  flex: 1;
}
.bar {
  height: 4px;
  background: var(--bg-sunken);
  border-radius: 2px;
  margin-top: 12px;
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #2f6feb, #8250df);
  transition: width 0.3s ease;
}
.result {
  padding: 34px 24px;
  text-align: center;
}
.r-icon {
  font-size: 30px;
}
.result h2 {
  margin: 6px 0 4px;
  font-size: 22px;
}
.weak {
  margin: 18px auto 0;
  max-width: 520px;
  border-top: 1px dashed var(--border);
  padding-top: 12px;
}
.wk-title {
  color: var(--text-3);
  font-weight: 700;
  margin-bottom: 6px;
}
.wk-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}
.r-actions {
  margin-top: 20px;
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
