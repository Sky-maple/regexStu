<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Exercise } from '@/types'
import { judge, type JudgeResult } from '@/core/evaluate'
import { run } from '@/core/regex'
import { levelName } from '@/core/generate'
import { recordAnswer } from '@/stores/progress'
import HighlightedText from './HighlightedText.vue'

const props = withDefaults(
  defineProps<{
    exercise: Exercise
    lessonId?: string
    /** 是否写入学习进度与错题本 */
    record?: boolean
    /** 是否展示知识点标签 */
    showMeta?: boolean
  }>(),
  { lessonId: '', record: true, showMeta: true }
)

const emit = defineEmits<{
  (e: 'solved', pattern: string): void
  (e: 'failed', pattern: string, reason: string): void
  (e: 'checked', correct: boolean): void
}>()

const pattern = ref('')
const result = ref<JudgeResult | null>(null)
const hintCount = ref(0)
const answerShown = ref(false)
const attempts = ref(0)
const solved = ref(false)
const emptyWarn = ref(false)

/** 结果对比里只列真正取到内容的项；空匹配单独汇总成一个 chip */
const actualContent = computed(() => {
  if (!result.value) return []
  // groups 模式下的空串是「空捕获组」，本身就是一个有效结果项，不能当空匹配过滤掉
  if ((props.exercise.mode || 'matches') === 'groups') return result.value.actual
  return result.value.actual.filter((v) => v !== '')
})

const live = computed(() => run(pattern.value, props.exercise.flags || 'g', props.exercise.text))

watch(
  () => props.exercise.id,
  () => {
    pattern.value = ''
    result.value = null
    hintCount.value = 0
    answerShown.value = false
    attempts.value = 0
    solved.value = false
    emptyWarn.value = false
  }
)

function check() {
  if (!pattern.value.trim()) {
    emptyWarn.value = true
    return
  }
  emptyWarn.value = false
  attempts.value++
  const r = judge(props.exercise, pattern.value)
  result.value = r
  solved.value = r.correct
  if (props.record && props.lessonId) {
    recordAnswer({
      lessonId: props.lessonId,
      exercise: props.exercise,
      correct: r.correct,
      pattern: pattern.value,
      reason: r.reason
    })
  }
  emit('checked', r.correct)
  if (r.correct) emit('solved', pattern.value)
  else emit('failed', pattern.value, r.reason)
}

function useHint() {
  if (hintCount.value < props.exercise.hints.length) hintCount.value++
}

function reveal() {
  answerShown.value = true
}

const canReveal = computed(() => hintCount.value >= props.exercise.hints.length || attempts.value >= 3)
</script>

<template>
  <div class="ex panel" :class="{ solved }">
    <div class="head">
      <span class="lv" :class="`lv${exercise.level}`">{{ levelName(exercise.level) }}</span>
      <p class="prompt">{{ exercise.prompt }}</p>
    </div>

    <div class="body">
      <div class="block">
        <div class="blabel">题目文本</div>
        <HighlightedText
          :text="exercise.text"
          :pattern="pattern"
          :flags="exercise.flags || 'g'"
          max-height="150px"
        />
      </div>

      <div class="input-row">
        <span class="slash mono">/</span>
        <el-input
          v-model="pattern"
          class="ans"
          spellcheck="false"
          placeholder="在这里写你的正则…"
          :disabled="solved"
          @keyup.enter="check"
        />
        <span class="slash mono">/{{ exercise.flags || 'g' }}</span>
      </div>

      <div class="actions">
        <el-button type="primary" size="default" :disabled="solved" @click="check">
          {{ attempts ? '再检查一次' : '检查答案' }}
        </el-button>
        <el-button size="default" :disabled="solved || hintCount >= exercise.hints.length" @click="useHint">
          提示 {{ hintCount }}/{{ exercise.hints.length }}
        </el-button>
        <el-button size="default" :disabled="solved || answerShown || !canReveal" @click="reveal">
          {{ canReveal ? '看标准答案' : '先试几次再看答案' }}
        </el-button>
        <span v-if="attempts" class="tiny muted">已尝试 {{ attempts }} 次</span>
      </div>

      <div v-if="emptyWarn" class="warn tiny">先写一个正则再检查 —— 哪怕只写个 \\d 也行。</div>

      <!-- 提示 -->
      <div v-if="hintCount && !solved" class="hints">
        <div v-for="i in hintCount" :key="i" class="hint">
          <span class="hno">提示 {{ i }}</span>
          {{ exercise.hints[i - 1] }}
        </div>
      </div>

      <!-- 结果 -->
      <div v-if="result" class="feedback" :class="result.correct ? 'ok' : 'bad'">
        <div class="fb-head">
          <span class="icon">{{ result.correct ? '✓' : '✕' }}</span>
          <span>{{ result.correct ? '通过了' : '还不对' }}</span>
          <span v-if="!result.correct" class="tiny">
            （你的结果 {{ actualContent.length }} 项<template v-if="result.actualEmpty">
              + {{ result.actualEmpty }} 个空匹配</template> / 预期 {{ result.expect.length }} 项）
          </span>
        </div>
        <p v-if="!result.correct" class="reason">{{ result.reason }}</p>

        <div class="cmp">
          <div class="cmp-row">
            <span class="clabel">预期</span>
            <span v-for="(v, i) in result.expect" :key="'e' + i" class="cv hit">{{ v === '' ? '空' : v }}</span>
          </div>
          <div class="cmp-row">
            <span class="clabel">实际</span>
            <span
              v-for="(v, i) in actualContent"
              :key="'a' + i"
              class="cv"
              :class="{ hit: result.expect.includes(v), miss: !result.expect.includes(v) }"
              >{{ v === '' ? '空' : v }}</span
            >
            <span v-if="result.actualEmpty" class="cv empty-chip" :title="`你的正则还产生了 ${result.actualEmpty} 处长度为 0 的匹配`">
              +{{ result.actualEmpty }} 空匹配
            </span>
            <span v-if="!actualContent.length && !result.actualEmpty" class="tiny muted">没有任何匹配</span>
          </div>
        </div>
      </div>

      <!-- 标准答案 -->
      <div v-if="answerShown" class="answer">
        <div class="a-head">
          <span>标准答案</span>
          <code class="mono">{{ exercise.answer }}</code>
        </div>
        <p v-if="exercise.accept && exercise.accept.length" class="tiny muted">
          也可以写成：<code v-for="a in exercise.accept" :key="a" class="inline">{{ a }}</code>
        </p>
        <p class="explain">{{ exercise.explain }}</p>
      </div>

      <!-- 通过后的解析 -->
      <div v-if="solved" class="answer solved-explain">
        <div class="a-head"><span>为什么这样写</span></div>
        <p class="explain">{{ exercise.explain }}</p>
      </div>

      <div v-if="showMeta" class="meta">
        <span v-for="k in exercise.knowledge" :key="k" class="tag tag-gray">{{ k }}</span>
        <span class="spacer" />
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ex {
  overflow: hidden;
  transition: border-color 0.2s ease;
}
.ex.solved {
  border-color: #b7e0c2;
}
.head {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 9px 12px;
  background: var(--panel-2);
  border-bottom: 1px solid var(--border);
}
.lv {
  flex: 0 0 auto;
  font-size: 10.5px;
  font-weight: 700;
  font-family: var(--mono);
  padding: 1px 7px;
  border-radius: 999px;
  border: 1px solid;
  line-height: 18px;
  margin-top: 1px;
}
.lv1 {
  color: #1a7f37;
  background: #e9f7ee;
  border-color: #bfe3c9;
}
.lv2 {
  color: #0b5cad;
  background: #e8f2fe;
  border-color: #bcd8f7;
}
.lv3 {
  color: #7a5300;
  background: #fff6df;
  border-color: #eedca6;
}
.lv4 {
  color: #8250df;
  background: #f5f0ff;
  border-color: #e0d4fb;
}
.lv5 {
  color: #b42318;
  background: #fdeceb;
  border-color: #f7c9c4;
}
.prompt {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--text);
}
.body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.blabel {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: var(--text-3);
  margin-bottom: 4px;
}
.input-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.slash {
  color: var(--text-3);
  font-size: 13px;
}
.ans {
  flex: 1;
}
:deep(.ans .el-input__inner) {
  font-family: var(--mono);
  font-size: 13.5px;
}
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.warn {
  color: var(--warn);
}
.hints {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hint {
  font-size: 12.5px;
  background: var(--warn-soft);
  border: 1px solid #f0dfa8;
  border-radius: 6px;
  padding: 6px 10px;
  color: #5c4300;
  line-height: 1.65;
}
.hno {
  font-weight: 700;
  margin-right: 6px;
  color: var(--warn);
}
.feedback {
  border-radius: 6px;
  padding: 9px 11px;
  font-size: 12.5px;
}
.feedback.ok {
  background: var(--success-soft);
  border: 1px solid #bfe3c9;
}
.feedback.bad {
  background: var(--danger-soft);
  border: 1px solid #f7c9cb;
}
.fb-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.feedback.ok .fb-head {
  color: var(--success);
}
.feedback.bad .fb-head {
  color: var(--danger);
}
.icon {
  font-weight: 700;
}
.reason {
  margin: 5px 0 0;
  color: #8a1c24;
  line-height: 1.7;
}
.cmp {
  margin-top: 7px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cmp-row {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.clabel {
  font-size: 10.5px;
  color: var(--text-3);
  min-width: 28px;
}
.cv {
  font-family: var(--mono);
  font-size: 11.5px;
  padding: 0 5px;
  border-radius: 3px;
  border: 1px solid var(--border);
  background: var(--panel);
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cv.hit {
  background: #e9f7ee;
  border-color: #bfe3c9;
  color: var(--success);
}
.cv.miss {
  background: #fdeceb;
  border-color: #f7c9c4;
  color: var(--danger);
  text-decoration: line-through;
}
/* 空匹配不是「一项结果」，单独汇总，不参与逐项对比 */
.cv.empty-chip {
  background: #f6f7f9;
  border-style: dashed;
  color: var(--text-3);
  font-family: var(--sans);
  font-size: 11px;
}
.answer {
  background: var(--panel-2);
  border: 1px dashed var(--border-strong);
  border-radius: 6px;
  padding: 9px 11px;
}
.a-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-3);
  letter-spacing: 0.3px;
}
.a-head code {
  font-size: 12.5px;
  color: #0a3069;
  background: #eef2f8;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 7px;
  word-break: break-all;
}
.explain {
  margin: 6px 0 0;
  font-size: 12.5px;
  color: var(--text-2);
  line-height: 1.75;
}
.solved-explain {
  border-style: solid;
  border-color: #bfe3c9;
  background: #f6fbf7;
}
.inline {
  font-family: var(--mono);
  font-size: 11.5px;
  background: #eef2f8;
  border-radius: 3px;
  padding: 0 4px;
  margin-right: 4px;
}
.meta {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.spacer {
  flex: 1;
}
</style>
