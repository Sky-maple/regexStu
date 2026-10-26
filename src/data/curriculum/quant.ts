import type { Chapter } from '@/types'

/** 第 03 章 数量限定符 + 第 04 章 边界 */
export const quantChapters: Chapter[] = [
  {
    id: 'quantifier',
    no: '03',
    title: '数量限定符',
    subtitle: '控制"出现几次"，正则才真正有用',
    stage: '第一阶段 · 地基',
    lessons: [
      {
        id: 'quant-star',
        title: '* 零次或多次',
        essence: '* 表示前面的元素"可以一次都不出现"，也可以出现很多次。',
        points: [
          '* 的作用范围只有它前面那"一个元素"（一个字符、一个集合、或一个分组）。',
          '它能匹配空串，所以用 * 的地方经常出现"空匹配"。',
          '需要"至少一次"时用 +，不要用 *。'
        ],
        examples: [
          {
            title: 'b 可有可无',
            text: 'ac abc abbc',
            pattern: 'ab*c',
            goal: '三个都命中：ac 是 0 个 b，abc 是 1 个，abbc 是 2 个。',
            expect: ['ac', 'abc', 'abbc']
          },
          {
            title: '作用范围只有前一个字符',
            text: 'abc abbc',
            pattern: 'ab*c',
            goal: '把 * 放在 c 后面就是另一个意思了（abc* 表示 c 可以重复）。量词永远只作用于紧邻的前一个元素。',
            expect: ['abc', 'abbc']
          }
        ],
        pitfalls: [
          {
            wrong: '以为 ab*c 会匹配 "abbbbc" 之外的 "ac" 很奇怪',
            why: '这正是 * 的定义：0 次也算匹配。不想允许 0 次就用 +'
          }
        ],
        exercises: [
          {
            id: 'quant-star-1',
            level: 2,
            prompt: '匹配 "ac"、"abc"、"abbc"，但不匹配 "adc"。',
            text: 'ac abc abbc adc',
            expect: ['ac', 'abc', 'abbc'],
            answer: 'ab*c',
            hints: ['三个目标只差中间 b 的数量，其中一个还完全没有 b。', '允许 0 次重复的量词是 *。', '写成 ab*c。'],
            explain: 'b* 表示 b 可以出现 0 次或多次，于是 ac 也符合形状；adc 中间是 d，不在描述范围内。',
            knowledge: ['*']
          }
        ]
      },
      {
        id: 'quant-plus',
        title: '+ 一次或多次',
        essence: '+ 表示"至少一次"：空的内容它不认。',
        points: [
          '+ 是提取连续数字、连续字母最常用的量词：\\d+、\\w+。',
          '它会尽量多吃（贪婪），遇到第一个不符合的字符才停。',
          '和 * 的唯一区别就是"允不允许 0 次"。'
        ],
        examples: [
          {
            title: '至少要有一个 b',
            text: 'ac abc abbc',
            pattern: 'ab+c',
            goal: 'ac 不再命中（0 个 b 不行），剩下两个命中。',
            expect: ['abc', 'abbc']
          },
          {
            title: '最常用的组合：\\d+',
            text: '订单 20261026 共 3 件',
            pattern: '\\d+',
            goal: '连续数字整段吃下，这就避免了把 20261026 拆成 8 个字符。',
            expect: ['20261026', '3']
          }
        ],
        exercises: [
          {
            id: 'quant-plus-1',
            level: 1,
            prompt: '提取所有连续数字（每段数字必须至少 1 位）。',
            text: 'abc123def456',
            expect: ['123', '456'],
            answer: '\\d+',
            hints: ['数字用 \\d。', '要"连续"就是重复至少一次。', '\\d+。'],
            explain: '\\d+ 从第一个数字开始，一直吃到非数字，所以 123、456 各自成段。',
            knowledge: ['+', '\\d']
          },
          {
            id: 'quant-plus-2',
            level: 2,
            prompt: '匹配一个或多个 a，后面紧跟一个 b。',
            text: 'b aab aaab ab',
            expect: ['aab', 'aaab', 'ab'],
            answer: 'a+b',
            hints: ['a 的数量不确定，但至少一个。', '用 + 表示"一个或多个"。', 'a+b。'],
            explain: '开头的 b 没有前置 a，不匹配；aab、aaab、ab 都符合"若干 a + 一个 b"。',
            knowledge: ['+']
          }
        ]
      },
      {
        id: 'quant-question',
        title: '? 零次或一次',
        essence: '? 表示"可有可无"，最多一个。它同时还有另一个身份：懒惰量词的后缀。',
        points: [
          'x? 等价于 x{0,1}，常用于可选字符：colou?r。',
          '它紧跟在另一个量词后面时（如 *?），含义完全变了 —— 那是懒惰模式。',
          '不要用它表达"多个里有一个"，那是 [] 的事。'
        ],
        examples: [
          {
            title: '可选字母',
            text: 'color colour colouur',
            pattern: 'colou?r',
            goal: 'u 可以有 0 个或 1 个：color、colour 命中，colouur（两个 u）不命中。',
            expect: ['color', 'colour']
          },
          {
            title: '可选负号',
            text: '3 -5 +7 12',
            pattern: '-?\\d+',
            goal: '负号可有可无，于是 -5 和 12、7 都能命中（7 前面的 + 不在匹配内）。',
            expect: ['3', '-5', '7', '12']
          }
        ],
        exercises: [
          {
            id: 'quant-question-1',
            level: 2,
            prompt: '匹配所有整数，允许前面带一个可选的负号。',
            text: '3 -5 +7 12 -30',
            expect: ['3', '-5', '7', '12', '-30'],
            answer: '-?\\d+',
            hints: ['负号只是"可能有"，不是必须有。', '可选就是 0 次或 1 次。', '-?\\d+。'],
            explain: '负号用 -? 表达可选；+7 里的加号不在模式中，所以只匹配到 7。',
            knowledge: ['?', '\\d']
          }
        ]
      },
      {
        id: 'quant-exact',
        title: '{n} 恰好 n 次',
        essence: '{n} 要求前面的元素"精确重复 n 次"，多一个少一个都不行。',
        points: [
          '{3} 就是"连续三个"，比写三遍更清楚。',
          '它只约束紧邻的前一个元素，所以要约束一组字符必须先用分组。',
          '超出部分不会被吃掉，会留给后面的匹配或直接忽略。'
        ],
        examples: [
          {
            title: '只能吃 3 位',
            text: '编号 12，编号 345，编号 6789',
            pattern: '\\d{3}',
            goal: '12 不够 3 位被跳过；345 整段命中；6789 只吃掉前 3 位 678，剩下的 9 不符合"连续 3 位"所以被丢掉。',
            expect: ['345', '678']
          },
          {
            title: '固定格式：日期',
            text: '2026-10-26 与 2026-1-6',
            pattern: '\\d{4}-\\d{2}-\\d{2}',
            goal: '用位数把格式卡死：2026-1-6 位数不对，匹配不上。',
            expect: ['2026-10-26']
          }
        ],
        pitfalls: [
          {
            wrong: '用 \\d{3} 去匹配 6789 整段',
            why: '\\d{3} 只吃 3 个字符，这是它的定义。想匹配"3 位以上"要用 {3,}'
          }
        ],
        exercises: [
          {
            id: 'quant-exact-1',
            level: 2,
            prompt: '提取所有"恰好 4 位"的数字片段。',
            text: '2026 202 20261 7',
            expect: ['2026', '2026'],
            answer: '\\d{4}',
            hints: ['"恰好 4 位"要精确控制重复次数。', '精确次数的写法是 {4}。', '\\d{4}。'],
            explain: '202 只有 3 位不够；20261 有 5 位，\\d{4} 只吃前 4 位；7 只有 1 位。',
            knowledge: ['{n}', '\\d']
          }
        ]
      },
      {
        id: 'quant-range',
        title: '{n,m} 区间次数',
        essence: '{n,m} 表示"至少 n 次，最多 m 次"，引擎默认会尽量取到 m（贪婪）。',
        points: [
          '\\d{3,5} 会优先吃 5 位，不够才退到 4 位、3 位。',
          '上限 m 可以省略写成 {n,}，表示"至少 n 次"。',
          '位数要求严格时不要用 {3,6}，它会接受 4、5 位。'
        ],
        examples: [
          {
            title: '贪婪地取最长',
            text: '1 12 123 1234 12345 123456',
            pattern: '\\d{3,5}',
            goal: '每个数字都取到允许的最长：123、1234、12345；123456 只能吃 5 位，剩下 6 被丢弃。',
            expect: ['123', '1234', '12345', '12345']
          },
          {
            title: '0 的情况怎么办',
            text: '5 55 555',
            pattern: '\\d{2,3}',
            goal: '至少 2 位，所以单独的 5 不匹配。',
            expect: ['55', '555']
          }
        ],
        exercises: [
          {
            id: 'quant-range-1',
            level: 2,
            prompt: '提取长度为 2 到 3 位的数字片段。',
            text: '1 12 123 1234',
            expect: ['12', '123', '123'],
            answer: '\\d{2,3}',
            hints: ['长度是一个范围。', '范围的写法是 {最小,最大}。', '\\d{2,3}。'],
            explain: '1234 会贪心地吃掉前 3 位得到 123，剩下的 4 只有 1 位，不够 2 位，被丢弃。',
            knowledge: ['{n,m}']
          }
        ]
      },
      {
        id: 'quant-open',
        title: '{n,} 至少 n 次',
        essence: '{n,} 只设下限不设上限：从 n 位一直到无限长都算。',
        points: [
          '{3,} 等价于"3 位及以上"，常用于"编号至少 3 位"。',
          '{0,} 和 * 等价，{1,} 和 + 等价。',
          '上限不设时，贪婪会把整段同类字符全吃掉。'
        ],
        examples: [
          {
            title: '3 位及以上',
            text: '1 12 123 1234 123456',
            pattern: '\\d{3,}',
            goal: '只要够 3 位就整段吃掉，所以 123456 是完整的一段。',
            expect: ['123', '1234', '123456']
          },
          {
            title: '与 + 的关系',
            text: 'abc123',
            pattern: '[a-z]{1,}',
            goal: '[a-z]{1,} 和 [a-z]+ 完全等价，只是写法更啰嗦。',
            expect: ['abc']
          }
        ],
        exercises: [
          {
            id: 'quant-open-1',
            level: 2,
            prompt: '提取长度至少 2 位的数字片段。',
            text: '5 55 555 5555',
            expect: ['55', '555', '5555'],
            answer: '\\d{2,}',
            hints: ['只有下限，没有上限。', '写法是 {2,}，逗号后面留空。', '\\d{2,}。'],
            explain: '{2,} 表示 2 位或更多，所以 5 被排除，其余整段吃掉。',
            knowledge: ['{n,}']
          }
        ]
      },
      {
        id: 'quant-compare',
        title: '对比：+、*、? 到底差在哪',
        essence: '三者的区别只有一条：允不允许"零次"。+ 至少一次，* 零次也行，? 最多一次。',
        points: [
          '* 和 ? 都能匹配空串，所以结果列表里会出现空匹配 —— 这不是 bug。',
          '+ 不会产生空匹配，提取类任务优先用它。',
          '同一段文本、三个正则并排看，差别一眼就能看出来（实验室的"对比模式"就是干这个的）。'
        ],
        examples: [
          {
            title: '\\d+：一串数字',
            text: 'abc123',
            pattern: '\\d+',
            goal: '只有一处：123，长度不定但不为空。',
            expect: ['123']
          },
          {
            title: '\\d?：每个位置最多取一个数字',
            text: 'abc123',
            pattern: '\\d?',
            goal:
              '注意结果里除了 1、2、3，还夹着好几个空匹配 —— 因为 ? 允许"零次"，每个非数字位置都算"匹配到一个空"。这正是 ? 与 + 的关键差别。',
            expect: ['', '', '', '1', '2', '3', '']
          },
          {
            title: '\\d*：会匹配出空串',
            text: 'abc123',
            pattern: '\\d*',
            goal: '注意结果是 5 个：3 个空匹配 + 123 + 末尾空匹配。空匹配说明"零次也算"。',
            expect: ['', '', '', '123', '']
          }
        ],
        pitfalls: [
          {
            wrong: '用 \\d* 提取数字，结果拿到一堆空字符串',
            why: '* 允许 0 次，所以每个"没有数字"的位置都算一次匹配。提取场景应该用 +'
          }
        ],
        exercises: [
          {
            id: 'quant-compare-1',
            level: 3,
            prompt: '文本里有一段可能为空的数字（比如 "数量:" 后面可能没有数字）。请只把"真正有数字"的部分取出来，空的情况不要产生匹配。',
            text: '数量: 42 备注:',
            expect: ['42'],
            answer: '\\d+',
            hints: ['不能用允许 0 次的量词。', '* 会让空位置也产生匹配。', '用 + 保证至少一位。'],
            explain: '\\d* 会额外产生空匹配，\\d+ 只在真有数字时命中 —— 这就是"提取"场景几乎总用 + 的原因。',
            knowledge: ['*', '+', '?']
          }
        ]
      }
    ]
  },
  {
    id: 'boundary',
    no: '04',
    title: '边界',
    subtitle: '从"包含"到"必须整串符合"',
    stage: '第一阶段 · 地基',
    lessons: [
      {
        id: 'anchor-start',
        title: '^ 字符串开头',
        essence: '^ 不是匹配字符，是匹配"位置"：要求从这里开始。',
        points: [
          '^ 的宽度是 0，它不消耗任何字符。',
          '没有 m 修饰符时，^ 只认整个字符串的开头。',
          '^ 放在方括号里（[^abc]）是取反，含义完全不同。'
        ],
        examples: [
          {
            title: '必须以 abc 开头',
            text: 'abc abcdef xabc',
            pattern: '^abc',
            goal: '只有第一个命中（在位置 0）。xabc 虽然包含 abc，但不在开头。',
            expect: ['abc']
          },
          {
            title: '行首匹配（多行模式）',
            text: 'ERROR 连接失败\nINFO 启动成功',
            pattern: '^ERROR',
            flags: 'gm',
            goal: '加上 m 后，每一行的行首都会生效 —— 逐行判断日志级别就靠它。',
            expect: ['ERROR']
          }
        ],
        exercises: [
          {
            id: 'anchor-start-1',
            level: 2,
            prompt: '只匹配"以 ERROR 开头"的行（flags 已给 gm）。',
            text: 'INFO 启动\nERROR 连接超时\nWARN 重试',
            flags: 'gm',
            expect: ['ERROR'],
            answer: '^ERROR',
            hints: ['要的是"开头"，不是"包含"。', '开头用 ^。', '^ERROR。'],
            explain: 'm 让 ^ 匹配每一行开头，只有第二行满足。如果去掉 m，则只有整段文本开头才算。',
            knowledge: ['^', 'm']
          }
        ]
      },
      {
        id: 'anchor-end',
        title: '$ 字符串结尾',
        essence: '$ 也是位置：要求到这里结束，后面不能再有字符。',
        points: [
          '没有 m 时，$ 只认整个字符串的结尾（或结尾换行之前）。',
          '有 m 时，$ 匹配每一行的行尾。',
          '要匹配字符 "$" 本身必须写 \\$。'
        ],
        examples: [
          {
            title: '必须以 abc 结尾',
            text: 'abc abcdef defabc',
            pattern: 'abc$',
            goal: '只有 defabc 的结尾命中；abcdef 虽然是 abc 开头，但结尾不是 abc。',
            expect: ['abc']
          },
          {
            title: '取每行末尾的数字',
            text: 'order 100\norder 200\norder 300',
            pattern: '\\d+$',
            flags: 'gm',
            goal: 'm 让 $ 在每行末尾生效，三行各取到自己的数字。',
            expect: ['100', '200', '300']
          }
        ],
        exercises: [
          {
            id: 'anchor-end-1',
            level: 2,
            prompt: '提取每一行末尾的数字（flags 已给 gm）。',
            text: 'a 12\nb 345\nc 6x',
            flags: 'gm',
            expect: ['12', '345'],
            answer: '\\d+$',
            hints: ['要的是"行尾的数字"。', '行尾用 $，多行模式已经开启。', '\\d+$。'],
            explain: 'c 6x 这一行末尾是 x，不是数字，所以 $ 前必须是数字这条规则把它排除了。',
            knowledge: ['$', 'm']
          }
        ]
      },
      {
        id: 'anchor-both',
        title: '^...$ 整串匹配',
        essence: '同时加 ^ 和 $，才是"整段文本必须完全符合这个形状"。',
        points: [
          '只写 abc 是"包含"，写 ^abc$ 才是"等于"。',
          '校验类场景（手机号、身份证、订单号）几乎都要两个锚点。',
          'Java 的 matches() 天然相当于加了 ^...$，find() 才是"包含"。'
        ],
        examples: [
          {
            title: '包含 vs 等于',
            text: 'abc\nabcd\n xabc',
            pattern: '^abc$',
            flags: 'gm',
            goal: '只有第一行完全等于 abc。abcd 多了 d， xabc 前面有空格 —— 都不符合"整行只能是 abc"。',
            expect: ['abc']
          },
          {
            title: '校验日期格式',
            text: '2026-10-26\n2026-10-2\n2026-10-26 15:30',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            flags: 'gm',
            goal: '每一位都卡死：位数不对、多出时间的行都不通过。',
            expect: ['2026-10-26']
          }
        ],
        pitfalls: [
          {
            wrong: '校验订单号时只写 SO\\d+',
            why: '这样 "备注：SO123" 也会通过。校验必须加 ^...$'
          }
        ],
        exercises: [
          {
            id: 'anchor-both-1',
            level: 3,
            prompt: '校验：整行必须是一个 11 位手机号（1 开头）。只保留合法的行。',
            text: '13800138000\n1380013800\n21380013800\n13912345678',
            flags: 'gm',
            expect: ['13800138000', '13912345678'],
            answer: '^1\\d{10}$',
            hints: ['校验要卡住整行。', '1 开头 + 后面 10 位数字 = 11 位。', '^1\\d{10}$。'],
            explain: '^ 和 $ 保证整行只有这 11 位；第二行少一位，第三行开头不是 1，都不通过。',
            knowledge: ['^', '$', '{n}']
          }
        ]
      },
      {
        id: 'anchor-multiline',
        title: 'm 修饰符：逐行匹配',
        essence: 'm（multiline）改变了 ^ 和 $ 的含义：从"整串的头尾"变成"每一行的头尾"。',
        points: [
          '不加 m：^ 只在整段开头，$ 只在整段结尾。',
          '加上 m：每一行都能有自己的 ^ 和 $。',
          '解析多行日志、逐行校验配置时，m 几乎是必选项。'
        ],
        examples: [
          {
            title: '逐行取时间戳',
            text: '2026-10-26 15:30:25 [INFO] start\n2026-10-26 15:31:02 [WARN] slow',
            pattern: '^\\d{4}-\\d{2}-\\d{2}',
            flags: 'gm',
            goal: '两行都被命中；如果不加 m，只会有第一行。',
            expect: ['2026-10-26', '2026-10-26']
          },
          {
            title: '取出整行内容',
            text: 'ERROR 连接失败\nINFO 启动成功',
            pattern: '^.*ERROR.*$',
            flags: 'gm',
            goal: '^ 和 $ 配合 .* 就是"整行"。注意 . 默认不跨行，正好帮我们限制在一行内。',
            expect: ['ERROR 连接失败']
          }
        ],
        exercises: [
          {
            id: 'anchor-multiline-1',
            level: 3,
            prompt: '逐行匹配以 [WARN] 或 [ERROR] 开头的日志行，把整行取出来。',
            text: '[INFO] 启动\n[WARN] 队列积压\n[ERROR] 连接失败',
            flags: 'gm',
            expect: ['[WARN] 队列积压', '[ERROR] 连接失败'],
            answer: '^\\[(?:WARN|ERROR)\\].*$',
            hints: ['方括号是特殊字符，要转义才能匹配字面量。', '要"整行"，需要 ^ 和 $ 以及 .*。', '^\\[(?:WARN|ERROR)\\].*$。'],
            explain: '\\[ ... \\] 匹配真正的方括号，非捕获组列出两个级别，.* 吃掉后面的内容，^ $ 把范围锁在一行内。',
            knowledge: ['m', '^', '$', '(?:)']
          }
        ]
      }
    ]
  }
]
