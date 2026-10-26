<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { exercisesByLevel, levelCounts } from '@/data/curriculum'
import { levelName } from '@/core/generate'
import ExerciseCard from '@/components/ExerciseCard.vue'
import type { Level } from '@/types'

const level = ref<Level | 0>(0)
const index = ref(0)
const solved = ref<string[]>([])
const showHintEmpty = ref(false)

const list = computed(() => exercisesByLevel(level.value))
const current = computed(() => list.value[index.value])
const levels: (Level | 0)[] = [0, 1, 2, 3, 4, 5]

watch(level, () => {
  index.value = 0
  solved.value = []
})

function next() {
  if (index.value < list.value.length - 1) index.value++
  else index.value = 0
}

function prev() {
  if (index.value > 0) index.value--
}

function onSolved(id: string) {
  if (!solved.value.includes(id)) solved.value = [...solved.value, id]
}

const progressPct = computed(() => {
  if (!list.value.length) return 0
  return Math.round((solved.value.length / list.value.length) * 100)
})
</script>

<template>
  <div class="practice">
    <div class="head">
      <div>
        <h1>在线练习</h1>
        <p class="tiny muted">
          共 {{ list.length }} 题。答错不会直接给答案：先诊断、再三级提示、最后才给标准解法。
        </p>
      </div>
      <div class="session">
        <span class="tiny muted">本轮通过</span>
        <span class="mono big">{{ solved.length }}</span>
        <span class="tiny muted">/ {{ list.length }}</span>
      </div>
    </div>

    <div class="body">
      <aside class="side">
        <button v-for="lv in levels" :key="lv" class="lv-btn" :class="{ on: level === lv }" @click="level = lv">
          <span class="lv-name">{{ lv === 0 ? '全部难度' : levelName(lv as Level) }}</span>
          <span class="lv-cnt mono">{{ levelCounts[lv] }}</span>
        </button>

        <div class="side-box">
          <div class="sb-title tiny">本轮进度</div>
          <div class="sb-track"><span :style="{ width: progressPct + '%' }" /></div>
          <div class="tiny muted">{{ progressPct }}%（{{ solved.length }}/{{ list.length }}）</div>
        </div>

        <div class="side-box">
          <div class="sb-title tiny">题目列表</div>
          <div class="num-grid">
            <button
              v-for="(e, i) in list"
              :key="e.exercise.id"
              class="num"
              :class="{ on: i === index, done: solved.includes(e.exercise.id) }"
              :title="e.exercise.prompt"
              @click="index = i"
            >
              {{ i + 1 }}
            </button>
          </div>
        </div>
      </aside>

      <main class="main">
        <div v-if="current" class="q-wrap">
          <div class="q-meta tiny">
            <span class="tag tag-blue">{{ current.lesson.chapterNo }} {{ current.lesson.chapterTitle }}</span>
            <span class="muted">{{ current.lesson.title }}</span>
            <span class="spacer" />
            <span class="muted">第 {{ index + 1 }} / {{ list.length }} 题</span>
          </div>

          <ExerciseCard
            :exercise="current.exercise"
            :lesson-id="current.lesson.id"
            @solved="onSolved(current.exercise.id)"
          >
            <template #footer>
              <el-button size="small" @click="prev" :disabled="index === 0">上一题</el-button>
              <el-button size="small" type="primary" plain @click="next">下一题</el-button>
            </template>
          </ExerciseCard>

          <div class="tip-box tiny">
            没有思路时，先问自己三个问题：<b>要匹配的东西由哪些字符组成？</b> →
            <b>每个字符出现几次？</b> → <b>它前后有什么固定的东西可以当锚点？</b>
          </div>
        </div>
        <el-empty v-else description="这个难度还没有题目" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.practice {
  max-width: 1180px;
  margin: 0 auto;
  padding: 20px 20px 60px;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}
.head h1 {
  font-size: 20px;
  margin: 0 0 3px;
}
.session {
  display: flex;
  align-items: baseline;
  gap: 5px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 12px;
}
.big {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
}
.body {
  display: grid;
  grid-template-columns: 216px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}
.side {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: sticky;
  top: 68px;
}
.lv-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--border);
  background: var(--panel);
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 12.5px;
  cursor: pointer;
  color: var(--text-2);
}
.lv-btn:hover {
  border-color: #b9cdfa;
}
.lv-btn.on {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}
.lv-cnt {
  font-size: 11px;
  color: var(--text-3);
}
.side-box {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 9px 10px;
}
.sb-title {
  font-weight: 700;
  color: var(--text-3);
  letter-spacing: 0.4px;
  margin-bottom: 6px;
}
.sb-track {
  height: 5px;
  background: var(--bg-sunken);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 5px;
}
.sb-track span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #1a7f37, #4ac26b);
}
.num-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  max-height: 220px;
  overflow: auto;
}
.num {
  border: 1px solid var(--border);
  background: var(--panel-2);
  border-radius: 4px;
  font-size: 11px;
  height: 24px;
  cursor: pointer;
  color: var(--text-2);
  font-family: var(--mono);
}
.num.on {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}
.num.done {
  background: var(--success-soft);
  border-color: #bfe3c9;
  color: var(--success);
}
.q-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.spacer {
  flex: 1;
}
.tip-box {
  margin-top: 12px;
  color: var(--text-2);
  background: var(--panel);
  border: 1px dashed var(--border-strong);
  border-radius: 6px;
  padding: 8px 11px;
  line-height: 1.75;
}
@media (max-width: 900px) {
  .body {
    grid-template-columns: 1fr;
  }
  .side {
    position: static;
  }
  .num-grid {
    grid-template-columns: repeat(10, 1fr);
  }
}
</style>
