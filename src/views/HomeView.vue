<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  accuracy,
  chapterProgress,
  continueLesson,
  learnedCount,
  mistakeCount,
  progress
} from '@/stores/progress'
import { chapters, lessons, totalExerciseCount } from '@/data/curriculum'

const router = useRouter()

const entries = [
  { to: '/learn', icon: '⌘', title: '学习路线', desc: '11 章 44 节，从字符到断言，每节带练习' },
  { to: '/lab', icon: '/.*/', title: '正则实验室', desc: '文本 + 正则 + 高亮 + 逐字符拆解' },
  { to: '/practice', icon: '✓', title: '在线练习', desc: 'Lv1~Lv5 分级，错了先给诊断和提示' },
  { to: '/challenge', icon: '⟳', title: '随机挑战', desc: '同一考点、随机数据，防背答案' },
  { to: '/mistakes', icon: '!', title: '错题本', desc: '记录你的写法、正确写法和错因' },
  { to: '/cases', icon: '{}', title: '实战案例', desc: '订单、日志、URL、IP、SQL、异常' },
  { to: '/progress', icon: '▤', title: '学习进度', desc: '章节掌握度、正确率、薄弱知识点' }
]

const stages = computed(() => {
  const map = new Map<string, typeof chapters>()
  for (const c of chapters) {
    const list = map.get(c.stage) || []
    list.push(c)
    map.set(c.stage, list)
  }
  return [...map.entries()].map(([name, list]) => ({ name, chapters: list }))
})

const total = lessons.length
const learned = learnedCount
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-left">
        <div class="eyebrow">REGEX LEARNING LAB</div>
        <h1>不背符号，<span class="grad">把正则学成手艺</span></h1>
        <p class="sub">
          每个知识点都按同一个节奏走：<b>概念 → 例子 → 你改一个字符 → 立刻看到结果 → 做一道题 → 看错因</b>。
          右侧永远有实验区，你不需要信任我，你可以自己验证。
        </p>
        <div class="cta">
          <el-button type="primary" size="large" @click="router.push(`/learn/${continueLesson.id}`)">
            {{ learned ? '继续学习：' + continueLesson.title : '从第一节开始' }}
          </el-button>
          <el-button size="large" @click="router.push('/lab')">打开实验室</el-button>
        </div>
        <div class="hero-stats">
          <div class="hs">
            <span class="n mono">{{ learned }}<i>/{{ total }}</i></span>
            <span class="l">已学小节</span>
          </div>
          <div class="hs">
            <span class="n mono">{{ progress.stats.attempts }}</span>
            <span class="l">练习次数</span>
          </div>
          <div class="hs">
            <span class="n mono">{{ accuracy }}<i>%</i></span>
            <span class="l">正确率</span>
          </div>
          <div class="hs">
            <span class="n mono">{{ mistakeCount }}</span>
            <span class="l">待订正错题</span>
          </div>
        </div>
      </div>

      <div class="hero-right">
        <div class="demo">
          <div class="demo-head">
            <span class="dot r" /><span class="dot y" /><span class="dot g" />
            <span class="demo-title mono">live demo</span>
          </div>
          <div class="demo-body mono">
            <div class="line"><span class="c">// 文本</span></div>
            <div class="line">订单号：<span class="hl">SO202610260001</span>，金额：199.00</div>
            <div class="line">&nbsp;</div>
            <div class="line"><span class="c">// 正则</span></div>
            <div class="line"><span class="p">(</span>SO<span class="p">)(</span>\d+<span class="p">)</span></div>
            <div class="line">&nbsp;</div>
            <div class="line"><span class="c">// 结果</span></div>
            <div class="line">group(0) → <span class="hl">SO202610260001</span></div>
            <div class="line">group(1) → <span class="g1">SO</span></div>
            <div class="line">group(2) → <span class="g2">202610260001</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 入口 -->
    <section class="entries">
      <button v-for="e in entries" :key="e.to" class="entry panel" @click="router.push(e.to)">
        <span class="ico mono">{{ e.icon }}</span>
        <span class="e-title">{{ e.title }}</span>
        <span class="e-desc">{{ e.desc }}</span>
        <span class="e-arrow">→</span>
      </button>
    </section>

    <!-- 学习路线 -->
    <section class="roadmap">
      <div class="sec-head">
        <h2>学习路线</h2>
        <p class="tiny muted">
          共 {{ chapters.length }} 章 {{ total }} 节、{{ totalExerciseCount }} 道配套练习。按顺序走，别跳。
        </p>
      </div>
      <div class="stages">
        <div v-for="s in stages" :key="s.name" class="stage">
          <div class="st-name">{{ s.name }}</div>
          <div class="st-chapters">
            <button v-for="c in s.chapters" :key="c.id" class="ch-card panel" @click="router.push(`/learn/${c.lessons[0].id}`)">
              <div class="ch-top">
                <span class="ch-no mono">{{ c.no }}</span>
                <span class="ch-title">{{ c.title }}</span>
                <span class="ch-cnt mono">{{ c.lessons.length }} 节</span>
              </div>
              <div class="ch-sub tiny">{{ c.subtitle }}</div>
              <div class="ch-bar">
                <span :style="{ width: chapterProgress.find((x) => x.id === c.id)?.mastery + '%' }" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 进度概览 -->
    <section class="overview">
      <div class="sec-head">
        <h2>掌握度</h2>
        <p class="tiny muted">练习正确率越高越绿；只学过没练过最多 40%。</p>
      </div>
      <div class="bars panel">
        <div v-for="c in chapterProgress" :key="c.id" class="bar-row">
          <span class="b-name">{{ c.no }} {{ c.title }}</span>
          <div class="b-track">
            <div class="b-fill" :class="{ low: c.mastery < 40, mid: c.mastery >= 40 && c.mastery < 75 }" :style="{ width: c.mastery + '%' }" />
          </div>
          <span class="b-val mono">{{ c.mastery }}%</span>
          <span class="b-cnt tiny muted">{{ c.learned }}/{{ c.total }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 20px 60px;
}

/* Hero */
.hero {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 32px;
  align-items: center;
  padding: 12px 0 34px;
}
.eyebrow {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--accent);
  font-weight: 600;
}
h1 {
  font-size: 34px;
  line-height: 1.28;
  margin: 8px 0 12px;
  letter-spacing: -0.5px;
}
.grad {
  background: linear-gradient(100deg, #2f6feb, #8250df 70%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.sub {
  font-size: 13.5px;
  line-height: 1.85;
  color: var(--text-2);
  margin: 0 0 18px;
  max-width: 560px;
}
.sub b {
  color: var(--text);
}
.cta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.hero-stats {
  display: flex;
  gap: 26px;
  margin-top: 24px;
  flex-wrap: wrap;
}
.hs {
  display: flex;
  flex-direction: column;
}
.hs .n {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
}
.hs .n i {
  font-style: normal;
  font-size: 12px;
  color: var(--text-3);
  font-weight: 500;
}
.hs .l {
  font-size: 11.5px;
  color: var(--text-3);
}

/* Demo */
.demo {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(27, 31, 36, 0.09);
  overflow: hidden;
}
.demo-head {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 10px;
  background: var(--panel-2);
  border-bottom: 1px solid var(--border);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.r {
  background: #ff5f57;
}
.y {
  background: #febc2e;
}
.g {
  background: #28c840;
}
.demo-title {
  margin-left: auto;
  font-size: 10.5px;
  color: var(--text-3);
}
.demo-body {
  padding: 12px 14px;
  font-size: 12px;
  line-height: 1.9;
  color: var(--text-2);
  white-space: pre-wrap;
}
.demo-body .c {
  color: var(--text-3);
}
.demo-body .p {
  color: var(--purple);
  font-weight: 600;
}
.hl {
  background: var(--match-a);
  border-radius: 2px;
  padding: 1px 2px;
  color: #6b4b00;
}
.g1 {
  background: #e9f7ee;
  border-radius: 2px;
  padding: 1px 3px;
  color: var(--success);
}
.g2 {
  background: #eef2f8;
  border-radius: 2px;
  padding: 1px 3px;
  color: #0a3069;
}

/* Entries */
.entries {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  margin-bottom: 36px;
}
.entry {
  display: grid;
  grid-template-columns: 30px 1fr;
  grid-template-rows: auto auto;
  gap: 2px 10px;
  padding: 12px;
  text-align: left;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: all 0.15s ease;
  position: relative;
}
.entry:hover {
  border-color: #b9cdfa;
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
.ico {
  grid-row: span 2;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  background: var(--accent-soft);
  color: var(--accent);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}
.e-title {
  font-size: 13px;
  font-weight: 600;
}
.e-desc {
  font-size: 11.5px;
  color: var(--text-3);
  line-height: 1.5;
}
.e-arrow {
  position: absolute;
  right: 10px;
  top: 12px;
  color: var(--border-strong);
  font-size: 13px;
}
.entry:hover .e-arrow {
  color: var(--accent);
}

/* Roadmap */
.sec-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.sec-head h2 {
  font-size: 17px;
  margin: 0;
}
.stages {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 36px;
}
.stage {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 12px;
  align-items: start;
}
.st-name {
  font-size: 12px;
  color: var(--text-3);
  font-weight: 600;
  padding-top: 10px;
}
.st-chapters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}
.ch-card {
  padding: 10px 12px;
  cursor: pointer;
  text-align: left;
  border: 1px solid var(--border);
  transition: all 0.15s ease;
}
.ch-card:hover {
  border-color: #b9cdfa;
}
.ch-top {
  display: flex;
  align-items: baseline;
  gap: 7px;
}
.ch-no {
  font-size: 10.5px;
  color: var(--text-3);
}
.ch-title {
  font-size: 13px;
  font-weight: 600;
  flex: 1;
}
.ch-cnt {
  font-size: 10.5px;
  color: var(--text-3);
}
.ch-sub {
  color: var(--text-3);
  margin: 2px 0 8px;
}
.ch-bar {
  height: 3px;
  background: var(--bg-sunken);
  border-radius: 2px;
  overflow: hidden;
}
.ch-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #2f6feb, #6b96f2);
  border-radius: 2px;
}

/* Bars */
.bars {
  padding: 10px 14px;
}
.bar-row {
  display: grid;
  grid-template-columns: 150px 1fr 44px 50px;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
}
.b-name {
  font-size: 12.5px;
  color: var(--text-2);
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
  color: var(--text-2);
  text-align: right;
}
.b-cnt {
  text-align: right;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .hero-right {
    display: none;
  }
  .stage {
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
