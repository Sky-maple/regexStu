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
    lessonId: 'extra-flags'
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
  },
  {
    key: '\\b',
    title: '\\b 单词边界',
    kind: 'anchor',
    summary: '单词字符与非单词字符之间的位置，宽度为 0。',
    detail:
      '\\b 不匹配字符，只匹配"缝"。中文不是 \\w，所以中文和英文之间天然有 \\b；下划线是 \\w，所以 order_id 里的 order 不算独立单词。字符类里的 [\\b] 是退格符，不是边界。',
    related: ['\\B', '\\w', '\\border\\b'],
    en: 'word boundary',
    lessonId: 'extra-word-boundary'
  },
  {
    key: '\\B',
    title: '\\B 非单词边界',
    kind: 'anchor',
    summary: '两边同属一类（都是单词字符或都不是）的位置。',
    detail: '常用来只匹配"粘在单词中间"的那一段。\\Bcat 会命中 concat 里的 cat，但不会命中开头的 cat。',
    related: ['\\b'],
    en: 'non-word-boundary',
    lessonId: 'extra-word-boundary'
  },
  {
    key: '\\1',
    title: '\\1 反向引用',
    kind: 'concept',
    summary: '要求这里出现的内容，与第 1 个捕获组刚捕获到的完全一致。',
    detail:
      '引用的是运行时捕获到的文本，不是那段正则。(\\w)\\1 能匹配 aa、bb，不会匹配 ab。编号按左括号出现顺序数；命名组用 \\k<name> 更不容易数错。',
    related: ['()', '\\k<>', '(\\w)\\1', '\\b(\\w+)\\s+\\1\\b'],
    en: 'backreference',
    lessonId: 'extra-backreference'
  },
  {
    key: '(?<>)',
    title: '(?<名字>) 命名分组',
    kind: 'group',
    summary: '给捕获组起名字，取值时不再靠编号。',
    detail:
      'JS 用 match.groups.year，Java 用 matcher.group("year")。命名组照样占编号，顺序仍是从左到右数左括号。组数超过 3 个时强烈建议命名。',
    related: ['()', '\\k<>', '(?:)'],
    en: 'named group',
    lessonId: 'extra-named-group'
  },
  {
    key: '\\k<>',
    title: '\\k<名字> 命名反向引用',
    kind: 'concept',
    summary: '按名字引用之前捕获的内容，等价于 \\1 但可读。',
    detail: '常见于成对标签、成对引号：<(?<tag>\\w+)>[^<]*</\\k<tag>> 能排除名字对不上的闭合标签。',
    related: ['\\1', '(?<>)'],
    en: 'named backreference',
    lessonId: 'extra-named-group'
  },
  {
    key: '\\p{}',
    title: '\\p{...} Unicode 属性类',
    kind: 'class',
    summary: '按 Unicode 官方分类匹配字符，必须配 u 修饰符。',
    detail:
      '\\p{Script=Han} 是汉字，\\p{L} 是所有字母，\\p{Nd} 是所有十进制数字（含全角），\\p{P} 是标点。\\P{...} 是取反。不带 u 会直接编译报错。',
    related: ['\\P{}', 'u', '[\\u4e00-\\u9fa5]'],
    en: 'unicode property',
    lessonId: 'extra-unicode'
  },
  {
    key: '\\u',
    title: '码位转义 \\x41 \\u4e00 \\u{1F600}',
    kind: 'class',
    summary: '用十六进制码位表示字符。',
    detail:
      '\\xNN 两位、\\uNNNN 四位、\\u{...} 需 u 修饰符（emoji 必须用它）。[\\u4e00-\\u9fa5] 只覆盖 CJK 基本区，更稳的是 \\p{Script=Han}。',
    related: ['\\x', '\\p{}', 'u'],
    en: 'hex escape',
    lessonId: 'extra-escape-codes'
  },
  {
    key: 'u',
    title: 'u 修饰符（Unicode）',
    kind: 'flag',
    summary: '启用 Unicode 模式，\\p{...} 和 \\u{...} 都依赖它。',
    detail: '不开 u 时 \\p{L} 会直接报错，emoji 也会被当成两个代理字符。注意 u 并不会让 \\w 认识中文。',
    related: ['\\p{}', '\\u', 's'],
    en: 'unicode flag',
    lessonId: 'extra-flags'
  },
  {
    key: 'y',
    title: 'y 修饰符（粘性 sticky）',
    kind: 'flag',
    summary: '要求下一次匹配必须紧接上一次的结束位置，不允许跳过。',
    detail: 'g 会跳过不合格的位置继续找，y 一跳不过就整体停止。逐字符扫描、词法分析场景常用 y。',
    related: ['g', 'lastIndex'],
    en: 'sticky',
    lessonId: 'trick-lastindex'
  },
  {
    key: '??',
    title: '懒惰量词 ?? +? {n,m}?',
    kind: 'quantifier',
    summary: '任意量词后加 ? 就变成"先试最少"。',
    detail:
      '?? 是能不要就不要，所以常匹配空串；{2,4}? 每次只取 2 个。懒惰只改变优先顺序，不改变能否匹配。',
    related: ['.*?', '.+?', '{n,m}'],
    lessonId: 'extra-lazy-all'
  },
  {
    key: 'lastIndex',
    title: 'lastIndex 与 g 修饰符的状态',
    kind: 'concept',
    summary: '带 g / y 的正则对象有状态，反复 test() 结果会变。',
    detail:
      '第一次 test 成功会把 lastIndex 推进，第二次可能就 false 了。解法：每次新建正则、手动 lastIndex = 0、或用 matchAll。另外所有匹配都不重叠，aa 在 aaa 上只有 1 个。',
    related: ['g', 'y'],
    en: 'lastIndex',
    lessonId: 'trick-lastindex'
  },
  {
    key: 'ReDoS',
    title: '灾难性回溯（ReDoS）',
    kind: 'concept',
    summary: '嵌套量词让回溯路径指数爆炸，几十个字符就能打满 CPU。',
    detail:
      '(a+)+、(a|a)+、(.*)* 都是危险形状。解法：让两层字符互斥（[^"\\\\] 与 \\\\.）、加锚点、限制输入长度，Java 可用原子组 (?>...) 或占有量词 *+。',
    related: ['(a+)+', '[^]'],
    en: 'catastrophic backtracking redos',
    lessonId: 'trick-redos'
  },
  {
    key: '\\Q...\\E',
    title: '\\Q...\\E（Java 专有）',
    kind: 'meta',
    summary: 'Java 里让中间整段按字面量处理，不用逐个转义。',
    detail: '浏览器不支持这条语法，只能手动把 . + * ? ( ) [ ] 等转义。跨引擎迁移正则时要特别注意。',
    related: ['Java 转义', '\\'],
    en: 'quote literal',
    lessonId: 'extra-engine-diff'
  },
  {
    key: '\\A \\z',
    title: '\\A \\z 绝对首尾（Java 专有）',
    kind: 'anchor',
    summary: 'Java 的绝对开头和绝对结尾，不受 MULTILINE 影响。',
    detail:
      'Java 的 $ 默认也匹配结尾换行符之前，所以 "abc$" 在 "abc\\n" 上能命中；想匹配真正的字符串末尾要用 \\z。浏览器没有 \\A \\z，用不带 m 的 ^ $。',
    related: ['^', '$', '\\Q...\\E'],
    en: 'absolute anchor',
    lessonId: 'extra-engine-diff'
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
  replaceall: 'find()',
  'word boundary': '\\b',
  backreference: '\\1',
  'named group': '(?<>)',
  'named backreference': '\\k<>',
  'unicode property': '\\p{}',
  unicode: 'u',
  sticky: 'y',
  redos: 'ReDoS',
  'catastrophic backtracking': 'ReDoS',
  'atomic group': 'ReDoS',
  quote: '\\Q...\\E'
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
