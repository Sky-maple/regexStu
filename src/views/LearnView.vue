<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chapters, firstLessonOf, getLesson, lessons, neighbors } from '@/data/curriculum'
import { lessonProgress, markLearned, masteryOf, recordVisit } from '@/stores/progress'
import LessonTree from '@/components/LessonTree.vue'
import ExampleCard from '@/components/ExampleCard.vue'
import ExerciseCard from '@/components/ExerciseCard.vue'
import MiniLab from '@/components/MiniLab.vue'

const route = useRoute()
const router = useRouter()

const lessonId = computed(() => String(route.params.lessonId || lessons[0].id))
const lesson = computed(() => getLesson(lessonId.value))
const chapter = computed(() => chapters.find((c) => c.lessons.some((l) => l.id === lessonId.value)))
const nav = computed(() => neighbors(lessonId.value))

const labText = ref('')
const labPattern = ref('')
const labFlags = ref('g')
const solvedIds = ref<string[]>([])

watch(
  lessonId,
  (id) => {
    const l = getLesson(id)
    if (!l) return
    recordVisit(id)
    const first = l.examples[0]
    labText.value = first?.text || ''
    labPattern.value = first?.pattern || ''
    labFlags.value = first?.flags || 'g'
    solvedIds.value = []
  },
  { immediate: true }
)

const learned = computed(() => lessonProgress(lessonId.value).learned)
const mastery = computed(() => masteryOf(lessonId.value))
const allSolved = computed(
  () => !!lesson.value && lesson.value.exercises.every((e) => solvedIds.value.includes(e.id))
)

function loadExample(pattern: string, text: string, flags?: string) {
  labPattern.value = pattern
  labText.value = text
  labFlags.value = flags || 'g'
}

function onSolved(id: string) {
  if (!solvedIds.value.includes(id)) solvedIds.value = [...solvedIds.value, id]
  if (allSolved.value) markLearned(lessonId.value)
}

function markDone() {
  markLearned(lessonId.value)
}

function goNext() {
  if (nav.value.next) router.push(`/learn/${nav.value.next.id}`)
  else router.push('/progress')
}
</script>

<template>
  <div v-if="lesson" class="learn">
    <!-- 左：目录 -->
    <aside class="col-left">
      <LessonTree :current-lesson-id="lessonId" />
    </aside>

    <!-- 中：讲解 -->
    <main class="col-main">
      <div class="lesson-head">
        <div class="crumb tiny">
          <router-link to="/learn">学习</router-link>
          <span>/</span>
          <span>{{ chapter?.no }} {{ chapter?.title }}</span>
        </div>
        <div class="title-row">
          <h1>{{ lesson.title }}</h1>
          <span v-if="learned" class="tag tag-green">已学</span>
          <span v-else class="tag tag-gray">未学</span>
          <span class="mastery tiny muted">掌握度 {{ mastery }}%</span>
          <span class="spacer" />
          <el-button size="small" :type="learned ? 'default' : 'primary'" plain @click="markDone">
            {{ learned ? '已标记完成' : '标记本节已学' }}
          </el-button>
        </div>
      </div>

      <!-- 本质 -->
      <section class="essence">
        <span class="es-label">一句话本质</span>
        <p>{{ lesson.essence }}</p>
      </section>

      <!-- 要点 -->
      <section class="block">
        <h2 class="section-title">要点</h2>
        <ul class="points">
          <li v-for="(p, i) in lesson.points" :key="i">{{ p }}</li>
        </ul>
      </section>

      <!-- 示例 -->
      <section class="block">
        <h2 class="section-title">例子</h2>
        <div class="examples">
          <ExampleCard
            v-for="(ex, i) in lesson.examples"
            :key="i"
            :example="ex"
            :index="i"
            class="ex-card"
            @click="loadExample(ex.pattern, ex.text, ex.flags)"
          />
        </div>
        <p class="tiny muted hint-line">
          提示：点任意例子可以把它载入右边的实验区，然后试着改一个字符，看结果怎么变。
        </p>
      </section>

      <!-- 代码 -->
      <section v-if="lesson.code?.length" class="block">
        <h2 class="section-title">代码</h2>
        <div v-for="(c, i) in lesson.code" :key="i" class="code-card">
          <div class="code-head">
            <span class="tag tag-gray">{{ c.lang }}</span>
            <span class="tiny">{{ c.title }}</span>
          </div>
          <pre class="code mono">{{ c.code }}</pre>
        </div>
      </section>

      <!-- 易错点 -->
      <section v-if="lesson.pitfalls?.length" class="block">
        <h2 class="section-title">容易踩的坑</h2>
        <div class="pitfalls">
          <div v-for="(p, i) in lesson.pitfalls" :key="i" class="pitfall">
            <div class="pf-wrong">
              <span class="pf-tag">✕ 常见错误</span>
              <span>{{ p.wrong }}</span>
            </div>
            <div class="pf-why"><span class="pf-tag ok">✓ 正确理解</span>{{ p.why }}</div>
          </div>
        </div>
      </section>

      <!-- 练习 -->
      <section class="block exercises">
        <div class="ex-head">
          <h2 class="section-title">本节练习</h2>
          <span class="tiny muted">
            {{ solvedIds.length }}/{{ lesson.exercises.length }} 通过
            <template v-if="allSolved"> · 本节已完成 🎉</template>
          </span>
        </div>
        <div class="ex-list">
          <ExerciseCard
            v-for="(e, i) in lesson.exercises"
            :key="e.id"
            :exercise="e"
            :lesson-id="lessonId"
            :record="true"
            @solved="onSolved(e.id)"
          >
            <template #footer>
              <span class="tiny muted">第 {{ i + 1 }} 题</span>
            </template>
          </ExerciseCard>
        </div>
      </section>

      <!-- 上一节 / 下一节 -->
      <div class="pager">
        <button class="pg panel" :disabled="!nav.prev" @click="nav.prev && router.push(`/learn/${nav.prev.id}`)">
          <span class="tiny muted">← 上一节</span>
          <span class="pg-title">{{ nav.prev?.title || '已经是第一节' }}</span>
        </button>
        <button class="pg next panel" @click="goNext">
          <span class="tiny muted">{{ nav.next ? '下一节 →' : '全部学完，去看进度 →' }}</span>
          <span class="pg-title">{{ nav.next?.title || '学习进度' }}</span>
        </button>
      </div>
    </main>

    <!-- 右：实验区 -->
    <aside class="col-lab">
      <div class="lab-inner">
        <div class="lab-head">
          <span class="lh-title">实时实验区</span>
          <span class="tiny muted">改一改，看结果</span>
        </div>
        <div class="lab-tools">
          <button
            v-for="(ex, i) in lesson.examples"
            :key="i"
            class="tool"
            :class="{ on: labPattern === ex.pattern && labText === ex.text }"
            @click="loadExample(ex.pattern, ex.text, ex.flags)"
          >
            载入例 {{ i + 1 }}
          </button>
        </div>
        <MiniLab
          v-model:text="labText"
          v-model:pattern="labPattern"
          v-model:flags="labFlags"
          :rows="6"
        />
      </div>
    </aside>
  </div>

  <div v-else class="notfound">
    <p>没有找到这一节。</p>
    <el-button @click="router.push(`/learn/${firstLessonOf('basics')?.id || ''}`)">回到第一节</el-button>
  </div>
</template>

<style scoped>
.learn {
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr) 340px;
  height: calc(100vh - 52px);
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}
.col-left,
.col-main,
.col-lab {
  min-height: 0;
}
.col-left {
  border-right: 1px solid var(--border);
  background: var(--panel);
  overflow: hidden;
}
.col-main {
  overflow: auto;
  padding: 18px 26px 60px;
}
.col-lab {
  border-left: 1px solid var(--border);
  background: var(--panel);
  overflow: auto;
}
.lab-inner {
  position: sticky;
  top: 0;
  padding: 12px 14px 24px;
}
.lab-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.lh-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: var(--text-2);
}
.lab-tools {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.tool {
  border: 1px solid var(--border);
  background: var(--panel-2);
  border-radius: 4px;
  font-size: 11px;
  padding: 2px 7px;
  cursor: pointer;
  color: var(--text-2);
}
.tool.on {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}

.lesson-head {
  margin-bottom: 16px;
}
.crumb {
  color: var(--text-3);
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.title-row h1 {
  font-size: 22px;
  margin: 0;
  letter-spacing: -0.2px;
}
.spacer {
  flex: 1;
}
.mastery {
  font-family: var(--mono);
}
.essence {
  background: linear-gradient(180deg, #f7f9ff, #fbfcfe);
  border: 1px solid #dfe8fb;
  border-left: 3px solid var(--accent);
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 18px;
}
.es-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--accent);
}
.essence p {
  margin: 4px 0 0;
  font-size: 13.5px;
  line-height: 1.8;
  color: #1f2a3d;
}
.block {
  margin-bottom: 22px;
}
.points {
  margin: 8px 0 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.85;
  color: var(--text-2);
}
.points li {
  margin-bottom: 4px;
}
.examples {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}
.ex-card {
  cursor: pointer;
}
.hint-line {
  margin: 8px 0 0;
}
.code-card {
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  margin-top: 8px;
}
.code-head {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px;
  background: var(--panel-2);
  border-bottom: 1px solid var(--border);
}
.code {
  margin: 0;
  padding: 10px 12px;
  background: #fbfcfd;
  font-size: 12px;
  line-height: 1.75;
  overflow: auto;
  color: #1f2a3d;
}
.pitfalls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.pitfall {
  border: 1px solid #f3d9a4;
  background: #fffdf5;
  border-radius: 6px;
  padding: 8px 11px;
  font-size: 12.5px;
  line-height: 1.7;
}
.pf-wrong {
  color: #8a5300;
}
.pf-why {
  color: var(--text-2);
  margin-top: 3px;
}
.pf-tag {
  font-size: 10.5px;
  font-weight: 700;
  margin-right: 6px;
  color: var(--warn);
}
.pf-tag.ok {
  color: var(--success);
}
.ex-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.ex-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}
.pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 8px;
}
.pg {
  text-align: left;
  padding: 10px 12px;
  border: 1px solid var(--border);
  background: var(--panel);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pg.next {
  text-align: right;
  align-items: flex-end;
}
.pg:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pg-title {
  font-size: 13px;
  font-weight: 500;
}
.notfound {
  padding: 60px;
  text-align: center;
  color: var(--text-2);
}
@media (max-width: 1280px) {
  .learn {
    grid-template-columns: 210px minmax(0, 1fr) 300px;
  }
  .col-main {
    padding: 16px 18px 50px;
  }
}
@media (max-width: 1080px) {
  .learn {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
  }
  .col-left {
    display: none;
  }
  .col-lab {
    border-left: none;
    border-top: 1px solid var(--border);
    overflow: visible;
  }
  .col-main {
    overflow: visible;
  }
}
</style>
