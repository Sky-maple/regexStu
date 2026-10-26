/**
 * 匹配层：只负责「用浏览器 RegExp 跑出结果」，不做解释。
 * 所有页面（学习页、实验室、练习）都走这里，保证三处看到同一份真相。
 */

export interface MatchInfo {
  /** 完整匹配 group(0) */
  value: string
  /** 起始下标 */
  index: number
  /** 结束下标（不含） */
  end: number
  /** group(1..n)，未参与匹配为 undefined */
  groups: (string | undefined)[]
  /** 命名分组 */
  named: Record<string, string | undefined>
}

export interface RunResult {
  ok: boolean
  error?: string
  matches: MatchInfo[]
  /** 是否因为数量/长度上限被截断 */
  truncated: boolean
  /** 空匹配数量（如 ^、$、(?=x) 产生的位置匹配） */
  zeroWidth: number
}

export const MAX_TEXT_LENGTH = 20000
export const MAX_MATCHES = 500

const FLAG_WHITELIST = 'dgimsuy'

/** 规范化修饰符：去重、去掉非法字符、补上 g */
export function normalizeFlags(flags = ''): string {
  const set = new Set<string>()
  for (const ch of flags) {
    if (FLAG_WHITELIST.includes(ch)) set.add(ch)
  }
  set.add('g')
  return [...set].join('')
}

/** 把 JS 引擎的英文报错翻成人话 */
export function humanizeError(message: string): string {
  const m = message || ''
  if (/Unterminated group/i.test(m)) return '括号没有闭合：检查 ( 与 ) 是否成对'
  if (/Unterminated character class/i.test(m)) return '方括号没有闭合：检查 [ 与 ] 是否成对'
  if (/Nothing to repeat/i.test(m)) return '量词前面没有可重复的内容：* + ? {n} 必须跟在一个字符或分组后面'
  if (/Invalid group/i.test(m)) return '分组语法不合法：检查 (?= (?! (?<= (?<! (?: 的写法'
  if (/Invalid escape/i.test(m)) return '转义不合法：反斜杠后面需要跟一个有效的转义字符'
  if (/Invalid regular expression/i.test(m)) return '正则语法错误：' + m
  if (/Range out of order/i.test(m)) return '字符区间顺序反了：应写成 [a-z] 而不是 [z-a]'
  return '正则语法错误：' + m
}

export interface CompileResult {
  re?: RegExp
  error?: string
}

export function compile(pattern: string, flags = ''): CompileResult {
  if (pattern === '') return { error: '' }
  try {
    return { re: new RegExp(pattern, normalizeFlags(flags)) }
  } catch (e) {
    return { error: humanizeError((e as Error).message) }
  }
}

/** 在文本上执行匹配 */
export function run(pattern: string, flags: string, text: string): RunResult {
  if (!pattern) {
    return { ok: true, matches: [], truncated: false, zeroWidth: 0 }
  }
  const { re, error } = compile(pattern, flags)
  if (!re) {
    return { ok: false, error: error || '正则无效', matches: [], truncated: false, zeroWidth: 0 }
  }
  const src = text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text
  const truncatedText = text.length > MAX_TEXT_LENGTH
  const matches: MatchInfo[] = []
  let truncated = truncatedText
  let zeroWidth = 0
  let guard = 0
  try {
    re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(src)) !== null) {
      const groups = m.slice(1)
      const named: Record<string, string | undefined> = {}
      if (m.groups) {
        for (const [k, v] of Object.entries(m.groups)) named[k] = v
      }
      if (m[0] === '') zeroWidth++
      matches.push({
        value: m[0],
        index: m.index,
        end: m.index + m[0].length,
        groups,
        named
      })
      // 空匹配必须手动推进，否则无限循环
      if (m[0] === '') re.lastIndex++
      guard++
      if (guard >= MAX_MATCHES) {
        truncated = true
        break
      }
    }
    return { ok: true, matches, truncated, zeroWidth }
  } catch (e) {
    return {
      ok: false,
      error: humanizeError((e as Error).message),
      matches,
      truncated,
      zeroWidth
    }
  }
}

/** 单次匹配（等价于 Java 的 matches：整串必须完全匹配） */
export function fullMatch(pattern: string, flags: string, text: string): boolean {
  try {
    const re = new RegExp(pattern, normalizeFlags(flags).replace('g', ''))
    return re.test(text) && new RegExp('^(?:' + pattern + ')$', normalizeFlags(flags).replace('g', '')).test(text)
  } catch {
    return false
  }
}

export interface Segment {
  text: string
  /** 命中第几个匹配，null 表示普通文本 */
  matchIndex: number | null
}

/** 把文本切成「命中 / 未命中」片段，用于高亮渲染 */
export function toSegments(text: string, matches: MatchInfo[]): Segment[] {
  if (!matches.length) return [{ text, matchIndex: null }]
  const segs: Segment[] = []
  let cursor = 0
  matches.forEach((m, i) => {
    if (m.index > cursor) segs.push({ text: text.slice(cursor, m.index), matchIndex: null })
    if (m.value.length > 0) {
      segs.push({ text: text.slice(m.index, m.end), matchIndex: i })
      cursor = m.end
    }
  })
  if (cursor < text.length) segs.push({ text: text.slice(cursor), matchIndex: null })
  return segs
}

/** 粗糙的「回溯风险」提示：嵌套量词 */
export function patternRisk(pattern: string): string | null {
  if (/\([^()]*[+*][^()]*\)[+*]/.test(pattern)) {
    return '这个正则里出现了「量词套量词」，在长文本上可能触发灾难性回溯'
  }
  if (/\(\?[:=!<][^)]*\)[+*]/.test(pattern)) {
    return '这个正则里出现了「量词套量词」，在长文本上可能触发灾难性回溯'
  }
  return null
}
