import type { Chapter } from '@/types'

/** 第 05 章 分组 + 第 06 章 或运算 + 第 07 章 转义 */
export const groupChapters: Chapter[] = [
  {
    id: 'grouping',
    no: '05',
    title: '分组',
    subtitle: '把多个字符当成一个整体',
    stage: '第二阶段 · 组合',
    lessons: [
      {
        id: 'group-capture',
        title: '() 捕获分组',
        essence: '括号做了两件事：把里面的内容打包成一个整体（可以加量词），同时把匹配到的内容单独存起来。',
        points: [
          '括号内的内容会被当成"一个元素"，量词作用在整个分组上。',
          '每个左括号（无论是捕获还是命名）都会分配一个编号，从 1 开始。',
          '(ab)+ 和 ab+ 完全不是一回事：(ab)+ 是 "ab" 整体重复，ab+ 只是 b 重复。',
          'group(0) 是整个匹配，group(1) 是第一个括号的内容。'
        ],
        examples: [
          {
            title: '(ab)+ ：整体重复',
            text: 'abababc',
            pattern: '(ab)+',
            goal: '把 ab 打包后重复，一口气吃掉 ababab。group(1) 是最后一次迭代的 ab。',
            expect: ['ababab'],
            groups: ['ab']
          },
          {
            title: 'ab+ ：只有 b 重复',
            text: 'abababc',
            pattern: 'ab+',
            goal: '没有括号，+ 只作用于 b，于是切成 ab、ab、ab 三段。',
            expect: ['ab', 'ab', 'ab']
          }
        ],
        pitfalls: [
          {
            wrong: '以为 (ab)+ 和 ab+ 一样',
            why: '量词只作用于紧邻的前一个元素。有括号时是"分组"，没括号时是"单个字符"'
          }
        ],
        exercises: [
          {
            id: 'group-capture-1',
            level: 3,
            prompt: '匹配"连续出现至少两次的 ab"（例如 abab、ababab）。',
            text: 'ababab abab ab',
            expect: ['ababab', 'abab'],
            answer: '(ab){2,}',
            hints: [
              '题目要的是"ab 这个整体"重复。',
              '先把 ab 打包成一个分组。',
              '再给分组加上"至少两次"的量词：(ab){2,}。'
            ],
            explain: '括号把 ab 打包，{2,} 作用在整个分组上，于是 ababab、abab 整体命中；单独的 ab 只有一组，不满足"至少两次"。',
            knowledge: ['()', '{n,}']
          }
        ]
      },
      {
        id: 'group-noncapture',
        title: '(?:) 非捕获分组',
        essence: '只需要"打包"，不需要"单独取值"时，用 (?:) —— 它不占用捕获组编号。',
        points: [
          '(?:...) 和 (...) 的匹配结果完全一样，区别只在"记不记录分组"。',
          '不占用编号意味着 group(1) 不会被无关的分组挤走。',
          '量词、或运算需要作用域时，优先用 (?:)。'
        ],
        examples: [
          {
            title: '同样的匹配，不占编号',
            text: 'ababab',
            pattern: '(?:ab)+',
            goal: '匹配结果和 (ab)+ 一样是 ababab，但捕获组数量为 0。',
            expect: ['ababab']
          },
          {
            title: '编号被挤走的经典事故',
            text: '2026-10-26',
            pattern: '(?:\\d{4})-(\\d{2})-(\\d{2})',
            goal: '年份用非捕获组，于是月份就是 group(1)、日期是 group(2) —— 编号更符合直觉。',
            expect: ['2026-10-26'],
            groups: ['10', '26']
          }
        ],
        exercises: [
          {
            id: 'group-noncapture-1',
            level: 3,
            prompt: '匹配 "2026-10-26" 这种日期，但只捕获月份和日期（年份不要进捕获组）。',
            text: '2026-10-26',
            expect: ['10', '26'],
            answer: '(?:\\d{4})-(\\d{2})-(\\d{2})',
            mode: 'groups',
            hints: ['年份要参与匹配，但不需要被捕获。', '不捕获的分组写法是 (?:...)。', '(?:\\d{4})-(\\d{2})-(\\d{2})。'],
            explain: '非捕获组让年份"只匹配、不记录"，于是两个捕获组正好是月和日。',
            knowledge: ['(?:)']
          }
        ]
      }
    ]
  },
  {
    id: 'alternation',
    no: '06',
    title: '或运算',
    subtitle: '一个位置，多种可能',
    stage: '第二阶段 · 组合',
    lessons: [
      {
        id: 'alt-pipe',
        title: '| 或',
        essence: '竖线表示"左边整段 或 右边整段"，它的优先级最低 —— 这一点决定了要不要加括号。',
        points: [
          '| 会把左右两边各自当成完整模式来看待。',
          'java|python 会匹配到 javascript 里的 java，这不是 bug。',
          '要给"或"限定范围，用括号：(java|python)开发。',
          '引擎从左往右尝试，左边能匹配就优先用左边。'
        ],
        examples: [
          {
            title: '最基本的或',
            text: 'java python javascript',
            pattern: 'java|python',
            goal: '三处都命中：前两个是完整单词，第三个是 javascript 里的 java。',
            expect: ['java', 'python', 'java']
          },
          {
            title: '用括号限定范围',
            text: 'java开发 python开发 java',
            pattern: '(java|python)开发',
            goal: '括号让"或"只作用于语言名，后面必须跟"开发"，所以单独的 java 不命中。',
            expect: ['java开发', 'python开发'],
            groups: ['java', 'python']
          }
        ],
        exercises: [
          {
            id: 'alt-pipe-1',
            level: 2,
            prompt: '匹配 "cat" 或 "dog"（完整单词即可，不需要边界）。',
            text: 'cat dog cow',
            expect: ['cat', 'dog'],
            answer: 'cat|dog',
            hints: ['两个词是"或者"的关系。', '竖线表示或。', 'cat|dog。'],
            explain: '竖线左右各是一个完整模式，匹配到哪个就返回哪个。',
            knowledge: ['|']
          }
        ]
      },
      {
        id: 'alt-precedence',
        title: '或运算的优先级陷阱',
        essence: '| 的优先级比 ^ $ 和量词都低，所以 ^a|b$ 不等于 ^(a|b)$。',
        points: [
          '^a|b$ 的真实含义是：(^a) 或 (b$)，两边各自带锚点。',
          '^(a|b)$ 才是"整串只能是 a 或 b"。',
          '同样地，ab|cd 是 (ab)|(cd)，不会变成 a(b|c)d。'
        ],
        examples: [
          {
            title: '^a|b$ 到底匹配什么',
            text: 'ab a b',
            pattern: '^a|b$',
            goal: '命中的是开头的 a 和结尾的 b，不是 "ab" 整串 —— 因为或的两边分别是 ^a 和 b$。',
            expect: ['a', 'b']
          },
          {
            title: '加上括号才是整串',
            text: 'ab\na\nb',
            pattern: '^(a|b)$',
            flags: 'gm',
            goal: '现在要求每一行整行只能是 a 或 b，于是 ab 被排除。',
            expect: ['a', 'b']
          }
        ],
        pitfalls: [
          {
            wrong: '用 ^a|b$ 校验"只能是 a 或 b"',
            why: 'ab 也会通过（因为开头是 a），"ba" 也会通过（因为结尾是 b）。必须写成 ^(a|b)$'
          }
        ],
        exercises: [
          {
            id: 'alt-precedence-1',
            level: 3,
            prompt: '校验：整行只能是 GET 或 POST（用 gm 逐行判断）。',
            text: 'GET\nPOST\nGETTING\nPOST /api',
            flags: 'gm',
            expect: ['GET', 'POST'],
            answer: '^(GET|POST)$',
            hints: ['校验整行需要两个锚点。', '或的范围要整个包含在锚点内。', '^(GET|POST)$。'],
            explain: '如果写成 ^GET|POST$，GETTING 会因为开头是 GET 而混进来。括号把或限制在锚点内部。',
            knowledge: ['|', '^', '$', '()']
          }
        ]
      }
    ]
  },
  {
    id: 'escape',
    no: '07',
    title: '转义',
    subtitle: '想匹配元字符本身，就得先"摘掉它的权力"',
    stage: '第二阶段 · 组合',
    lessons: [
      {
        id: 'escape-dot',
        title: '转义符 \\',
        essence: '反斜杠的作用是"取消下一个字符的特殊含义"，让它变成普通字符。',
        points: [
          '. 在正则里是"任意字符"，想匹配真正的句点必须写 \\.。',
          'Java 字符串里还要再转一层，所以最终写成 "\\\\."（Java 专题会细讲）。',
          '也可以把点放进集合 [.]，效果等价且更直观。'
        ],
        examples: [
          {
            title: '不转义：点会通吃',
            text: '3.14 3x14',
            pattern: '3.14',
            goal: '两处都命中 —— 因为 . 匹配了任意字符，3x14 也符合"3 + 任意 + 14"。',
            expect: ['3.14', '3x14']
          },
          {
            title: '转义后：只认真正的点',
            text: '3.14 3x14',
            pattern: '3\\.14',
            goal: '只有 3.14 命中，这才是"匹配小数"该有的行为。',
            expect: ['3.14']
          }
        ],
        pitfalls: [
          {
            wrong: '用 \\d+.\\d+ 提取小数',
            why: '中间的点会匹配任何字符，1a2 也会被当成小数。必须写成 \\d+\\.\\d+'
          }
        ],
        exercises: [
          {
            id: 'escape-dot-1',
            level: 2,
            prompt: '提取文本中的所有小数（小数点必须是真正的点）。',
            text: '价格 19.9 元，编号 1a2，重量 2.5kg',
            expect: ['19.9', '2.5'],
            answer: '\\d+\\.\\d+',
            hints: ['小数点本身需要转义。', '点不转义会匹配任意字符。', '\\d+\\.\\d+。'],
            explain: '1a2 中间是字母，转义后的 \\. 只认同真正的点，所以它被排除。',
            knowledge: ['\\.', '\\d']
          }
        ]
      },
      {
        id: 'escape-meta',
        title: '元字符清单',
        essence: '一共有 12 个元字符：\\ ^ $ . | ? * + ( ) [ ] { }。要匹配它们本身，全部要加反斜杠。',
        points: [
          '记不住也没关系：在编辑器里把"看起来像语法"的字符都转义一遍，最安全。',
          '在方括号内，元字符大多失去特殊含义：[.] [+] [*] 都是字面量。',
          'Java 里反斜杠本身也要转义，所以是 "\\\\("、 "\\\\["。'
        ],
        examples: [
          {
            title: '匹配括号本身',
            text: '(a+b)*(c-d)',
            pattern: '\\(a\\+b\\)',
            goal: '括号和加号都转义了，才匹配到真正的 "(a+b)"。',
            expect: ['(a+b)']
          },
          {
            title: '匹配方括号本身',
            text: '[INFO] 启动 [WARN] 重试',
            pattern: '\\[(\\w+)\\]',
            goal: '方括号转义后匹配真实括号，里面的 \\w+ 用捕获组取出级别。',
            expect: ['[INFO]', '[WARN]'],
            groups: ['INFO', 'WARN']
          }
        ],
        exercises: [
          {
            id: 'escape-meta-1',
            level: 2,
            prompt: '匹配文本中真正的加号 +。',
            text: '1+1=2 a+b',
            expect: ['+', '+'],
            answer: '\\+',
            hints: ['加号在正则里是量词。', '要匹配它本身必须转义。', '\\+。'],
            explain: '+ 不转义会报"量词前面没有内容"的错，转义后才是字面量。',
            knowledge: ['\\+']
          },
          {
            id: 'escape-meta-2',
            level: 3,
            prompt: '提取所有 "[xxx]" 形式的中括号片段（含括号本身）。',
            text: '看到 [INFO] 和 [ERROR] 两个级别',
            expect: ['[INFO]', '[ERROR]'],
            answer: '\\[[A-Z]+\\]',
            hints: ['左右方括号都要转义。', '中间是大写字母。', '\\[[A-Z]+\\]。'],
            explain: '如果不转义，[INFO] 会被当成"字符集合"，含义完全不同 —— 这也是新手最常见的错误之一。',
            knowledge: ['\\[', '\\]']
          }
        ]
      }
    ]
  }
]
