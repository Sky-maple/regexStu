/**
 * 判定层：只看「结果对不对」，不看「写法像不像标准答案」。
 * 并给出人话错因 —— 这是练习模式最值钱的部分。
 */
import type { Exercise } from '@/types'
import { run } from './regex'

export interface JudgeResult {
  correct: boolean
  /** 正则本身有语法错误时的提示 */
  error?: string
  /** 归一化后的实际结果 */
  actual: string[]
  expect: string[]
  /** 错因分析（正确时为空串） */
  reason: string
}

function normalizeOf(ex: Exercise, pattern: string): { ok: boolean; error?: string; actual: string[] } {
  const r = run(pattern, ex.flags || 'g', ex.text)
  if (!r.ok) return { ok: false, error: r.error, actual: [] }
  const mode = ex.mode || 'matches'
  if (mode === 'count') return { ok: true, actual: [String(r.matches.length)] }
  if (mode === 'groups') {
    // 所有匹配的 group(1..n) 依次展平
    return { ok: true, actual: r.matches.flatMap((m) => m.groups.map((g) => (g === undefined ? '' : g))) }
  }
  return { ok: true, actual: r.matches.map((m) => m.value) }
}

function sameArray(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

const META = /[\\^$.*+?()[\]{}|]/

function analysisOf(ex: Exercise, pattern: string, actual: string[], r: ReturnType<typeof run>): string {
  const expect = ex.expect
  const mode = ex.mode || 'matches'

  if (!pattern.trim()) {
    return '还没有写正则。先想清楚：你要找的东西长什么样？'
  }
  if (!r.ok) {
    return `正则没编译通过：${r.error}。先把语法修对，再看结果。`
  }
  if (r.matches.length === 0) {
    return '这个正则在题面文本里一个都没匹配到。可能是字符类型不对（数字/字母/空白），也可能是边界或大小写卡住了。'
  }
  if (mode === 'count') {
    return `题目要的是 ${expect[0]} 个匹配，你的正则得到 ${actual[0]} 个。数一数是不是多算了或漏算了。`
  }

  const shorter = actual.every((a) => expect.some((e) => e !== a && e.includes(a)))
  if (shorter && actual.length >= expect.length) {
    return `你把一个整体拆成了 ${actual.length} 段：${actual.slice(0, 5).join('、')}。题目要的是完整的 ${expect.slice(0, 3).join('、')}。检查数量限定符 —— 你是不是只匹配了「一个」？`
  }
  if (actual.length > expect.length) {
    const extra = actual.filter((a) => !expect.includes(a))
    return `匹配过头了：你多匹配到 ${extra.slice(0, 4).map((s) => `「${s}」`).join('、')}。题目只要 ${expect.map((s) => `「${s}」`).join('、')}，想想怎么把范围收紧。`
  }
  if (actual.length < expect.length) {
    const missing = expect.filter((e) => !actual.includes(e))
    return `漏了 ${missing.length} 个：${missing.slice(0, 4).map((s) => `「${s}」`).join('、')} 没被匹配到。看看这些目标的共同点（位置、前后字符、长度）。`
  }
  if (mode === 'groups') {
    return `捕获组内容不对：你拿到 ${actual.map((s) => `「${s}」`).join('、')}，题目要 ${expect.map((s) => `「${s}」`).join('、')}。检查括号是否括在了正确的位置。`
  }
  const wrong = actual.filter((a) => !expect.includes(a))
  return `数量对了，但内容不对：${wrong.slice(0, 4).map((s) => `「${s}」`).join('、')} 不是题目要的。注意前后文约束。`
}

export function judge(ex: Exercise, pattern: string): JudgeResult {
  const r = run(pattern, ex.flags || 'g', ex.text)
  const { ok, error, actual } = normalizeOf(ex, pattern)
  if (!ok) {
    return {
      correct: false,
      error,
      actual: [],
      expect: ex.expect,
      reason: `正则没编译通过：${error}`
    }
  }
  const correct = sameArray(actual, ex.expect)
  // 兜底：写死具体文本
  if (!correct && !META.test(pattern) && actual.length > 0 && actual.every((a) => ex.expect.includes(a))) {
    return {
      correct: false,
      actual,
      expect: ex.expect,
      reason: `你的正则 ${pattern} 是把这段文本「写死」了。题目要求换一段同类文本也能正确匹配，想一想这类内容的共同特征。`
    }
  }
  return {
    correct,
    actual,
    expect: ex.expect,
    reason: correct ? '' : analysisOf(ex, pattern, actual, r)
  }
}

/** 结果对比的高亮：期望 vs 实际 */
export function diffSets(actual: string[], expect: string[]) {
  return {
    hit: expect.filter((e) => actual.includes(e)),
    missing: expect.filter((e) => !actual.includes(e)),
    extra: actual.filter((a) => !expect.includes(a))
  }
}
