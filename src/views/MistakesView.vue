<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getExercise } from '@/data/curriculum'
import { levelName } from '@/core/generate'
import { progress, removeMistake, resetAll } from '@/stores/progress'
import ExerciseCard from '@/components/ExerciseCard.vue'
import type { Exercise, Mistake } from '@/types'

const filter = ref<'all' | 'open' | 'fixed'>('open')
const practicing = ref<Exercise | null>(null)
const dialog = ref(false)

const list = computed(() => {
  const all = progress.mistakes
  if (filter.value === 'open') return all.filter((m) => !m.fixed)
  if (filter.value === 'fixed') return all.filter((m) => m.fixed)
  return all
})

const counts = computed(() => ({
  all: progress.mistakes.length,
  open: progress.mistakes.filter((m) => !m.fixed).length,
  fixed: progress.mistakes.filter((m) => m.fixed).length
}))

function exerciseOf(m: Mistake): Exercise | undefined {
  if (m.exercise) return m.exercise
  return getExercise(m.exerciseId)?.exercise
}

function practice(m: Mistake) {
  const ex = exerciseOf(m)
  if (!ex) {
    ElMessage.warning('这道题的原始数据已不可用')
    return
  }
  practicing.value = ex
  dialog.value = true
}

async function del(m: Mistake) {
  try {
    await ElMessageBox.confirm('从错题本移除这道题？记录会消失。', '移除错题', {
      confirmButtonText: '移除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    removeMistake(m.id)
  } catch {
    /* 取消 */
  }
}

async function clearAll() {
  try {
    await ElMessageBox.confirm('清空全部学习进度和错题？这个操作不可撤销。', '重置', {
      confirmButtonText: '全部清空',
      cancelButtonText: '取消',
      type: 'warning'
    })
    resetAll()
    ElMessage.success('已重置')
  } catch {
    /* 取消 */
  }
}

function fmt(t: number) {
  const d = new Date(t)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<template>
  <div class="mistakes">
    <div class="head">
      <div>
        <h1>错题本</h1>
        <p class="tiny muted">每一道错题都记下了你当时写的正则和错因。重练答对后会标记「已订正」。</p>
      </div>
      <el-button size="small" plain @click="clearAll">重置全部数据</el-button>
    </div>

    <div class="filters">
      <button class="f" :class="{ on: filter === 'open' }" @click="filter = 'open'">待订正 {{ counts.open }}</button>
      <button class="f" :class="{ on: filter === 'fixed' }" @click="filter = 'fixed'">已订正 {{ counts.fixed }}</button>
      <button class="f" :class="{ on: filter === 'all' }" @click="filter = 'all'">全部 {{ counts.all }}</button>
    </div>

    <div v-if="!list.length" class="empty panel">
      <div class="e-icon">✓</div>
      <p>{{ filter === 'open' ? '没有待订正的错题。' : '这里还是空的。' }}</p>
      <p class="tiny muted">去练习或随机挑战里做几题，错的会自动进来。</p>
      <el-button size="small" @click="$router.push('/practice')">去做练习</el-button>
    </div>

    <div v-else class="list">
      <div v-for="m in list" :key="m.id" class="item panel" :class="{ fixed: m.fixed }">
        <div class="i-head">
          <span class="tag tag-gray">{{ levelName(m.level) }}</span>
          <span class="tag tag-blue">{{ m.lessonTitle || '随机挑战' }}</span>
          <span class="spacer" />
          <span class="tiny muted">错 {{ m.count }} 次 · {{ fmt(m.at) }}</span>
          <span v-if="m.fixed" class="tag tag-green">已订正</span>
        </div>

        <p class="prompt">{{ m.prompt }}</p>
        <pre class="text mono">{{ m.text }}</pre>

        <div class="rows">
          <div class="row">
            <span class="rl">我的正则</span>
            <code class="mono bad">{{ m.myPattern || '（空）' }}</code>
          </div>
          <div class="row">
            <span class="rl">正确答案</span>
            <code class="mono good">{{ m.answer }}</code>
          </div>
        </div>

        <div class="reason"><span class="rl">错因</span>{{ m.reason }}</div>

        <div class="i-foot">
          <span v-for="k in m.knowledge" :key="k" class="tag tag-gray">{{ k }}</span>
          <span class="spacer" />
          <el-button size="small" type="primary" plain @click="practice(m)">重练</el-button>
          <el-button size="small" text @click="del(m)">移除</el-button>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialog" title="错题重练" width="680px" align-center destroy-on-close>
      <ExerciseCard v-if="practicing" :exercise="practicing" :record="true" lesson-id="mistake-review" />
    </el-dialog>
  </div>
</template>

<style scoped>
.mistakes {
  max-width: 900px;
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
.filters {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}
.f {
  border: 1px solid var(--border);
  background: var(--panel);
  border-radius: 999px;
  padding: 3px 12px;
  font-size: 12px;
  cursor: pointer;
  color: var(--text-2);
}
.f.on {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}
.empty {
  padding: 40px;
  text-align: center;
  color: var(--text-2);
}
.e-icon {
  font-size: 26px;
  color: var(--success);
}
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item {
  padding: 11px 13px;
}
.item.fixed {
  opacity: 0.78;
}
.i-head {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.spacer {
  flex: 1;
}
.prompt {
  margin: 8px 0 6px;
  font-size: 13px;
  font-weight: 500;
}
.text {
  margin: 0;
  font-size: 12px;
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 7px 9px;
  white-space: pre-wrap;
  word-break: break-word;
  color: #0a3069;
  max-height: 110px;
  overflow: auto;
}
.rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}
.row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rl {
  font-size: 11px;
  color: var(--text-3);
  min-width: 56px;
}
code.bad {
  font-size: 12px;
  background: var(--danger-soft);
  border: 1px solid #f7c9cb;
  color: var(--danger);
  border-radius: 4px;
  padding: 0 6px;
}
code.good {
  font-size: 12px;
  background: var(--success-soft);
  border: 1px solid #bfe3c9;
  color: var(--success);
  border-radius: 4px;
  padding: 0 6px;
}
.reason {
  margin-top: 8px;
  font-size: 12.5px;
  color: #7a2b31;
  background: #fff7f7;
  border-left: 2px solid #f0b3b7;
  padding: 5px 9px;
  border-radius: 0 4px 4px 0;
  line-height: 1.7;
}
.i-foot {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 9px;
  flex-wrap: wrap;
}
</style>
