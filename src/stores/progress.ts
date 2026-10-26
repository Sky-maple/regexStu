import { computed, reactive, watch } from 'vue'
import type { Exercise, Mistake } from '@/types'
import { chapters, lessons } from '@/data/curriculum'

const STORAGE_KEY = 'regex-lab/progress/v1'

export interface LessonProgress {
  learned: boolean
  attempts: number
  correct: number
  streak: number
  bestStreak: number
  wrong: number
  lastAt: number
}

interface State {
  version: number
  lessons: Record<string, LessonProgress>
  stats: {
    attempts: number
    correct: number
    streak: number
    bestStreak: number
  }
  last: { lessonId: string; title: string; at: number } | null
  mistakes: Mistake[]
}

function emptyLesson(): LessonProgress {
  return { learned: false, attempts: 0, correct: 0, streak: 0, bestStreak: 0, wrong: 0, lastAt: 0 }
}

function defaultState(): State {
  return {
    version: 1,
    lessons: {},
    stats: { attempts: 0, correct: 0, streak: 0, bestStreak: 0 },
    last: null,
    mistakes: []
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as State
    if (!parsed || parsed.version !== 1) return defaultState()
    return {
      ...defaultState(),
      ...parsed,
      lessons: parsed.lessons || {},
      mistakes: parsed.mistakes || []
    }
  } catch {
    return defaultState()
  }
}

export const progress = reactive<State>(load())

let timer: number | undefined
watch(
  progress,
  () => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
      } catch {
        /* 存储满了就算了，不阻塞学习 */
      }
    }, 200)
  },
  { deep: true }
)

export function lessonProgress(lessonId: string): LessonProgress {
  return progress.lessons[lessonId] || emptyLesson()
}

/** 掌握度 0-100：有练习看正确率，只学过给 40 分底 */
export function masteryOf(lessonId: string): number {
  const p = progress.lessons[lessonId]
  if (!p) return 0
  if (!p.attempts) return p.learned ? 40 : 0
  const rate = Math.round((p.correct / p.attempts) * 100)
  return p.learned ? Math.max(40, rate) : Math.min(rate, 40)
}

export function markLearned(lessonId: string) {
  const p = (progress.lessons[lessonId] ||= emptyLesson())
  p.learned = true
  p.lastAt = Date.now()
  const lesson = lessons.find((l) => l.id === lessonId)
  if (lesson) progress.last = { lessonId, title: lesson.title, at: Date.now() }
}

export function recordVisit(lessonId: string) {
  const lesson = lessons.find((l) => l.id === lessonId)
  if (!lesson) return
  progress.last = { lessonId, title: lesson.title, at: Date.now() }
}

/** 记录一次答题：写入全局统计、本节统计、错题本 */
export function recordAnswer(params: {
  lessonId: string
  exercise: Exercise
  correct: boolean
  pattern: string
  reason: string
}) {
  const { lessonId, exercise, correct, pattern, reason } = params
  const p = (progress.lessons[lessonId] ||= emptyLesson())
  p.attempts++
  p.lastAt = Date.now()
  progress.stats.attempts++
  if (correct) {
    p.correct++
    p.streak++
    p.bestStreak = Math.max(p.bestStreak, p.streak)
    progress.stats.correct++
    progress.stats.streak++
    progress.stats.bestStreak = Math.max(progress.stats.bestStreak, progress.stats.streak)
    const m = progress.mistakes.find((x) => x.exerciseId === exercise.id)
    if (m) m.fixed = true
  } else {
    p.wrong++
    p.streak = 0
    progress.stats.streak = 0
    upsertMistake(lessonId, exercise, pattern, reason)
  }
}

function upsertMistake(lessonId: string, exercise: Exercise, pattern: string, reason: string) {
  const lesson = lessons.find((l) => l.id === lessonId)
  const exist = progress.mistakes.find((m) => m.exerciseId === exercise.id)
  if (exist) {
    exist.count++
    exist.myPattern = pattern
    exist.reason = reason
    exist.fixed = false
    exist.at = Date.now()
    return
  }
  const item: Mistake = {
    id: `${exercise.id}-${Date.now()}`,
    exerciseId: exercise.id,
    lessonId,
    lessonTitle: lesson?.title || '',
    prompt: exercise.prompt,
    text: exercise.text,
    level: exercise.level,
    myPattern: pattern,
    answer: exercise.answer,
    reason,
    knowledge: exercise.knowledge,
    count: 1,
    fixed: false,
    at: Date.now(),
    exercise: { ...exercise }
  }
  progress.mistakes.unshift(item)
  if (progress.mistakes.length > 200) progress.mistakes.length = 200
}

export function removeMistake(id: string) {
  const i = progress.mistakes.findIndex((m) => m.id === id)
  if (i >= 0) progress.mistakes.splice(i, 1)
}

export function resetAll() {
  const empty = defaultState()
  Object.assign(progress, empty)
}

/* ---------------- 派生数据 ---------------- */

export const learnedCount = computed(() => Object.values(progress.lessons).filter((l) => l.learned).length)

export const accuracy = computed(() => {
  if (!progress.stats.attempts) return 0
  return Math.round((progress.stats.correct / progress.stats.attempts) * 100)
})

export const mistakeCount = computed(() => progress.mistakes.length)

export function chapterMastery(chapterId: string): number {
  const chapter = chapters.find((c) => c.id === chapterId)
  if (!chapter) return 0
  const sum = chapter.lessons.reduce((acc, l) => acc + masteryOf(l.id), 0)
  return Math.round(sum / Math.max(1, chapter.lessons.length))
}

export const chapterProgress = computed(() =>
  chapters.map((c) => ({
    id: c.id,
    no: c.no,
    title: c.title,
    subtitle: c.subtitle,
    stage: c.stage,
    total: c.lessons.length,
    firstLessonId: c.lessons[0]?.id || '',
    learned: c.lessons.filter((l) => progress.lessons[l.id]?.learned).length,
    mastery: chapterMastery(c.id)
  }))
)

/** 薄弱知识点：错题里出现最多的 knowledge 标签 */
export const weakKnowledge = computed(() => {
  const map = new Map<string, number>()
  for (const m of progress.mistakes) {
    for (const k of m.knowledge) map.set(k, (map.get(k) || 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key, count]) => ({ key, count }))
})

/** 最近学过的章节，用于首页"继续学习" */
export const continueLesson = computed(() => {
  if (progress.last) {
    const l = lessons.find((x) => x.id === progress.last?.lessonId)
    if (l) return l
  }
  return lessons[0]
})
