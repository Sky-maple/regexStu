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
  /** 实际结果里「空匹配」（长度为 0）的个数，单独统计，不混进结果项 */
  actualEmpty: number
  /** 错因分析（正确时为空串） */
  reason: string
}

/** 只保留真正取到内容的结果项；空匹配单独计数，不参与数量比较 */
function contentOf(actual: string[]): string[] {
  return actual.filter((v) => v !== '')
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

function analysisOf(
  ex: Exercise,
  pattern: string,
  actual: string[],
  emptyCount: number,
  r: ReturnType<typeof run>
): string {
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

  const content = contentOf(actual)

  // 内容全对，只是多出了空匹配 —— * 和 ? 最典型的坑，单独讲清楚
  if (emptyCount > 0 && sameArray(content, expect)) {
    const fix = /\*/.test(pattern) ? '把 * 换成 +' : /\?/.test(pattern) ? '把 ? 换成 +' : '换成至少要求一次的写法'
    return `内容都取对了，但你还多出 ${emptyCount} 处空匹配（长度为 0）。量词允许「零次」时，每个匹配不到字符的位置也会成功命中一次空串 —— 所以结果项数被撑大了。提取内容不要用允许零次的量词：${fix}。`
  }

  const shorter = content.length > 0 && content.every((a) => expect.some((e) => e !== a && e.includes(a)))
  if (shorter && content.length >= expect.length) {
    return `你把一个整体拆成了 ${content.length} 段：${content.slice(0, 5).join('、')}。题目要的是完整的 ${expect.slice(0, 3).join('、')}。检查数量限定符 —— 你是不是只匹配了「一个」？`
  }

  const extra = content.filter((a) => !expect.includes(a))
  const missing = expect.filter((e) => !content.includes(e))
  const emptyTail =
    emptyCount > 0 ? `（另外还多出 ${emptyCount} 处空匹配，长度都是 0，这是量词允许「零次」的表现。）` : ''
  const q = (arr: string[], n = 4) => arr.slice(0, n).map((s) => `「${s}」`).join('、')

  // 既有多余又有缺失：不是「多吃了」，而是形状本身就不对，逐项对比更有用
  if (extra.length && missing.length) {
    return `形状不对：你匹配到 ${q(extra)}，题目要的是 ${q(missing)}。逐项对比一下差在哪 —— 是不是多了/少了一个字符，或者首尾用错了？${emptyTail}`
  }
  if (extra.length) {
    return `匹配过头了：你多匹配到 ${q(extra)}。题目只要 ${expect.map((s) => `「${s}」`).join('、')}，想想怎么把范围收紧。${emptyTail}`
  }
  if (missing.length) {
    return `漏了 ${missing.length} 个：${q(missing)} 没被匹配到。看看这些目标的共同点（位置、前后字符、长度）。${emptyTail}`
  }
  if (mode === 'groups') {
    return `捕获组内容不对：你拿到 ${content.map((s) => `「${s}」`).join('、')}，题目要 ${expect.map((s) => `「${s}」`).join('、')}。检查括号是否括在了正确的位置。`
  }
  const wrong = content.filter((a) => !expect.includes(a))
  return `数量对了，但内容不对：${q(wrong)} 不是题目要的。注意前后文约束。`
}

export function judge(ex: Exercise, pattern: string): JudgeResult {
  const r = run(pattern, ex.flags || 'g', ex.text)
  const mode = ex.mode || 'matches'
  const { ok, error, actual } = normalizeOf(ex, pattern)
  if (!ok) {
    return {
      correct: false,
      error,
      actual: [],
      expect: ex.expect,
      actualEmpty: 0,
      reason: `正则没编译通过：${error}`
    }
  }
  // 空匹配只在「提取所有匹配」模式下单独统计；捕获组里的空串是空捕获，不是零宽匹配
  const actualEmpty = mode === 'matches' ? actual.filter((v) => v === '').length : 0
  const correct = sameArray(actual, ex.expect)
  // 兜底：写死具体文本
  const content = contentOf(actual)
  if (!correct && !META.test(pattern) && content.length > 0 && content.every((a) => ex.expect.includes(a))) {
    return {
      correct: false,
      actual,
      expect: ex.expect,
      actualEmpty,
      reason: `你的正则 ${pattern} 是把这段文本「写死」了。题目要求换一段同类文本也能正确匹配，想一想这类内容的共同特征。`
    }
  }
  return {
    correct,
    actual,
    expect: ex.expect,
    actualEmpty,
    reason: correct ? '' : analysisOf(ex, pattern, actual, actualEmpty, r)
  }
}

/** 结果对比：期望 vs 实际（空匹配不算作具体结果项） */
export function diffSets(actual: string[], expect: string[]) {
  const content = contentOf(actual)
  return {
    hit: expect.filter((e) => content.includes(e)),
    missing: expect.filter((e) => !content.includes(e)),
    extra: content.filter((a) => !expect.includes(a))
  }
}
