import type { Chapter } from '@/types'

/** 第 08 章 贪婪与非贪婪 + 第 09 章 捕获组 + 第 10 章 前瞻后顾 */
export const advancedChapters: Chapter[] = [
  {
    id: 'greedy',
    no: '08',
    title: '贪婪与非贪婪',
    subtitle: '量词默认"能拿多少拿多少"',
    stage: '第三阶段 · 进阶',
    lessons: [
      {
        id: 'greedy-vs-lazy',
        title: '.* 与 .*?',
        essence: '量词默认贪婪（尽量长）；在量词后加一个 ? 就变懒惰（尽量短）。',
        points: [
          '.* 会先吃到最远的能满足条件的位置，再往回退。',
          '.*? 会先尝试最短，然后一点点往后扩，直到能满足后面的条件。',
          '同一个文本，贪婪得到一个长匹配，懒惰得到多个短匹配 —— 这是最直观的区别。',
          '懒惰不是"不匹配"，只是"优先短"。'
        ],
        examples: [
          {
            title: '贪婪：一口气吃到最后一个',
            text: '<a>123</a><a>456</a>',
            pattern: '<a>.*</a>',
            goal: '.* 先把整行吃光，然后回退到"最后一个 </a>"，于是两段标签被合成一个匹配。',
            expect: ['<a>123</a><a>456</a>']
          },
          {
            title: '懒惰：吃到最近的结束标签就停',
            text: '<a>123</a><a>456</a>',
            pattern: '<a>.*?</a>',
            goal: '.*? 每次只多吃一个字符，一旦后面能接上 </a> 就立刻收手，于是得到两段。',
            expect: ['<a>123</a>', '<a>456</a>']
          }
        ],
        pitfalls: [
          {
            wrong: '用 <a>.*</a> 抓 HTML 里的多个标签',
            why: '贪婪会把中间的内容全部吞掉，只有一个匹配。解析标签要用 .*? 或 [^<]*'
          }
        ],
        exercises: [
          {
            id: 'greedy-vs-lazy-1',
            level: 4,
            prompt: '从文本中分别取出每个 <b>...</b> 标签（要求得到两个独立匹配）。',
            text: '<b>a</b><b>bc</b>',
            expect: ['<b>a</b>', '<b>bc</b>'],
            answer: '<b>.*?</b>',
            hints: [
              '注意：. 和 * 都会匹配到标签本身，要限制范围。',
              '贪婪会让两个标签连成一个匹配。',
              '在量词后加 ? 变成懒惰：<b>.*?</b>。'
            ],
            explain: '.*? 吃到最近的 </b> 就停，因此两个标签各自独立成匹配。',
            knowledge: ['.*', '.*?']
          },
          {
            id: 'greedy-vs-lazy-2',
            level: 5,
            prompt: '实战：取出每个 <a> 标签里的文字（不要标签本身，得到一个 123 和一个 456）。',
            text: '<a>123</a><a>456</a>',
            expect: ['123', '456'],
            answer: '(?<=>)[^<]+',
            hints: [
              '文字的前面一定紧跟着 >，但 > 不该出现在结果里。',
              '「前面必须是某字符」用后行断言 (?<=)。',
              '文字部分用 [^<]+ 表示「直到遇到 < 为止」，即 (?<=>)[^<]+。'
            ],
            explain: '(?<=>) 只检查左边是不是 >，不消耗字符，所以结果从文字开始；[^<]+ 一直取到下一个标签的 < 为止。这比用 .*? 再截取更直接，也不会被嵌套标签干扰。',
            knowledge: ['(?<=)', '[^]', '+']
          }
        ]
      },
      {
        id: 'lazy-quantifiers',
        title: '其他懒惰量词',
        essence: '+?、??、{n,m}? 都是"在量词后面加问号"，含义统一是"尽量少"。',
        points: [
          'lazy 是跟随量词的修饰，不改变"能匹配什么"，只改变"优先多长"。',
          '\\d+? 每次只取 1 个数字，配合全局匹配就是逐个数字。',
          '{2,5}? 会优先取 2 个。',
          '需要"最短的唯一匹配"时（比如取引号里的内容），懒惰是标准解法。'
        ],
        examples: [
          {
            title: '提取引号内容',
            text: 'say "hi" and "bye"',
            pattern: '".*?"',
            goal: '贪婪版本会从第一个引号吃到最后一个引号，把中间全吞了；懒惰版本一次只取一对引号。',
            expect: ['"hi"', '"bye"']
          },
          {
            title: '逐个数字',
            text: '12345',
            pattern: '\\d+?',
            goal: '+? 表示"至少一个，但尽量少"，于是每次只取一个数字，共 5 个匹配。',
            expect: ['1', '2', '3', '4', '5']
          }
        ],
        exercises: [
          {
            id: 'lazy-quantifiers-1',
            level: 4,
            prompt: '提取每一对双引号里的内容，并保留引号本身（要求两个独立匹配）。',
            text: 'name="tom" age="18"',
            expect: ['"tom"', '"18"'],
            answer: '".*?"',
            hints: ['引号不是特殊字符，可以直接写。', '贪婪会把两个引号之间的内容全吃掉。', '用 .*? 让量词变懒惰。'],
            explain: '".*?" 从每个引号开始，吃到最近的引号就停 —— 这是提取引号内容的标准写法。',
            knowledge: ['.*?', '?']
          }
        ]
      }
    ]
  },
  {
    id: 'capture',
    no: '09',
    title: '捕获组',
    subtitle: '一次匹配，拿到多个字段',
    stage: '第三阶段 · 进阶',
    lessons: [
      {
        id: 'capture-numbering',
        title: 'group(0) / group(1) / group(2)',
        essence: '捕获组是一组"编号格子"：group(0) 是整体，group(1..n) 是按左括号出现顺序编号的内容。',
        points: [
          '编号从 1 开始，按"左括号出现的顺序"分配，与嵌套层次无关。',
          'group(0) 永远等于整个匹配结果。',
          '没参与匹配的组是 undefined（Java 里是 null），不是空串。',
          '量词作用在分组上时，group 只保留最后一次迭代的内容。'
        ],
        examples: [
          {
            title: '拆订单号',
            text: '订单号：SO202610260001',
            pattern: '(SO)(\\d+)',
            goal: 'group(0)=整个匹配，group(1)=SO，group(2)=后面那串数字。两个括号，两个字段，一次拿到。',
            expect: ['SO202610260001'],
            groups: ['SO', '202610260001']
          },
          {
            title: '括号顺序 = 编号顺序',
            text: '2026-10-26',
            pattern: '((\\d{4})-(\\d{2})-(\\d{2}))',
            goal: '最外层左括号是 1，里面依次是 2、3、4。嵌套不会打乱"从左往右"的编号规则。',
            expect: ['2026-10-26'],
            groups: ['2026-10-26', '2026', '10', '26']
          }
        ],
        exercises: [
          {
            id: 'capture-numbering-1',
            level: 3,
            prompt: '把订单号拆成两部分：前缀 SO 放进 group(1)，数字放进 group(2)。',
            text: '订单号：SO202610260001',
            expect: ['SO', '202610260001'],
            answer: '(SO)(\\d+)',
            mode: 'groups',
            hints: ['两个部分各用一个捕获组。', '前缀是字面量 SO。', '(SO)(\\d+)。'],
            explain: '两个左括号依次是 group(1)、group(2)，结果顺序也就是 SO、数字。',
            knowledge: ['()', 'group']
          }
        ]
      },
      {
        id: 'capture-extract',
        title: '用捕获组做字段提取',
        essence: '真实工作里最常见的用法：用一个"带定位"的正则，只把关心的字段捕获出来。',
        points: [
          '定位部分（key=、前缀、分隔符）不需要捕获，但要参与匹配。',
          '多个字段就是一个正则里的多个捕获组。',
          'Java 里用 matcher.group(n) 取值，n 就是括号编号。'
        ],
        examples: [
          {
            title: '一条日志拆四个字段',
            text: '2026-10-26 15:30:25 [INFO] userId=10086 action=LOGIN',
            pattern: '(\\d{4}-\\d{2}-\\d{2}) (\\d{2}:\\d{2}:\\d{2}) \\[(\\w+)\\] userId=(\\d+) action=(\\w+)',
            goal: '5 个捕获组 = 5 个字段：日期、时间、级别、userId、action。这就是日志解析的基本套路。',
            expect: ['2026-10-26 15:30:25 [INFO] userId=10086 action=LOGIN'],
            groups: ['2026-10-26', '15:30:25', 'INFO', '10086', 'LOGIN']
          },
          {
            title: '只关心值，不关心 key',
            text: 'userId=10086 orderId=200',
            pattern: 'userId=(\\d+)',
            goal: 'key 参与匹配用来定位，括号只括住值。',
            expect: ['userId=10086'],
            groups: ['10086']
          }
        ],
        exercises: [
          {
            id: 'capture-extract-1',
            level: 3,
            prompt: '从日志里提取 userId 的值（只捕获数字）。',
            text: '2026-10-26 15:30:25 [INFO] userId=10086 action=LOGIN',
            expect: ['10086'],
            answer: 'userId=(\\d+)',
            mode: 'groups',
            hints: ['先用 userId= 定位。', '把数字部分用括号括起来。', 'userId=(\\d+)。'],
            explain: '定位文字 + 捕获组是字段提取的标准结构，group(1) 只返回值本身。',
            knowledge: ['()', '\\d']
          }
        ]
      }
    ]
  },
  {
    id: 'lookaround',
    no: '10',
    title: '前瞻与后顾',
    subtitle: '只检查、不消耗的零宽断言',
    stage: '第三阶段 · 进阶',
    lessons: [
      {
        id: 'lookahead',
        title: '(?=) 正向先行',
        essence: '(?=X) 表示"这个位置后面必须紧跟着 X"，但 X 不会被算进匹配结果。',
        points: [
          '断言是零宽的：它只做判断，不消耗字符。',
          '所以 \\d+(?=元) 的结果里没有"元"。',
          '断言可以链式叠加：(?=.*[A-Z])(?=.*\\d) 就是"必须同时包含大写和数字"。'
        ],
        examples: [
          {
            title: '只取"元"前面的数字',
            text: '100元 200美元 300元',
            pattern: '\\d+(?=元)',
            goal: '100 和 300 命中，200 不命中（它后面是"美元"）。结果里不含"元"，因为断言不消耗字符。',
            expect: ['100', '300']
          },
          {
            title: '密码强度：必须同时有大写和数字',
            text: 'abc123 ABC abcD3F',
            pattern: '(?=.*[A-Z])(?=.*\\d)[A-Za-z0-9]{6,}',
            goal: '两个前瞻分别检查"有大写""有数字"，都通过才继续匹配整段。这是断言的组合用法。',
            expect: ['abc123', 'abcD3F']
          }
        ],
        exercises: [
          {
            id: 'lookahead-1',
            level: 4,
            prompt: '只提取后面紧跟 "kg" 的数字（不要把 kg 算进结果）。',
            text: '2kg 3m 5kg',
            expect: ['2', '5'],
            answer: '\\d+(?=kg)',
            hints: ['要限定"后面是 kg"。', '前瞻写在数字后面，形如 (?=...)。', '\\d+(?=kg)。'],
            explain: '(?=kg) 只检查后面是不是 kg，不消耗字符，所以结果里只有数字。',
            knowledge: ['(?=)']
          }
        ]
      },
      {
        id: 'neg-lookahead',
        title: '(?!) 负向先行',
        essence: '(?!X) 表示"这个位置后面不能是 X"。',
        points: [
          '用它做排除法：匹配 A，但 A 后面不能跟着 B。',
          '它同样零宽，不影响匹配结果的内容。',
          '排除"整词"时要小心：Java(?!Script) 只排除了 JavaScript，不排除 JavaSE。'
        ],
        examples: [
          {
            title: '排除 JavaScript',
            text: 'Java JavaScript JavaSE',
            pattern: 'Java(?!Script)',
            goal: '第一处和第三处命中，中间的 JavaScript 被负向先行挡掉。',
            expect: ['Java', 'Java']
          },
          {
            title: '排除已注释的行',
            text: '# debug\ninfo=1\n# cache',
            pattern: '^(?!#).*$',
            flags: 'gm',
            goal: '^ 之后先断言"不是 # 开头"，再匹配整行 —— 过滤注释行的常用写法。',
            expect: ['info=1']
          }
        ],
        exercises: [
          {
            id: 'neg-lookahead-1',
            level: 4,
            prompt: '提取所有不是 https 的 http（即 http 后面不能紧跟 s）。',
            text: 'http://a https://b http://c',
            expect: ['http', 'http'],
            answer: 'http(?!s)',
            hints: ['先匹配 http。', '要求后面"不能是 s"。', 'http(?!s)。'],
            explain: 'https 里的 http 后面紧跟 s，被 (?!s) 拒绝；另外两处后面是冒号，通过。',
            knowledge: ['(?!)']
          }
        ]
      },
      {
        id: 'lookbehind',
        title: '(?<=) 正向后行',
        essence: '(?<=X) 表示"这个位置前面必须是 X"，同样不消耗字符。',
        points: [
          '和先行对称，只是检查方向反过来。',
          '后行断言在提取"某某后面的值"时最顺手：(?<=金额:)\\d+。',
          'Java 要求后行断言的宽度可确定（不能是 * 或 + 这种不定长），写死长度或用 {n} 更安全。'
        ],
        examples: [
          {
            title: '取 userId 的值',
            text: 'userId=10086 orderId=200',
            pattern: '(?<=userId=)\\d+',
            goal: '只取前面是 userId= 的数字，orderId=200 被排除。结果里不含 userId=。',
            expect: ['10086']
          },
          {
            title: '取引号后的值',
            text: 'name:"tom" age:"18"',
            pattern: '(?<=name:")\\w+',
            goal: '前面必须是 name:"，然后取单词字符 —— 定位和取值一次完成。',
            expect: ['tom']
          }
        ],
        exercises: [
          {
            id: 'lookbehind-1',
            level: 4,
            prompt: '只提取"金额:"后面的数字（不要前面的中文）。',
            text: '金额:199 数量:3',
            expect: ['199'],
            answer: '(?<=金额:)\\d+',
            hints: ['"前面是金额:"这个条件用后行断言表达。', '写法是 (?<=...)。', '(?<=金额:)\\d+。'],
            explain: '后行断言只检查左边的文本，匹配结果从数字开始，所以不会带上"金额:"。',
            knowledge: ['(?<=)']
          }
        ]
      },
      {
        id: 'neg-lookbehind',
        title: '(?<!) 负向后行',
        essence: '(?<!) 表示"这个位置前面不能是 X"。',
        points: [
          '典型用途：排除带前缀的值，比如不以 $ 开头的价格。',
          '用单个字符排除时很容易"部分匹配"：一定要把数字和点也一起排除，否则会从中间重新开始匹配。',
          '这是四种断言里最容易写错的一个，建议写完先用实验室验证结果。'
        ],
        examples: [
          {
            title: '排除 $ 开头的价格',
            text: '价格 19.9 美元，$29.9 到手价',
            pattern: '(?<![\\d.$])\\d+(?:\\.\\d+)?',
            goal: '29.9 前面是 $，被排除；而它的 9 前面是点、2 前面是 $，也一并被字符集合挡住 —— 所以不会出现"只匹配到一半"的脏结果。',
            expect: ['19.9']
          },
          {
            title: '排除注释行',
            text: 'debug\n# debug\ninfo',
            pattern: '^(?<!#)\\w+$',
            flags: 'gm',
            goal: '行首位置的前面不能是 #（配合 ^ 使用），于是注释行被过滤。',
            expect: ['debug', 'info']
          }
        ],
        pitfalls: [
          {
            wrong: '用 (?<!\\$) 单个字符排除 $ 前缀',
            why: '引擎会在后面的字符上重新尝试，结果匹配出 "9.9" 这种半截内容。排除要连数字和点一起排除'
          }
        ],
        exercises: [
          {
            id: 'neg-lookbehind-1',
            level: 5,
            prompt: '提取所有"前面没有 $ 符号"的价格（整数或小数）。',
            text: '19.9 $29.9 运费5',
            expect: ['19.9', '5'],
            answer: '\\$?(?<![\\d.$])\\d+(?:\\.\\d+)?',
            hints: [
              '要排除"紧挨着 $ 的数字"。',
              '只用 (?<!\\$) 会让 29.9 的 9 被单独匹配出来。',
              '把数字和点也一起排除：(?<![\\d.$])。'
            ],
            explain: '把数字和点一起放进负向后行的排除集合，才不会出现半截匹配。\\$? 这里只是为了让说明更清楚，实际起作用的是断言。',
            knowledge: ['(?<!)', '[^]']
          }
        ]
      }
    ]
  }
]
