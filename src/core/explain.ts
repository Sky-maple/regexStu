/**
 * 解释层：把 AST 降维成「一行一个 token」的中文说明，再生成一段组合解释。
 * 目标：`^\d{3}-\d{4}$` 必须拆成 6 行，且组合解释要能直接读懂。
 */
import { parsePattern, type ClassItem, type Node, type Quantifier } from './parser'

export interface TokenRow {
  raw: string
  name: string
  detail: string
  depth: number
  kind: string
}

export interface ExplainResult {
  rows: TokenRow[]
  /** 组合解释：按结构重写，而不是 token 拼接 */
  summary: string
  issues: string[]
  captureCount: number
}

const CLASS_TEXT: Record<string, string> = {
  d: '数字',
  D: '非数字字符',
  w: '单词字符（字母、数字、下划线）',
  W: '非单词字符',
  s: '空白字符',
  S: '非空白字符'
}

const CHAR_TEXT: Record<string, string> = {
  n: '换行符',
  r: '回车符',
  t: '制表符',
  f: '换页符',
  v: '垂直制表符',
  '0': '空字符'
}

function classItemText(item: ClassItem): string {
  if (item.type === 'range') return `${item.from} 到 ${item.to}`
  if (item.type === 'char') return `「${item.value}」`
  if (CLASS_TEXT[item.ch]) return CLASS_TEXT[item.ch]
  if (CHAR_TEXT[item.ch]) return CHAR_TEXT[item.ch]
  return `字符「${item.ch}」`
}

function groupName(node: Extract<Node, { type: 'group' }>): string {
  switch (node.kind) {
    case 'capture':
      return `捕获组 ${node.index} 开始`
    case 'named':
      return `命名捕获组 ${node.name} 开始`
    case 'noncapture':
      return '非捕获组开始'
    case 'lookahead':
      return '正向先行断言开始'
    case 'neg-lookahead':
      return '负向先行断言开始'
    case 'lookbehind':
      return '正向后行断言开始'
    case 'neg-lookbehind':
      return '负向后行断言开始'
    default:
      return '分组开始'
  }
}

function groupDetail(node: Extract<Node, { type: 'group' }>): string {
  switch (node.kind) {
    case 'capture':
      return '把里面的内容当成一个整体，同时把匹配到的内容存进 group(' + node.index + ')'
    case 'named':
      return `把里面的内容当成一个整体，并命名为 ${node.name}，可用 group("${node.name}") 取`
    case 'noncapture':
      return '只把里面的内容当成一个整体（配合量词/或运算），不额外占用捕获组编号'
    case 'lookahead':
      return '要求这个位置后面必须能匹配括号里的内容，但括号里的字符不会被消耗'
    case 'neg-lookahead':
      return '要求这个位置后面不能匹配括号里的内容，断言本身不消耗字符'
    case 'lookbehind':
      return '要求这个位置前面必须有括号里的内容，断言本身不消耗字符'
    case 'neg-lookbehind':
      return '要求这个位置前面不能有括号里的内容，断言本身不消耗字符'
    default:
      return ''
  }
}

function quantRow(q: Quantifier, depth: number): TokenRow {
  const lazy = q.lazy ? '，并且尽量少匹配（懒惰模式）' : ''
  let detail = ''
  if (q.min === 0 && q.max === null) detail = '前面的元素出现 0 次或多次 —— 可以一次都不出现'
  else if (q.min === 1 && q.max === null) detail = '前面的元素出现 1 次或多次 —— 至少要有一次'
  else if (q.min === 0 && q.max === 1) detail = '前面的元素出现 0 次或 1 次 —— 可有可无'
  else if (q.max === null) detail = `前面的元素至少连续出现 ${q.min} 次`
  else if (q.min === q.max) detail = `前面的元素必须恰好连续出现 ${q.min} 次`
  else detail = `前面的元素连续出现 ${q.min} 到 ${q.max} 次`
  return {
    raw: q.raw,
    name: q.lazy ? '数量限定符（懒惰）' : '数量限定符',
    detail: detail + lazy,
    depth,
    kind: 'quantifier'
  }
}

function atomRow(node: Node, depth: number): TokenRow | null {
  switch (node.type) {
    case 'literal':
      return {
        raw: node.value,
        name: '普通字符',
        detail: `只能匹配字符「${node.value}」本身`,
        depth,
        kind: 'literal'
      }
    case 'dot':
      return {
        raw: '.',
        name: '任意字符',
        detail: '匹配任意一个字符（默认不含换行符）',
        depth,
        kind: 'dot'
      }
    case 'escape':
      if (node.kind === 'class') {
        return {
          raw: node.raw,
          name: CLASS_TEXT[node.ch] || '字符类',
          detail:
            node.ch === 'd'
              ? '匹配任意一个 0-9 的数字，等价于 [0-9]'
              : node.ch === 'D'
                ? '匹配任意一个「不是数字」的字符，等价于 [^0-9]'
                : node.ch === 'w'
                  ? '匹配任意一个字母、数字或下划线，等价于 [A-Za-z0-9_]'
                  : node.ch === 'W'
                    ? '匹配任意一个不是字母/数字/下划线的字符'
                    : node.ch === 's'
                      ? '匹配任意一个空白字符：空格、\\t、\\n 等'
                      : '匹配任意一个非空白字符',
          depth,
          kind: 'class'
        }
      }
      return {
        raw: node.raw,
        name: '转义字符',
        detail: CHAR_TEXT[node.ch]
          ? `匹配一个${CHAR_TEXT[node.ch]}`
          : `去掉「${node.ch}」的特殊含义，只匹配它本身`,
        depth,
        kind: 'escape'
      }
    case 'boundary':
      return {
        raw: node.raw,
        name: node.ch === 'b' ? '单词边界' : '非单词边界',
        detail:
          node.ch === 'b'
            ? '匹配「单词字符」与「非单词字符」之间的位置，宽度为 0'
            : '匹配一个不是单词边界的位置，宽度为 0',
        depth,
        kind: 'boundary'
      }
    case 'charClass':
      return {
        raw: node.raw,
        name: node.negated ? '字符集合（取反）' : '字符集合',
        detail: node.negated
          ? `匹配任意一个「不在」集合里的字符：${node.items.map(classItemText).join('、') || '空'}`
          : `匹配集合中的任意一个字符：${node.items.map(classItemText).join('、') || '空'}`,
        depth,
        kind: 'class'
      }
    case 'anchor':
      return {
        raw: node.which === 'start' ? '^' : '$',
        name: node.which === 'start' ? '字符串开头' : '字符串结尾',
        detail:
          node.which === 'start'
            ? '要求从这里开始匹配：前面不能再有字符'
            : '要求到这里结束：后面不能再有字符',
        depth,
        kind: 'anchor'
      }
    case 'error':
      return {
        raw: node.raw,
        name: '语法问题',
        detail: node.message,
        depth,
        kind: 'error'
      }
    default:
      return null
  }
}

function walk(nodes: Node[], depth: number, rows: TokenRow[]) {
  for (const node of nodes) {
    if (node.type === 'group') {
      rows.push({
        raw: node.rawOpen,
        name: groupName(node),
        detail: groupDetail(node),
        depth,
        kind: 'group'
      })
      walk(node.body, depth + 1, rows)
      rows.push({
        raw: ')',
        name: '分组结束',
        detail: '这里结束一个分组',
        depth,
        kind: 'group'
      })
      if (node.quant) rows.push(quantRow(node.quant, depth))
      continue
    }
    if (node.type === 'alternation') {
      node.options.forEach((opt, idx) => {
        if (idx > 0) {
          rows.push({
            raw: '|',
            name: '或者',
            detail: '左边整段 或 右边整段，任选其一',
            depth,
            kind: 'alternation'
          })
        }
        walk(opt, depth + 1, rows)
      })
      continue
    }
    const row = atomRow(node, depth)
    if (row) rows.push(row)
    if (node.quant) rows.push(quantRow(node.quant, depth))
  }
}

/* ---------------- 组合解释 ---------------- */

function nounOf(node: Node): string {
  switch (node.type) {
    case 'literal':
      return `「${node.value}」`
    case 'dot':
      return '任意字符'
    case 'escape':
      if (node.ch === 'd') return '数字'
      if (node.ch === 'D') return '非数字字符'
      if (node.ch === 'w') return '单词字符'
      if (node.ch === 'W') return '非单词字符'
      if (node.ch === 's') return '空白字符'
      if (node.ch === 'S') return '非空白字符'
      return CHAR_TEXT[node.ch] || `「${node.ch}」`
    case 'charClass':
      return node.negated
        ? `一个不属于 ${node.raw} 的字符`
        : `一个属于 ${node.raw} 的字符`
    case 'group':
      return `（${describeSequence(node.body)}）`
    case 'alternation':
      return node.options.map((o) => describeSequence(o)).join(' 或者 ')
    case 'anchor':
      return node.which === 'start' ? '开头' : '结尾'
    case 'boundary':
      return node.ch === 'b' ? '单词边界' : '非单词边界'
    case 'error':
      return node.raw
    default:
      return ''
  }
}

function withQuant(noun: string, q?: Quantifier): string {
  if (!q) return noun.startsWith('「') ? noun : `一个${noun}`
  const lazy = q.lazy ? '（尽量少）' : ''
  if (q.min === 0 && q.max === null) return `任意多个${noun}${lazy}`
  if (q.min === 1 && q.max === null) return `一串${noun}（一个或多个）${lazy}`
  if (q.min === 0 && q.max === 1) return `可选的${noun}${lazy}`
  if (q.max === null) return `至少 ${q.min} 个${noun}${lazy}`
  if (q.min === q.max) return `${q.min} 个${noun}${lazy}`
  return `${q.min} 到 ${q.max} 个${noun}${lazy}`
}

function describeSequence(nodes: Node[]): string {
  const parts: string[] = []
  let literalBuffer = ''
  const flushLiteral = () => {
    if (literalBuffer) {
      parts.push(`「${literalBuffer}」`)
      literalBuffer = ''
    }
  }
  for (const node of nodes) {
    if (node.type === 'anchor') continue
    if (node.type === 'literal' && !node.quant && !node.stray) {
      literalBuffer += node.value
      continue
    }
    flushLiteral()
    if (node.type === 'group') {
      let inner = describeSequence(node.body)
      if (node.kind === 'lookahead') inner = `后面必须紧跟 ${inner}（不消耗字符）`
      else if (node.kind === 'neg-lookahead') inner = `后面不能是 ${inner}`
      else if (node.kind === 'lookbehind') inner = `前面必须是 ${inner}`
      else if (node.kind === 'neg-lookbehind') inner = `前面不能是 ${inner}`
      else if (node.kind === 'noncapture') inner = `（${inner}）`
      else inner = `（${inner}）`
      parts.push(withQuant(inner, node.quant).replace(/^一个（/, '（'))
      continue
    }
    if (node.type === 'alternation') {
      const inner = node.options.map((o) => describeSequence(o)).join(' 或者 ')
      parts.push(`（${inner}）`)
      continue
    }
    parts.push(withQuant(nounOf(node), node.quant))
  }
  flushLiteral()
  return parts.join('，接着')
}

/** 生成逐 token 表格 + 组合解释 */
export function explainPattern(pattern: string): ExplainResult {
  if (!pattern) {
    return { rows: [], summary: '还没有输入正则。', issues: [], captureCount: 0 }
  }
  const parsed = parsePattern(pattern)
  const rows: TokenRow[] = []
  walk(parsed.nodes, 0, rows)
  const hasStart = parsed.nodes.some((n) => n.type === 'anchor' && n.which === 'start')
  const hasEnd = parsed.nodes.some((n) => n.type === 'anchor' && n.which === 'end')
  const body = describeSequence(parsed.nodes)
  let summary: string
  if (!body) {
    summary = '这个正则只包含边界断言，没有任何实际字符。'
  } else if (hasStart && hasEnd) {
    summary = `整段文本必须严格是：${body}。多一个字符、少一个字符都不行。`
  } else if (hasStart) {
    summary = `文本必须以 ${body} 开头，后面还可以有其它内容。`
  } else if (hasEnd) {
    summary = `文本必须以 ${body} 结尾，前面还可以有其它内容。`
  } else {
    summary = `在一段文本里寻找：${body}。`
  }
  if (parsed.issues.length) {
    summary += '（注意：这个正则存在语法问题，见下方红色提示）'
  }
  return { rows, summary, issues: parsed.issues, captureCount: parsed.captureCount }
}

/** 只取一行浓缩描述，用于列表/卡片 */
export function briefOf(pattern: string): string {
  try {
    return explainPattern(pattern).summary
  } catch {
    return pattern
  }
}
