<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  accuracy,
  chapterProgress,
  learnedCount,
  masteryOf,
  mistakeCount,
  progress,
  weakKnowledge
} from '@/stores/progress'
import { getLesson, lessons, totalLessonCount } from '@/data/curriculum'

const router = useRouter()

const stat = computed(() => ({
  learned: learnedCount.value,
  total: totalLessonCount,
  attempts: progress.stats.attempts,
  accuracy: accuracy.value,
  streak: progress.stats.streak,
  best: progress.stats.bestStreak,
  mistakes: mistakeCount.value,
  rate: Math.round((learnedCount.value / totalLessonCount) * 100)
}))

const recent = computed(() =>
  Object.entries(progress.lessons)
    .filter(([, p]) => p.lastAt > 0)
    .sort((a, b) => b[1].lastAt - a[1].lastAt)
    .slice(0, 6)
    .map(([id, p]) => ({ lesson: getLesson(id), p }))
    .filter((x) => !!x.lesson)
)

const levelStat = computed(() => {
  const buckets = [0, 0, 0, 0, 0, 0]
  for (const l of lessons) {
    for (const e of l.exercises) buckets[e.level]++
  }
  return buckets.slice(1)
})

function fmt(t: number) {
  const d = new Date(t)
  return `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes()
  ).padStart(2, '0')}`
}
</script>

<template>
  <div class="progress-view">
    <div class="head">
      <div>
        <h1>学习进度</h1>
        <p class="tiny muted">数据存在本地（localStorage），换浏览器不会同步，但不会丢在服务端。</p>
      </div>
      <el-button size="small" plain @click="router.push('/learn')">继续学习</el-button>
    </div>

    <div class="stats">
      <div class="stat panel">
        <div class="s-val mono">{{ stat.learned }}<i>/{{ stat.total }}</i></div>
        <div class="s-lab">已学小节</div>
        <div class="s-bar"><span :style="{ width: stat.rate + '%' }" /></div>
      </div>
      <div class="stat panel">
        <div class="s-val mono">{{ stat.attempts }}</div>
        <div class="s-lab">练习次数</div>
        <div class="s-sub tiny muted">含重复练习</div>
      </div>
      <div class="stat panel">
        <div class="s-val mono">{{ stat.accuracy }}<i>%</i></div>
        <div class="s-lab">总正确率</div>
        <div class="s-sub tiny muted">按提交次数计</div>
      </div>
      <div class="stat panel">
        <div class="s-val mono">{{ stat.streak }}<i>/{{ stat.best }}</i></div>
        <div class="s-lab">当前连击 / 最高</div>
        <div class="s-sub tiny muted">答错即清零</div>
      </div>
      <div class="stat panel">
        <div class="s-val mono">{{ stat.mistakes }}</div>
        <div class="s-lab">错题本条目</div>
        <div class="s-sub tiny muted" @click="router.push('/mistakes')">
          <a>去订正 →</a>
        </div>
      </div>
    </div>

    <div class="cols">
      <section class="panel panel-pad">
        <h2 class="section-title">章节掌握度</h2>
        <p class="tiny muted tip">掌握度 = 本节练习正确率；只学过没练过最多 40%。</p>
        <div class="bars">
          <div v-for="c in chapterProgress" :key="c.id" class="bar-row">
            <button class="b-name" @click="router.push(`/learn/${c.firstLessonId}`)">{{ c.no }} {{ c.title }}</button>
            <div class="b-track">
              <div
                class="b-fill"
                :class="{ low: c.mastery < 40, mid: c.mastery >= 40 && c.mastery < 75 }"
                :style="{ width: c.mastery + '%' }"
              />
            </div>
            <span class="b-val mono">{{ c.mastery }}%</span>
            <span class="b-cnt tiny muted">{{ c.learned }}/{{ c.total }}</span>
          </div>
        </div>
      </section>

      <div class="right-col">
        <section class="panel panel-pad">
          <h2 class="section-title">薄弱知识点</h2>
          <p class="tiny muted tip">按错题里出现的知识点频次统计。</p>
          <div v-if="weakKnowledge.length" class="weak">
            <button v-for="w in weakKnowledge" :key="w.key" class="weak-item" @click="router.push('/practice')">
              <code class="mono">{{ w.key }}</code>
              <span class="cnt mono">×{{ w.count }}</span>
            </button>
          </div>
          <p v-else class="tiny muted">还没有错题，保持住。</p>
        </section>

        <section class="panel panel-pad">
          <h2 class="section-title">题目分布</h2>
          <div class="lv-dist">
            <div v-for="(n, i) in levelStat" :key="i" class="lv-row">
              <span class="lv-n mono">Lv{{ i + 1 }}</span>
              <div class="lv-track"><span :style="{ width: (n / Math.max(...levelStat)) * 100 + '%' }" /></div>
              <span class="tiny muted mono">{{ n }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>

    <section class="panel panel-pad recent">
      <h2 class="section-title">最近学习</h2>
      <div v-if="recent.length" class="rec-list">
        <button v-for="r in recent" :key="r.lesson!.id" class="rec" @click="router.push(`/learn/${r.lesson!.id}`)">
          <span class="tag tag-blue">{{ r.lesson!.chapterNo }}</span>
          <span class="rec-title">{{ r.lesson!.title }}</span>
          <span class="spacer" />
          <span class="tiny muted mono">{{ masteryOf(r.lesson!.id) }}%</span>
          <span class="tiny muted">{{ fmt(r.p.lastAt) }}</span>
        </button>
      </div>
      <p v-else class="tiny muted">还没有学习记录，从第一节开始吧。</p>
    </section>
  </div>
</template>

<style scoped>
.progress-view {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 20px 60px;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}
.head h1 {
  font-size: 20px;
  margin: 0 0 3px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}
.stat {
  padding: 11px 13px;
}
.s-val {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}
.s-val i {
  font-style: normal;
  font-size: 12px;
  color: var(--text-3);
  font-weight: 500;
  margin-left: 2px;
}
.s-lab {
  font-size: 12px;
  color: var(--text-2);
  margin-top: 2px;
}
.s-sub {
  margin-top: 3px;
}
.s-bar {
  height: 4px;
  background: var(--bg-sunken);
  border-radius: 2px;
  margin-top: 7px;
  overflow: hidden;
}
.s-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #2f6feb, #8250df);
}
.cols {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: 12px;
  margin-bottom: 12px;
  align-items: start;
}
.right-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tip {
  margin: 4px 0 8px;
}
.bars {
  margin-top: 4px;
}
.bar-row {
  display: grid;
  grid-template-columns: 140px 1fr 42px 46px;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}
.b-name {
  border: none;
  background: transparent;
  text-align: left;
  font-size: 12px;
  color: var(--text-2);
  cursor: pointer;
  padding: 0;
}
.b-name:hover {
  color: var(--accent);
}
.b-track {
  height: 6px;
  background: var(--bg-sunken);
  border-radius: 3px;
  overflow: hidden;
}
.b-fill {
  height: 100%;
  background: linear-gradient(90deg, #1a7f37, #4ac26b);
  border-radius: 3px;
  transition: width 0.3s ease;
}
.b-fill.mid {
  background: linear-gradient(90deg, #2f6feb, #6b96f2);
}
.b-fill.low {
  background: #c8ced8;
}
.b-val {
  font-size: 11.5px;
  text-align: right;
}
.b-cnt {
  text-align: right;
}
.weak {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.weak-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #f3c9cb;
  background: #fff7f7;
  border-radius: 5px;
  padding: 2px 8px;
  cursor: pointer;
  color: #a02a31;
  font-size: 11.5px;
}
.weak-item code {
  font-size: 11.5px;
}
.cnt {
  color: #c46a70;
  font-size: 10.5px;
}
.lv-dist {
  margin-top: 6px;
}
.lv-row {
  display: grid;
  grid-template-columns: 34px 1fr 26px;
  align-items: center;
  gap: 7px;
  padding: 3px 0;
}
.lv-n {
  font-size: 11px;
  color: var(--text-3);
}
.lv-track {
  height: 5px;
  background: var(--bg-sunken);
  border-radius: 3px;
  overflow: hidden;
}
.lv-track span {
  display: block;
  height: 100%;
  background: #b9cdfa;
}
.recent {
  margin-top: 0;
}
.rec-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 6px;
}
.rec {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 6px;
  border: none;
  background: transparent;
  border-radius: 5px;
  cursor: pointer;
  text-align: left;
}
.rec:hover {
  background: var(--bg);
}
.rec-title {
  font-size: 12.5px;
}
.spacer {
  flex: 1;
}
@media (max-width: 900px) {
  .cols {
    grid-template-columns: 1fr;
  }
  .bar-row {
    grid-template-columns: 110px 1fr 40px;
  }
  .b-cnt {
    display: none;
  }
}
</style>
