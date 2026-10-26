import type { GlossaryEntry } from '@/types'

/** 全局搜索用的知识点词条 */
export const glossary: GlossaryEntry[] = [
  {
    key: '\\d',
    title: '\\d 数字字符',
    kind: 'class',
    summary: '匹配任意一个 0-9 的数字，等价于 [0-9]。',
    detail: '单个 \\d 只占一个字符的位置，要匹配一串数字必须写 \\d+。中文、全角数字都不算。',
    related: ['[0-9]', '\\d+', '\\d{3}', 'Java 中的 "\\\\d"'],
    lessonId: 'basic-digit'
  },
  {
    key: '\\D',
    title: '\\D 非数字字符',
    kind: 'class',
    summary: '匹配任意一个不是数字的字符，等价于 [^0-9]。',
    detail: '包含字母、标点、空格、换行、汉字。\\D+ 会连续吃掉所有非数字字符。',
    related: ['[^0-9]', '\\D+'],
    lessonId: 'basic-nondigit'
  },
  {
    key: '\\w',
    title: '\\w 单词字符',
    kind: 'class',
    summary: '字母、数字、下划线，等价于 [A-Za-z0-9_]。',
    detail: '中文不在 \\w 里（JS 与 Java 默认都是 ASCII 语义），所以 [\\w]+ 拿不到中文。',
    related: ['[a-zA-Z0-9_]', '\\W'],
    lessonId: 'basic-word'
  },
  {
    key: '\\W',
    title: '\\W 非单词字符',
    kind: 'class',
    summary: '不是字母、数字、下划线的字符。',
    detail: '空格、符号、标点、汉字都属于 \\W。常用来切分键值对。',
    related: ['\\w', '[^A-Za-z0-9_]'],
    lessonId: 'basic-nonword'
  },
  {
    key: '\\s',
    title: '\\s 空白字符',
    kind: 'class',
    summary: '空格、制表符 \\t、换行 \\n、回车 \\r 等。',
    detail: '\\s+ 是压缩多余空白的标准写法。Java 的 \\s 默认不包含全角空格。',
    related: ['\\S', '\\s+'],
    lessonId: 'basic-space'
  },
  {
    key: '\\S',
    title: '\\S 非空白字符',
    kind: 'class',
    summary: '任何不是空白的字符。',
    detail: '\\S+ 等价于"按空白切词"，比 split 更灵活，且会保留标点。',
    related: ['\\s', '\\S+'],
    lessonId: 'basic-nonspace'
  },
  {
    key: '.',
    title: '. 任意字符',
    kind: 'meta',
    summary: '匹配任意一个字符，默认不含换行。',
    detail: '只占一个位置。想匹配真正的点要写 \\.；想跨行要加 s 修饰符。',
    related: ['\\.', '.*', '.*?'],
    lessonId: 'basic-dot'
  },
  {
    key: '*',
    title: '* 零次或多次',
    kind: 'quantifier',
    summary: '前面的元素可以出现 0 次或多次。',
    detail: '允许 0 次，所以会产生空匹配。作用范围只有紧邻的前一个元素。',
    related: ['+', '?', '.*'],
    lessonId: 'quant-star'
  },
  {
    key: '+',
    title: '+ 一次或多次',
    kind: 'quantifier',
    summary: '前面的元素至少出现一次。',
    detail: '提取类任务几乎都用 +，因为不会产生空匹配。',
    related: ['*', '\\d+', '\\w+'],
    lessonId: 'quant-plus'
  },
  {
    key: '?',
    title: '? 零次或一次',
    kind: 'quantifier',
    summary: '前面的元素可有可无，最多一次。',
    detail: '跟在其它量词后面时含义不同：*?、+? 表示懒惰模式。',
    related: ['colou?r', '*?', '+?'],
    lessonId: 'quant-question'
  },
  {
    key: '{n}',
    title: '{n} 恰好 n 次',
    kind: 'quantifier',
    summary: '前面的元素精确重复 n 次。',
    detail: '\\d{3} 只能吃 3 个数字，多出来的字符不会被匹配。',
    related: ['\\d{3}', '{n,m}', '{n,}'],
    lessonId: 'quant-exact'
  },
  {
    key: '{n,m}',
    title: '{n,m} 区间次数',
    kind: 'quantifier',
    summary: '至少 n 次，最多 m 次，默认贪婪取最长。',
    detail: '\\d{3,5} 会优先吃 5 位。要严格"3 位或 6 位"必须用或运算。',
    related: ['{n}', '{n,}'],
    lessonId: 'quant-range'
  },
  {
    key: '{n,}',
    title: '{n,} 至少 n 次',
    kind: 'quantifier',
    summary: '只设下限：至少 n 次，上不封顶。',
    detail: '{0,} 等价于 *，{1,} 等价于 +。',
    related: ['+', '*'],
    lessonId: 'quant-open'
  },
  {
    key: '[]',
    title: '[] 字符集合',
    kind: 'meta',
    summary: '方括号表示"任选一个"：[abc] 是这个位置可以是 a/b/c。',
    detail: '只占一个字符位置。集合内的元字符大多失去特殊含义，但 \\ 转义和 - 区间仍然有效。',
    related: ['[a-z]', '[0-9]', '[^abc]'],
    lessonId: 'set-intro'
  },
  {
    key: '[^]',
    title: '[^...] 取反集合',
    kind: 'meta',
    summary: '除了集合里的字符，其它都要。',
    detail: '^ 必须在方括号内第一个位置才是取反。常用于排除分隔符：[^/]+ 取路径段。',
    related: ['[^0-9]', '\\D'],
    lessonId: 'set-negated'
  },
  {
    key: '[0-9]',
    title: '[0-9] 数字区间',
    kind: 'class',
    summary: '和 \\d 完全等价。',
    detail: '区间写法更明确，也方便和其它字符混用：[0-9a-f]。',
    related: ['\\d', '[a-f]'],
    lessonId: 'set-range-digit'
  },
  {
    key: '[a-z]',
    title: '[a-z] 小写区间',
    kind: 'class',
    summary: '任意一个小写字母。',
    detail: '连字符只有放在中间才是区间；放开头或结尾表示减号本身。',
    related: ['[A-Z]', '[a-zA-Z]'],
    lessonId: 'set-range-lower'
  },
  {
    key: '^',
    title: '^ 字符串开头',
    kind: 'anchor',
    summary: '要求从这里开始匹配，宽度为 0。',
    detail: '不加 m 时只认整串开头；加 m 后每行开头都生效。在方括号内是取反。',
    related: ['$', '^abc$', 'm'],
    lessonId: 'anchor-start'
  },
  {
    key: '$',
    title: '$ 字符串结尾',
    kind: 'anchor',
    summary: '要求到这里结束，宽度为 0。',
    detail: '要匹配真正的美元符号必须写 \\$。校验场景通常 ^ 与 $ 同时出现。',
    related: ['^', '^abc$'],
    lessonId: 'anchor-end'
  },
  {
    key: '()',
    title: '() 捕获组',
    kind: 'group',
    summary: '把内容打包成一个整体，同时把匹配结果存进 group(n)。',
    detail: '编号按左括号出现顺序从 1 开始。group(0) 是整个匹配。量词作用于分组时，group 只保留最后一次迭代。',
    related: ['(?:)', '(ab)+', 'group(1)'],
    lessonId: 'group-capture'
  },
  {
    key: '(?:)',
    title: '(?:) 非捕获组',
    kind: 'group',
    summary: '只打包，不占用捕获组编号。',
    detail: '匹配结果和普通分组一致，区别只在于不记录 group。需要量词作用域时优先用它。',
    related: ['()', '(?:ab)+'],
    lessonId: 'group-noncapture'
  },
  {
    key: '|',
    title: '| 或运算',
    kind: 'meta',
    summary: '左边整段 或 右边整段，任选其一。',
    detail: '优先级最低：^a|b$ 等于 (^a)|(b$)。要限定范围必须加括号。',
    related: ['(a|b)', '^a|b$'],
    lessonId: 'alt-pipe'
  },
  {
    key: '\\',
    title: '\\ 转义符',
    kind: 'meta',
    summary: '取消下一个字符的特殊含义，让它变成普通字符。',
    detail: '12 个元字符要匹配本身都得转义。Java 字符串里还要再转一层：\\. 写成 "\\\\."。',
    related: ['\\.', '\\+', '\\[', 'Java 转义'],
    lessonId: 'escape-dot'
  },
  {
    key: '\\.',
    title: '\\. 匹配真正的点',
    kind: 'meta',
    summary: '把"任意字符"降级成"就是句点"。',
    detail: '3.14 会匹配 3x14，3\\.14 才是真正的小数。也可以用 [.]。',
    related: ['.', '[.]'],
    lessonId: 'escape-dot'
  },
  {
    key: '(?=)',
    title: '(?=) 正向先行断言',
    kind: 'group',
    summary: '要求后面必须紧跟括号里的内容，但不消耗字符。',
    detail: '\\d+(?=元) 的结果不含"元"。可链式叠加做密码强度校验。',
    related: ['(?!)', '(?<=)', '\\d+(?=元)'],
    lessonId: 'lookahead'
  },
  {
    key: '(?!)',
    title: '(?!) 负向先行断言',
    kind: 'group',
    summary: '要求后面不能是括号里的内容。',
    detail: 'Java(?!Script) 会排除 JavaScript，但不会排除 JavaSE。',
    related: ['(?=)', '(?<!)'],
    lessonId: 'neg-lookahead'
  },
  {
    key: '(?<=)',
    title: '(?<=) 正向后行断言',
    kind: 'group',
    summary: '要求前面必须是括号里的内容，不消耗字符。',
    detail: '提取"某个 key 后面的值"最顺手：(?<=userId=)\\d+。Java 要求后行断言宽度可确定。',
    related: ['(?<!)', '(?=)'],
    lessonId: 'lookbehind'
  },
  {
    key: '(?<!)',
    title: '(?<!) 负向后行断言',
    kind: 'group',
    summary: '要求前面不能是括号里的内容。',
    detail: '最容易写错的一种。只排除单个字符会导致"半截匹配"，要把数字、点一起排除。',
    related: ['(?<=)', '(?!)'],
    lessonId: 'neg-lookbehind'
  },
  {
    key: '.*?',
    title: '.*? 懒惰匹配',
    kind: 'quantifier',
    summary: '尽可能少地匹配：吃到最近能满足条件的位置就停。',
    detail: '<a>.*?</a> 能取出每个独立标签，而 .* 会把两段标签合成一个匹配。',
    related: ['.*', '+?', '贪婪'],
    lessonId: 'greedy-vs-lazy'
  },
  {
    key: '贪婪',
    title: '贪婪 vs 懒惰',
    kind: 'concept',
    summary: '量词默认贪婪（尽量长），加 ? 后变懒惰（尽量短）。',
    detail: '贪婪先吃到最远再回退；懒惰先试最短再往后扩。两者"能匹配什么"相同，只是优先长度不同。',
    related: ['.*', '.*?', '*?'],
    lessonId: 'greedy-vs-lazy'
  },
  {
    key: '捕获组',
    title: '捕获组与 group(n)',
    kind: 'concept',
    summary: 'group(0) 是整个匹配，group(1..n) 按左括号顺序编号。',
    detail: '没参与匹配的组是 undefined（Java 是 null）。字段提取的核心工具。',
    related: ['()', '(?:)', 'group(1)'],
    lessonId: 'capture-numbering'
  },
  {
    key: '元字符',
    title: '元字符清单',
    kind: 'concept',
    summary: '\\ ^ $ . | ? * + ( ) [ ] { } 共 12 个。',
    detail: '它们在正则里有特殊含义，要匹配本身必须加 \\。在方括号内大多失效。',
    related: ['\\', '转义'],
    lessonId: 'escape-meta'
  },
  {
    key: 'g',
    title: 'g 修饰符（全局匹配）',
    kind: 'flag',
    summary: '找出所有匹配，而不是找到第一个就停。',
    detail: '本工具默认开启 g。Java 里没有这个 flag，靠 while (matcher.find()) 达到同样效果。',
    related: ['i', 'm', 'find()'],
    lessonId: 'java-find-vs-matches'
  },
  {
    key: 'i',
    title: 'i 修饰符（忽略大小写）',
    kind: 'flag',
    summary: '不区分大小写。',
    detail: 'Java 对应 Pattern.CASE_INSENSITIVE。SQL 关键字匹配场景常开。',
    related: ['g', 'm'],
    lessonId: 'basic-literal'
  },
  {
    key: 'm',
    title: 'm 修饰符（多行）',
    kind: 'flag',
    summary: '让 ^ 和 $ 匹配每一行的开头和结尾。',
    detail: '解析多行日志、逐行校验配置时必开。Java 对应 Pattern.MULTILINE。',
    related: ['^', '$', 'g'],
    lessonId: 'anchor-multiline'
  },
  {
    key: 's',
    title: 's 修饰符（dotAll）',
    kind: 'flag',
    summary: '让 . 也能匹配换行符。',
    detail: '默认 . 不匹配 \\n，需要跨行匹配整段内容时开启。Java 对应 Pattern.DOTALL。',
    related: ['.', '.*'],
    lessonId: 'basic-dot'
  },
  {
    key: 'Java 转义',
    title: 'Java 双层转义',
    kind: 'concept',
    summary: '正则 \\d+ 在 Java 字符串里要写成 "\\\\d+"。',
    detail: '第一层给编译器（字符串字面量），第二层给正则引擎。正则里每个 \\ 在 Java 源码里都要写两个。',
    related: ['\\', 'Pattern', 'Matcher'],
    lessonId: 'java-double-escape'
  },
  {
    key: 'find()',
    title: 'Matcher.find() 与 matches()',
    kind: 'concept',
    summary: 'find() 找"包含"，matches() 要求"整串"。',
    detail: '同一正则，find() 成功时 matches() 可能失败。校验格式用 matches()，搜索文本用 find()。',
    related: ['Java 转义', 'group(1)'],
    lessonId: 'java-find-vs-matches'
  }
]

/** 英文关键词 → 词条 key，让「lookbehind」「quantifier」也能搜到 */
const EN_ALIASES: Record<string, string> = {
  lookbehind: '(?<=)',
  lookahead: '(?=)',
  'negative lookahead': '(?!)',
  'negative lookbehind': '(?<!)',
  quantifier: '{n,m}',
  greedy: '贪婪',
  lazy: '.*?',
  capture: '捕获组',
  group: '()',
  anchor: '^',
  boundary: '^',
  digit: '\\d',
  whitespace: '\\s',
  word: '\\w',
  escape: '\\',
  flag: 'g',
  multiline: 'm',
  dotall: 's',
  matcher: 'find()',
  pattern: 'find()',
  replaceall: 'find()'
}

export function searchGlossary(keyword: string): GlossaryEntry[] {
  const k = keyword.trim().toLowerCase()
  if (!k) return []
  const hits = glossary.filter((e) => {
    const hay = `${e.key} ${e.title} ${e.summary} ${e.detail} ${e.en || ''} ${(e.related || []).join(' ')}`.toLowerCase()
    return hay.includes(k)
  })
  if (k.length >= 3) {
    for (const [en, key] of Object.entries(EN_ALIASES)) {
      if (en.includes(k) || k.includes(en)) {
        const entry = glossary.find((e) => e.key === key)
        if (entry && !hits.includes(entry)) hits.unshift(entry)
      }
    }
  }
  return hits
}
