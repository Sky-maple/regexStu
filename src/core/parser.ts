/**
 * 解析层：把正则串拆成 AST，只为「解释」服务，不参与匹配。
 * 支持：字面量、.、转义类、字符集、分组（捕获/非捕获/四种断言/命名）、
 *      或运算、锚点、边界、量词（含懒惰）以及常见语法错误。
 */

export type GroupKind =
  | 'capture'
  | 'noncapture'
  | 'lookahead'
  | 'neg-lookahead'
  | 'lookbehind'
  | 'neg-lookbehind'
  | 'named'

export interface Quantifier {
  min: number
  max: number | null
  lazy: boolean
  raw: string
}

export type ClassItem =
  | { type: 'char'; value: string }
  | { type: 'range'; from: string; to: string }
  | { type: 'escape'; ch: string; raw: string }

interface NodeBase {
  quant?: Quantifier
}

export type Node = NodeBase &
  (
    | { type: 'literal'; value: string; stray?: boolean }
    | { type: 'dot' }
    | { type: 'escape'; ch: string; raw: string; kind: 'class' | 'char' }
    | { type: 'boundary'; ch: string; raw: string }
    | { type: 'backref'; raw: string; ref: number | string }
    | { type: 'unicodeProp'; raw: string; negated: boolean; prop: string }
    | { type: 'code'; raw: string; char: string; cp: number }
    | { type: 'charClass'; negated: boolean; items: ClassItem[]; raw: string; closed: boolean }
    | {
        type: 'group'
        kind: GroupKind
        index?: number
        name?: string
        body: Node[]
        rawOpen: string
        closed: boolean
      }
    | { type: 'anchor'; which: 'start' | 'end' }
    | { type: 'alternation'; options: Node[][] }
    | { type: 'error'; raw: string; message: string }
  )

export interface ParseResult {
  nodes: Node[]
  captureCount: number
  /** 结构性问题（例如括号未闭合），用于解释区提示 */
  issues: string[]
}

const CLASS_ESCAPES = 'dDwWsS'
const CHAR_ESCAPES = 'nrtfv0'

export function parsePattern(pattern: string): ParseResult {
  let i = 0
  let captureCount = 0
  const issues: string[] = []
  const len = pattern.length

  const peek = (offset = 0) => pattern[i + offset]

  function parseAlternation(): Node[] {
    const options: Node[][] = [parseSequence()]
    while (i < len && pattern[i] === '|') {
      i++
      options.push(parseSequence())
    }
    return options.length === 1 ? options[0] : [{ type: 'alternation', options }]
  }

  function parseSequence(): Node[] {
    const nodes: Node[] = []
    while (i < len) {
      const ch = pattern[i]
      if (ch === ')' || ch === '|') break
      const atom = parseAtom()
      if (!atom) continue
      // 量词吸附
      const q = parseQuantifier()
      if (q) {
        if (atom.type === 'anchor' || atom.type === 'error') {
          issues.push('量词前面没有可重复的内容：' + q.raw)
        } else {
          atom.quant = q
        }
      }
      nodes.push(atom)
    }
    return nodes
  }

  function parseQuantifier(): Quantifier | null {
    const ch = pattern[i]
    if (ch === '*' || ch === '+' || ch === '?') {
      i++
      const min = ch === '+' ? 1 : 0
      const max = ch === '?' ? 1 : null
      let lazy = false
      if (pattern[i] === '?') {
        lazy = true
        i++
      }
      return { min, max, lazy, raw: ch + (lazy ? '?' : '') }
    }
    if (ch === '{') {
      const rest = pattern.slice(i)
      const m = /^\{(\d+)(?:,(\d*))?\}/.exec(rest)
      if (m) {
        i += m[0].length
        const min = parseInt(m[1], 10)
        const max = m[2] === undefined ? min : m[2] === '' ? null : parseInt(m[2], 10)
        let lazy = false
        if (pattern[i] === '?') {
          lazy = true
          i++
        }
        return { min, max, lazy, raw: m[0] + (lazy ? '?' : '') }
      }
    }
    return null
  }

  function parseEscapeChar(): Node {
    const start = i
    i++ // skip backslash
    const ch = pattern[i]
    if (ch === undefined) {
      issues.push('正则以单个反斜杠结尾')
      return { type: 'error', raw: '\\', message: '反斜杠后面缺少转义字符' }
    }
    i++
    let raw = pattern.slice(start, i)
    if (CLASS_ESCAPES.includes(ch)) {
      return { type: 'escape', ch, raw, kind: 'class' }
    }
    if (ch === 'b' || ch === 'B') {
      return { type: 'boundary', ch, raw }
    }
    // 反向引用：\1 \2 … 以及命名写法 \k<name>
    if (ch >= '1' && ch <= '9') {
      while (i < len && pattern[i] >= '0' && pattern[i] <= '9') i++
      raw = pattern.slice(start, i)
      return { type: 'backref', raw, ref: parseInt(raw.slice(1), 10) }
    }
    if (ch === 'k' && pattern[i] === '<') {
      const close = pattern.indexOf('>', i)
      if (close > 0) {
        const name = pattern.slice(i + 1, close)
        i = close + 1
        raw = pattern.slice(start, i)
        return { type: 'backref', raw, ref: name }
      }
      issues.push('命名反向引用的写法应是 \\k<名字>')
    }
    // Unicode 属性类：\p{L} \P{Han} 等，必须配 u 修饰符
    if ((ch === 'p' || ch === 'P') && pattern[i] === '{') {
      const close = pattern.indexOf('}', i)
      if (close > 0) {
        const prop = pattern.slice(i + 1, close)
        i = close + 1
        raw = pattern.slice(start, i)
        return { type: 'unicodeProp', raw, negated: ch === 'P', prop }
      }
      issues.push('Unicode 属性类的写法应是 \\p{...}')
    }
    // 码位转义：\x41、\u4e00、\u{1F600}
    if (ch === 'x' || ch === 'u') {
      let hex = ''
      if (ch === 'x') {
        const m = /^[0-9a-fA-F]{2}/.exec(pattern.slice(i))
        if (m) {
          hex = m[0]
          i += 2
        }
      } else if (pattern[i] === '{') {
        const m = /^\{([0-9a-fA-F]{1,6})\}/.exec(pattern.slice(i))
        if (m) {
          hex = m[1]
          i += m[0].length
        }
      } else {
        const m = /^[0-9a-fA-F]{4}/.exec(pattern.slice(i))
        if (m) {
          hex = m[0]
          i += 4
        }
      }
      if (hex) {
        const cp = parseInt(hex, 16)
        raw = pattern.slice(start, i)
        let char = ''
        try {
          char = String.fromCodePoint(cp)
        } catch {
          char = ''
        }
        return { type: 'code', raw, char, cp }
      }
    }
    return { type: 'escape', ch, raw, kind: 'char' }
  }

  /**
   * 读字符类里的一个单元：普通字符、转义类，或 \x41 / \u4e00 / \u{1F600} 这类码位。
   * 码位在类里会被解码成真实字符，这样 [\u4e00-\u9fa5] 才能被正确识别成"一 到 龥"这个区间，
   * 而不是被当成 u、4、e、0 几个独立字符 —— 否则解释区会给出完全错误的说明。
   */
  function readClassUnit(): ClassItem | null {
    const start = i
    if (pattern[i] !== '\\') {
      const value = pattern[i]
      i++
      return { type: 'char', value }
    }
    const ch = pattern[i + 1]
    if (ch === undefined) {
      issues.push('字符集里有悬空的反斜杠')
      i++
      return null
    }
    if (ch === 'x' || ch === 'u') {
      let hex = ''
      let consumed = 0
      if (ch === 'x') {
        const m = /^[0-9a-fA-F]{2}/.exec(pattern.slice(i + 2))
        if (m) {
          hex = m[0]
          consumed = 4
        }
      } else if (pattern[i + 2] === '{') {
        const m = /^\{([0-9a-fA-F]{1,6})\}/.exec(pattern.slice(i + 2))
        if (m) {
          hex = m[1]
          consumed = 2 + m[0].length
        }
      } else {
        const m = /^[0-9a-fA-F]{4}/.exec(pattern.slice(i + 2))
        if (m) {
          hex = m[0]
          consumed = 6
        }
      }
      if (hex) {
        const cp = parseInt(hex, 16)
        let char = ''
        try {
          char = String.fromCodePoint(cp)
        } catch {
          char = ''
        }
        if (char) {
          i += consumed
          return { type: 'char', value: char }
        }
      }
    }
    i += 2
    return { type: 'escape', ch, raw: pattern.slice(start, i) }
  }

  function parseCharClass(): Node {
    const start = i
    i++ // skip [
    let negated = false
    if (pattern[i] === '^') {
      negated = true
      i++
    }
    const items: ClassItem[] = []
    let first = true
    let closed = false
    while (i < len) {
      if (pattern[i] === ']' && !first) {
        closed = true
        i++
        break
      }
      first = false
      const unit = readClassUnit()
      if (!unit) break
      // 区间 a-z（'-' 在末尾时是字面量）
      if (pattern[i] === '-' && pattern[i + 1] !== undefined && pattern[i + 1] !== ']') {
        i++ // skip '-'
        const to = readClassUnit()
        if (!to) break
        if (unit.type === 'char' && to.type === 'char') {
          items.push({ type: 'range', from: unit.value, to: to.value })
        } else {
          items.push(unit, { type: 'char', value: '-' }, to)
        }
        continue
      }
      items.push(unit)
    }
    if (!closed) issues.push('方括号没有闭合：[ 缺少配对的 ]')
    return { type: 'charClass', negated, items, raw: pattern.slice(start, i), closed }
  }

  function parseGroup(): Node {
    const start = i
    let kind: GroupKind = 'capture'
    let name: string | undefined
    let rawOpen = '('
    if (pattern.startsWith('(?:', i)) {
      kind = 'noncapture'
      i += 3
      rawOpen = '(?:'
    } else if (pattern.startsWith('(?=', i)) {
      kind = 'lookahead'
      i += 3
      rawOpen = '(?='
    } else if (pattern.startsWith('(?!', i)) {
      kind = 'neg-lookahead'
      i += 3
      rawOpen = '(?!'
    } else if (pattern.startsWith('(?<=', i)) {
      kind = 'lookbehind'
      i += 4
      rawOpen = '(?<='
    } else if (pattern.startsWith('(?<!', i)) {
      kind = 'neg-lookbehind'
      i += 4
      rawOpen = '(?<!'
    } else if (pattern.startsWith('(?<', i)) {
      const close = pattern.indexOf('>', i)
      if (close > 0) {
        kind = 'named'
        name = pattern.slice(i + 3, close)
        i = close + 1
        rawOpen = `(?<${name}>`
      } else {
        i += 1
        issues.push('命名分组的写法应是 (?<名字>...)')
      }
    } else {
      i += 1
    }
    if (kind === 'capture' || kind === 'named') captureCount++
    const index = kind === 'capture' || kind === 'named' ? captureCount : undefined
    const body = parseAlternation()
    let closed = false
    if (pattern[i] === ')') {
      closed = true
      i++
    } else {
      issues.push('括号没有闭合：' + rawOpen + ' 缺少配对的 )')
    }
    const rawLen = pattern.slice(start, i).length
    void rawLen
    return { type: 'group', kind, index, name, body, rawOpen, closed }
  }

  function parseAtom(): Node | null {
    const ch = pattern[i]
    if (ch === '(') return parseGroup()
    if (ch === '[') return parseCharClass()
    if (ch === '\\') return parseEscapeChar()
    if (ch === '.') {
      i++
      return { type: 'dot' }
    }
    if (ch === '^') {
      i++
      return { type: 'anchor', which: 'start' }
    }
    if (ch === '$') {
      i++
      return { type: 'anchor', which: 'end' }
    }
    if (ch === '*' || ch === '+' || ch === '?') {
      i++
      return { type: 'error', raw: ch, message: `这里出现的 ${ch} 前面没有可重复的内容` }
    }
    if (ch === '{') {
      const m = /^\{\d+(,\d*)?\}/.exec(pattern.slice(i))
      if (m) {
        i += m[0].length
        return { type: 'error', raw: m[0], message: `${m[0]} 前面没有可重复的内容` }
      }
    }
    i++
    return { type: 'literal', value: ch }
  }

  const nodes = parseAlternation()
  return { nodes, captureCount, issues }
}

/** 统计顶层锚点，用于组合解释的语气判断 */
export function anchorsOf(nodes: Node[]): { start: boolean; end: boolean } {
  return {
    start: nodes.some((n) => n.type === 'anchor' && n.which === 'start'),
    end: nodes.some((n) => n.type === 'anchor' && n.which === 'end')
  }
}
