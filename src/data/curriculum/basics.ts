import type { Chapter } from '@/types'

/** 第 01 章 正则基础 + 第 02 章 字符集合 */
export const basicChapters: Chapter[] = [
  {
    id: 'basics',
    no: '01',
    title: '正则基础',
    subtitle: '先认识"一个字符"这件事',
    stage: '第一阶段 · 地基',
    lessons: [
      {
        id: 'what-is-regex',
        title: '什么是正则表达式',
        essence:
          '正则不是"从第几位取到第几位"，而是描述一段文本"长什么样"。你写形状，引擎去找符合形状的片段。',
        points: [
          '正则（pattern）是给字符串画的"模板"，匹配就是拿模板去文本里找符合的片段。',
          '它天然处理"长度不确定"的内容：数字有几个、中间隔了什么，都不用手写循环。',
          '判断一个正则对不对，只看一件事：在目标文本上，它到底匹配出了什么。',
          '学会它的顺序：单个字符 → 重复次数 → 位置 → 分组 → 断言。不要一上来就写复杂正则。'
        ],
        examples: [
          {
            title: '先看一眼：从一句话里挖出订单号',
            text: '订单号：SO202610260001，金额：199.00，备注：加急',
            pattern: 'SO\\d+',
            goal: 'SO 是字面量（就找这两个字母），\\d+ 表示"一串数字"。两者拼起来就是订单号的形状。',
            expect: ['SO202610260001']
          },
          {
            title: '同一个套路：挖出所有数字',
            text: '库存 25 件，单价 199 元',
            pattern: '\\d+',
            goal: '不需要知道数字在哪、有多长 —— 描述"数字的形状"就够了。',
            expect: ['25', '199']
          }
        ],
        exercises: [
          {
            id: 'basics-what-1',
            level: 1,
            prompt: '从这段文本里提取出所有连续的数字。',
            text: '批号 A1024 数量 36 备注 ok',
            expect: ['1024', '36'],
            answer: '\\d+',
            hints: [
              '你要找的是数字，而且是连着的一整段。',
              '数字用 \\d 表示。',
              '数字不止一个，需要量词：\\d+。'
            ],
            explain: '\\d 匹配一个数字，+ 表示重复 1 次或多次，所以 1024 会被整体匹配，而不是拆成 1、0、2、4。',
            knowledge: ['\\d', '+']
          }
        ]
      },
      {
        id: 'basic-literal',
        title: '普通字符',
        essence: '在正则里，绝大多数字符就是它自己。写 cat 就只找 "cat" 这个连续片段。',
        points: [
          '字母、数字、汉字、空格，基本都是普通字符，直接写即可。',
          '字面量匹配不认单词边界：cat 也会匹配到 concat 里面的 cat。',
          '默认区分大小写，要忽略大小写用 i 修饰符。'
        ],
        examples: [
          {
            title: '它会匹配到单词内部',
            text: 'concat category cat scatter',
            pattern: 'cat',
            goal: '4 处都命中。普通字符只负责"这段字符要一样"，不负责"必须是独立单词"。',
            expect: ['cat', 'cat', 'cat', 'cat']
          },
          {
            title: '大小写敏感',
            text: 'Java 和 javascript',
            pattern: 'Java',
            goal: '只有大写的 Java 命中。加上 i 修饰符（flags 填 gi）就会两个都命中。',
            expect: ['Java']
          }
        ],
        pitfalls: [
          {
            wrong: '以为写 cat 只匹配独立的单词 cat',
            why: '正则匹配的是"连续字符片段"，不管它是不是单词的一部分。要卡单词边界得用 \\bcat\\b'
          }
        ],
        exercises: [
          {
            id: 'basics-literal-1',
            level: 1,
            prompt: '提取文本中所有的 "ok"（区分大小写，不含 OK、Ok）。',
            text: 'status=ok, check=OK, result=ok, note=Ok',
            expect: ['ok', 'ok'],
            answer: 'ok',
            hints: [
              '这题不需要任何特殊符号。',
              '直接把要找的内容原样写出来。',
              '答案就是两个字：ok。'
            ],
            explain: '普通字符原样匹配，正则默认区分大小写，所以 OK / Ok 都不会被匹配。',
            knowledge: ['普通字符']
          }
        ]
      },
      {
        id: 'basic-dot',
        title: '点号 .',
        essence: '. 表示"任意一个字符"，注意是"一个"，不是"一串"。',
        points: [
          '一个 . 只吃一个字符，想吃多个要配合量词（.*、.+）。',
          '默认 . 不匹配换行符 \\n；加了 s 修饰符才跨行。',
          '. 会吃掉你不想要的东西 —— 这是初学者最容易踩的坑。'
        ],
        examples: [
          {
            title: '一个点，顶一个字符',
            text: 'cat cot cut c3t c t',
            pattern: 'c.t',
            goal: '中间那个位置，字母、数字、空格都算"一个字符"，所以 5 个都命中。',
            expect: ['cat', 'cot', 'cut', 'c3t', 'c t']
          },
          {
            title: '默认不跨行',
            text: 'a\nc',
            pattern: 'a.c',
            goal: '默认匹配不到（换行不是"任意字符"）。把 flags 改成 gs 再试一次，就能匹配上了。',
            expect: []
          }
        ],
        exercises: [
          {
            id: 'basics-dot-1',
            level: 2,
            prompt: '匹配所有"两个字母 + 一个数字"的三字符片段，例如 a1b 不算，ab1 才算。',
            text: 'ab1 cd2 ef x9y zz3',
            expect: ['ab1', 'cd2', 'zz3'],
            answer: '[a-z][a-z]\\d',
            hints: [
              '题目描述了三件事：两个字母、一个数字。',
              '一个点只能代替一个字符，这里要求"两个字母"，用点会太宽松（x9y 不该命中）。',
              '用 [a-z] 卡字母：[a-z]{2}\\d。'
            ],
            explain: '这里要的不是"任意字符"，而是"字母"。.[a-z]\\d 也能过这题，但遇到 x9y 就会误伤 —— 所以第一个字符也得限制成字母。',
            knowledge: ['.', '[a-z]']
          }
        ]
      },
      {
        id: 'basic-digit',
        title: '\\d 数字',
        essence: '\\d = digit = 一个 0-9 的数字，等价于 [0-9]。',
        points: [
          '\\d 只匹配一个字符，要匹配一串数字必须加量词：\\d+。',
          '\\d+ 遇到非数字就断，所以一句话里多段数字会被切成多个匹配。',
          'Java 的 \\d 默认只认 ASCII 数字，和 JS 的 \\d 行为一致；要匹配中文数字得手写集合。'
        ],
        examples: [
          {
            title: '教科书例子',
            text: 'abc123xyz',
            pattern: '\\d+',
            goal: '\\d 是"数字"，+ 是"一个或多个"，所以只有 123 命中；abc、xyz 不是数字，直接被跳过。',
            expect: ['123']
          },
          {
            title: '一段文本里有多段数字',
            text: '订单 A1 金额 199.00 日期 2026-10-26',
            pattern: '\\d+',
            goal: '\\d+ 一遇到非数字就断：1、199、00、2026、10、26 被切成 6 段。想要小数或日期整体，得自己描述分隔符。',
            expect: ['1', '199', '00', '2026', '10', '26']
          }
        ],
        pitfalls: [
          {
            wrong: '用 \\d 去提取"123"',
            why: '只会得到 1、2、3 三段。\\d 是单个字符，连续数字必须用 \\d+'
          }
        ],
        exercises: [
          {
            id: 'basics-digit-1',
            level: 1,
            prompt: '提取文本里的所有数字（每段连续数字算一个）。',
            text: 'abc123def456',
            expect: ['123', '456'],
            answer: '\\d+',
            hints: ['先想清楚"数字"的符号表示。', '单个数字用 \\d，但这样会把 123 拆散。', '再加 + 表示连续出现。'],
            explain: '\\d+ 会贪婪地吃下连续的每一个数字，直到遇到非数字为止，因此得到 123 和 456 两段。',
            knowledge: ['\\d', '+']
          },
          {
            id: 'basics-digit-2',
            level: 1,
            prompt: '这段文本里只有一个数字，把它单独提取出来（不要字母）。',
            text: 'userId=10086',
            expect: ['10086'],
            answer: '\\d+',
            hints: ['数字在等号后面。', '用 \\d 表示数字。', '连续数字用 \\d+。'],
            explain: '\\d+ 从 1 开始一路吃到 6，等号不是数字，自然不会进来。',
            knowledge: ['\\d']
          }
        ]
      },
      {
        id: 'basic-nondigit',
        title: '\\D 非数字',
        essence: '\\D 是 \\d 的反面：匹配"任何一个不是数字的字符"。',
        points: [
          '\\D 等价于 [^0-9]，注意它是"取反"，不是"非数字串"。',
          '\\D+ 会连续吃下所有非数字字符，直到遇到数字。',
          '\\D 也包括空格、标点、换行、汉字。'
        ],
        examples: [
          {
            title: '把数字当分隔符',
            text: 'abc123xyz456',
            pattern: '\\D+',
            goal: '两段字母被单独切出来，数字成了天然的分隔符。',
            expect: ['abc', 'xyz']
          },
          {
            title: '单个取反',
            text: 'A1B2C3',
            pattern: '\\D',
            goal: '每次只命中一个字母（没有 + 就不连续吃）。',
            expect: ['A', 'B', 'C']
          }
        ],
        exercises: [
          {
            id: 'basics-nondigit-1',
            level: 2,
            prompt: '提取文本里所有的"非数字片段"（连续的非数字字符算一段）。',
            text: 'v1.2.3-release',
            expect: ['v', '.', '.', '-release'],
            answer: '\\D+',
            hints: ['数字是 1、2、3，其余都是非数字。', '非数字用 \\D。', '连续的非数字用 \\D+。'],
            explain: '\\D+ 在 v 处吃到 1 停下，在 1 和 2 之间的 . 单独成段，2 和 3 之间的 . 同理，最后 -release 一整段。',
            knowledge: ['\\D', '+']
          }
        ]
      },
      {
        id: 'basic-word',
        title: '\\w 单词字符',
        essence: '\\w = 字母、数字、下划线，等价于 [A-Za-z0-9_]。它是"标识符"的字符集。',
        points: [
          '\\w 不包含空格、减号、点、@ 这些常见符号。',
          '中文不算 \\w（JS 和 Java 默认都是 ASCII 语义），这是提取中文时最常踩的坑。',
          '\\w+ 是提取变量名、key、单词的主力。'
        ],
        examples: [
          {
            title: '只认字母数字下划线',
            text: 'user_id-42 name=张三',
            pattern: '\\w+',
            goal: 'user_id 整体命中（下划线算 \\w），但减号断开了它和 42；"张三"完全没命中 —— 中文不是 \\w。',
            expect: ['user_id', '42', 'name']
          },
          {
            title: 'key: value 场景',
            text: 'key:value_1',
            pattern: '\\w+',
            goal: '冒号不是单词字符，于是被切成 key 和 value_1 两段。',
            expect: ['key', 'value_1']
          }
        ],
        exercises: [
          {
            id: 'basics-word-1',
            level: 2,
            prompt: '提取文本中的变量名（字母、数字、下划线组成，且必须有字母）。',
            text: 'set user_name = "张三"; set age2 = 18;',
            expect: ['set', 'user_name', 'set', 'age2'],
            answer: '[A-Za-z_][A-Za-z0-9_]*',
            hints: [
              '\\w+ 会把 18 也匹配出来，但数字不是变量名。',
              '变量名不能以数字开头，第一个字符要单独限制。',
              '第一个字符用 [A-Za-z_]，后面用 [A-Za-z0-9_]* 或 \\w*。'
            ],
            explain: '开头必须是字母或下划线，后面才允许数字。所以 18 不会命中，user_name、age2 会完整命中。',
            knowledge: ['\\w', '[a-zA-Z]', '*']
          }
        ]
      },
      {
        id: 'basic-nonword',
        title: '\\W 非单词字符',
        essence: '\\W 匹配"不是字母、数字、下划线"的字符：空格、符号、标点、汉字都算。',
        points: [
          '\\W 等价于 [^A-Za-z0-9_]。',
          '常用来"切开"键值对、路径、标志位。',
          '\\W+ 会把连续的空格和符号合并成一段。'
        ],
        examples: [
          {
            title: '找出分隔符',
            text: 'user_id-42',
            pattern: '\\W',
            goal: '只有减号不是单词字符，所以只命中一个。',
            expect: ['-']
          },
          {
            title: '中文属于 \\W',
            text: 'a张b',
            pattern: '\\W+',
            goal: '中文不是"单词字符"，所以它在 \\W 的范围内。这也是提取中文时写 \\w+ 什么也拿不到的原因。',
            expect: ['张']
          }
        ],
        exercises: [
          {
            id: 'basics-nonword-1',
            level: 2,
            prompt: '提取文本中所有的非单词字符片段（连续的算一段）。',
            text: 'a_b c-d.e',
            expect: [' ', '-', '.'],
            answer: '\\W+',
            hints: ['单词字符是字母数字下划线。', '空格、减号、点都不是。', '用 \\W+ 一次性抓连续的符号。'],
            explain: 'a_b 里都是单词字符不算；空格断开；c-d 的减号命中；d.e 的点命中。',
            knowledge: ['\\W']
          }
        ]
      },
      {
        id: 'basic-space',
        title: '\\s 空白字符',
        essence: '\\s 匹配任何一个空白：空格、制表符 \\t、换行 \\n、回车 \\r。',
        points: [
          '\\s+ 是"压缩多余空格 / 切分单词"的常用手段。',
          '它不匹配"看不见的零宽字符"，别拿它当万能清理器。',
          'Java 的 \\s 默认不包含全角空格，需要的话要自己加进集合。'
        ],
        examples: [
          {
            title: '三种空白都能命中',
            text: 'a b\tc\nd',
            pattern: '\\s',
            goal: '空格、制表符、换行符都被算作空白，各命中一次。',
            expect: [' ', '\t', '\n']
          },
          {
            title: '压缩连续空格',
            text: 'id   10086',
            pattern: '\\s+',
            goal: '三个空格被当成一段整体，这就是"把多空格标准化成一个"的原理。',
            expect: ['   ']
          }
        ],
        exercises: [
          {
            id: 'basics-space-1',
            level: 2,
            prompt: '把每行开头的缩进（连续空白）找出来。',
            text: '  line1\n\tline2\nline3',
            expect: ['  ', '\t'],
            answer: '^\\s+',
            flags: 'gm',
            hints: ['先卡住行首，再匹配空白。', '行首要考虑多行模式（m 修饰符）。', '^\\s+，flags 用 gm。'],
            explain: 'm 让 ^ 在每一行开头都生效，\\s+ 吃掉缩进。第三行没有缩进，所以只有两个匹配。',
            knowledge: ['\\s', '^', 'm']
          }
        ]
      },
      {
        id: 'basic-nonspace',
        title: '\\S 非空白字符',
        essence: '\\S 匹配"不是空白"的任意字符，常用来按空格切词。',
        points: [
          '\\S+ 等价于"取出每一个词/字段"。',
          '它是 \\s 的补集，包含标点和中文。',
          '日志按空格切字段时，\\S+ 比 split 更灵活。'
        ],
        examples: [
          {
            title: '按空白切词',
            text: 'id   10086  ',
            pattern: '\\S+',
            goal: '连续空白被跳过，只留下两个"词"。',
            expect: ['id', '10086']
          },
          {
            title: '去掉首尾空格后的内容',
            text: '  42  ',
            pattern: '\\S+',
            goal: '首尾空格不参与匹配，42 被干净地取出来。',
            expect: ['42']
          }
        ],
        exercises: [
          {
            id: 'basics-nonspace-1',
            level: 2,
            prompt: '按空白切分，提取日志里的每一个字段（不要把空格带进来）。',
            text: '2026-10-26 15:30:25 [INFO] userId=10086',
            expect: ['2026-10-26', '15:30:25', '[INFO]', 'userId=10086'],
            answer: '\\S+',
            hints: ['字段之间是空格。', '要匹配"不是空格的连续字符"。', '用 \\S+ 即可。'],
            explain: '\\S+ 从非空白处开始，一直吃到下一个空白，天然完成"按空白切分"。',
            knowledge: ['\\S', '+']
          }
        ]
      }
    ]
  },
  {
    id: 'charset',
    no: '02',
    title: '字符集合',
    subtitle: '一次限定"可以是哪几个字符"',
    stage: '第一阶段 · 地基',
    lessons: [
      {
        id: 'set-intro',
        title: '[] 方括号',
        essence: '方括号是"任选一个"的容器：[abc] 表示这个位置可以是 a 或 b 或 c。',
        points: [
          '[] 只占一个字符的位置，不是匹配整串。',
          '集合里的字符是"或"的关系，不是"顺序"关系。',
          '[] 里大多数元字符会失去特殊含义，但 \\ 开头的转义和 - 仍然特殊。'
        ],
        examples: [
          {
            title: '一个位置，三种可能',
            text: 'gray grey grays',
            pattern: 'gr[ae]y',
            goal: 'gr 后面那个位置可以是 a 或 e，所以 gray、grey 都命中；grays 里的 gray 也会命中。',
            expect: ['gray', 'grey', 'gray']
          },
          {
            title: '集合不是"顺序"',
            text: 'abc bca cab',
            pattern: '[abc]{3}',
            goal: '只要三个字符都来自集合就命中，顺序随意，所以三个都中。',
            expect: ['abc', 'bca', 'cab']
          }
        ],
        exercises: [
          {
            id: 'set-intro-1',
            level: 2,
            prompt: '匹配 "cat" 或 "cut"，但不要 "cot"。',
            text: 'cat cot cut',
            expect: ['cat', 'cut'],
            answer: 'c[au]t',
            hints: ['三个词只差中间一个字母。', '把"可以是什么"放进方括号。', '中间位置可以是 a 或 u：c[au]t。'],
            explain: 'c 和 t 是字面量，中间用 [au] 限定只能是 a 或 u，所以 cot 被排除。',
            knowledge: ['[]']
          }
        ]
      },
      {
        id: 'set-abc',
        title: '[abc] 枚举集合',
        essence: '把允许出现的字符一个个列进方括号，就是枚举集合。',
        points: [
          '集合里重复写没有意义，[aab] 等价于 [ab]。',
          '配合量词可以匹配"由这些字符组成的串"：[abc]+。',
          '集合里不需要加逗号、空格，写了就会被当成真实字符。'
        ],
        examples: [
          {
            title: '连续命中集合内的字符',
            text: 'aabbccddaabb',
            pattern: '[abc]+',
            goal: '遇到 d 就断开，于是切成 aabbcc 和 aabb 两段。',
            expect: ['aabbcc', 'aabb']
          },
          {
            title: '集合里有空格也是元素',
            text: 'a b c',
            pattern: '[ab ]+',
            goal: '空格被写进了集合，所以空格也参与匹配。',
            expect: ['a b ']
          }
        ],
        exercises: [
          {
            id: 'set-abc-1',
            level: 2,
            prompt: '提取由元音字母（a e i o u）组成的连续片段。',
            text: 'aeiou aei xx ee',
            expect: ['aeiou', 'aei', 'ee'],
            answer: '[aeiou]+',
            hints: ['先列出元音字母。', '把它们放进方括号表示任选一个。', '再加 + 表示连续多个。'],
            explain: 'b 不是元音，直接从 e 开始；rhythm 里没有元音，所以没有匹配。',
            knowledge: ['[abc]', '+']
          }
        ]
      },
      {
        id: 'set-range-lower',
        title: '[a-z] 小写区间',
        essence: '区间用连字符表示"从…到…"，[a-z] 就是任意一个小写字母。',
        points: [
          '区间按字符编码顺序，a-z 覆盖 26 个小写字母。',
          '连字符只有在中间才是区间；放开头或结尾就是普通的减号。',
          '[a-z] 只含小写，大写要另写 [A-Z]。'
        ],
        examples: [
          {
            title: '小写连续片段',
            text: 'Hello World 2026',
            pattern: '[a-z]+',
            goal: 'H、W 是大写不算，数字也不算，剩下 ello、orld。',
            expect: ['ello', 'orld']
          },
          {
            title: '减号在末尾是字面量',
            text: 'ab- cd',
            pattern: '[a-z-]+',
            goal: '末尾的 - 表示"减号本身"，所以 ab- 成为一个整体。',
            expect: ['ab-', 'cd']
          }
        ],
        exercises: [
          {
            id: 'set-range-lower-1',
            level: 2,
            prompt: '提取所有小写字母片段。',
            text: 'Abc DEF ghi',
            expect: ['bc', 'ghi'],
            answer: '[a-z]+',
            hints: ['限定字符范围用区间。', '小写字母是 a 到 z。', '[a-z]+。'],
            explain: '大写 A 不在区间内，所以从 b 开始；DEF 全大写不算；ghi 完整命中。',
            knowledge: ['[a-z]']
          }
        ]
      },
      {
        id: 'set-range-upper',
        title: '[A-Z] 大写区间',
        essence: '[A-Z] 是任意一个大写字母，常用来提取缩写、常量名、日志级别。',
        points: [
          '日志里的 INFO / WARN / ERROR 就是典型的 [A-Z]+。',
          '区间顺序不能反：[Z-A] 会直接报错。',
          '[A-Za-z] 才是"大小写都算"。'
        ],
        examples: [
          {
            title: '提取大写片段',
            text: 'Hello World JAVA',
            pattern: '[A-Z]+',
            goal: '每个单词的首字母是大写，JAVA 整段大写 —— 一共 3 处。',
            expect: ['H', 'W', 'JAVA']
          },
          {
            title: '日志级别',
            text: '[INFO] 服务启动 [WARN] 连接超时',
            pattern: '\\[(?:INFO|WARN|ERROR)\\]',
            goal: '先用大写区间思想上定位，再精确到三个级别 —— 这就是后面分组的用法。',
            expect: ['[INFO]', '[WARN]']
          }
        ],
        exercises: [
          {
            id: 'set-range-upper-1',
            level: 2,
            prompt: '提取文本中所有连续的大写字母片段。',
            text: 'status=OK type=10086 TYPE=ADMIN',
            expect: ['OK', 'TYPE', 'ADMIN'],
            answer: '[A-Z]+',
            hints: ['大写字母的范围怎么表示？', 'A 到 Z。', '[A-Z]+ 表示连续多个大写字母。'],
            explain: '等号、数字都不是大写字母，自然断开；OK、TYPE、ADMIN 各自连续命中。',
            knowledge: ['[A-Z]']
          }
        ]
      },
      {
        id: 'set-range-digit',
        title: '[0-9] 数字区间',
        essence: '[0-9] 和 \\d 是同一个东西，写法不同而已。',
        points: [
          '两者完全等价，用哪个看可读性：\\d 更短，[0-9] 更明确。',
          '需要"数字 + 其它字符"混用时，写在同一个集合里更省事：[0-9a-f]。',
          '十六进制用 [0-9a-fA-F]。'
        ],
        examples: [
          {
            title: '和 \\d+ 结果一致',
            text: 'abc123xyz456',
            pattern: '[0-9]+',
            goal: '结果和 \\d+ 完全相同：123、456。',
            expect: ['123', '456']
          },
          {
            title: '混合集合：十六进制颜色',
            text: 'color: #1a2B3c; size: #FFF',
            pattern: '#[0-9a-fA-F]{3,6}',
            goal: '集合里可以同时包含区间，表示"数字或 a-f 的字母，大小写都行"。',
            expect: ['#1a2B3c', '#FFF']
          }
        ],
        exercises: [
          {
            id: 'set-range-digit-1',
            level: 2,
            prompt: '提取所有十六进制颜色值（# 开头，后跟 3 到 6 位十六进制字符）。',
            text: 'bg=#fff fg=#1A2b3C border=#123',
            expect: ['#fff', '#1A2b3C', '#123'],
            answer: '#[0-9a-fA-F]{3,6}',
            hints: ['# 是字面量，后面是十六进制字符。', '十六进制 = 0-9 和 a-f（大小写都要）。', '长度 3 到 6：用 {3,6}。'],
            explain: '#fff 三位命中，#1A2b3C 六位命中，#123 三位命中。如果想严格只允许"3 位或 6 位"，就得写成 (#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})，因为 {3,6} 会把 4、5 位也算进去。',
            knowledge: ['[0-9]', '{n,m}']
          }
        ]
      },
      {
        id: 'set-range-alpha',
        title: '[a-zA-Z] 大小写字母',
        essence: '把两个区间写在一个方括号里，就是"大小写都算的字母"。',
        points: [
          '多个区间可以并存：[a-zA-Z0-9_]。',
          '这就是 \\w 的手写版本（\\w 还包含下划线）。',
          '区间之间不要加逗号或空格。'
        ],
        examples: [
          {
            title: '大小写都能命中',
            text: 'user_42-Name',
            pattern: '[a-zA-Z]+',
            goal: '下划线和数字不在集合里，于是被切成 user 和 Name 两段。',
            expect: ['user', 'Name']
          },
          {
            title: '带数字的标识符',
            text: 'var abc123 DEF456',
            pattern: '[a-zA-Z][a-zA-Z0-9]*',
            goal: '首字符必须是字母，后面才允许数字 —— 变量名的常见规则。',
            expect: ['var', 'abc123', 'DEF456']
          }
        ],
        exercises: [
          {
            id: 'set-range-alpha-1',
            level: 2,
            prompt: '提取所有"字母开头、后面跟字母或数字"的标识符（不要纯数字）。',
            text: 'x1 42 abc_9 foo',
            expect: ['x1', 'abc', 'foo'],
            answer: '[a-zA-Z][a-zA-Z0-9]*',
            hints: ['第一个字符和后面的字符规则不一样。', '首字符限定为字母，后面允许数字。', '[a-zA-Z][a-zA-Z0-9]*。'],
            explain: '42 首字符是数字，直接排除；abc_9 里的下划线断开了匹配，所以只拿到 abc。',
            knowledge: ['[a-zA-Z]', '*']
          }
        ]
      },
      {
        id: 'set-negated',
        title: '[^abc] 取反集合',
        essence: '方括号里的 ^ 表示"取反"：除了这些字符，其它都要。',
        points: [
          '[^abc] 仍然只占一个字符的位置。',
          '^ 只有在方括号内的第一个位置才是取反，其它位置是普通字符。',
          '取反集合常用于"排除分隔符"：/ 路径用 [^/]+。'
        ],
        examples: [
          {
            title: '除了 abc 都要',
            text: 'abcXYZabc123',
            pattern: '[^abc]+',
            goal: '连续的"非 a/b/c"被聚成两段：XYZ 和 123。',
            expect: ['XYZ', '123']
          },
          {
            title: '取反里包含换行',
            text: 'a1\n2b',
            pattern: '[^0-9]+',
            goal: '换行不是数字，所以也被匹配进来 —— 这是和 . 的重要区别。',
            expect: ['a', '\n', 'b']
          }
        ],
        exercises: [
          {
            id: 'set-negated-1',
            level: 3,
            prompt: '提取 URL 路径中每一段（以 / 分隔，不含 /）。',
            text: '/api/v1/orders/10086',
            expect: ['api', 'v1', 'orders', '10086'],
            answer: '[^/]+',
            hints: ['分隔符是斜杠。', '要匹配"不是斜杠"的连续字符。', '[^/]+。'],
            explain: '取反集合把 / 排除在外，于是每段路径被单独切出来。这是解析路径最常用的写法。',
            knowledge: ['[^]']
          }
        ]
      },
      {
        id: 'set-negated-digit',
        title: '[^0-9] 排除数字',
        essence: '[^0-9] 就是 \\D，匹配任何非数字字符。',
        points: [
          '它是"数字的反面"，包含字母、标点、空格、换行、中文。',
          '常用来"去掉数字只留文字"，或找出数字之间的分隔符。',
          '在 Java 里 [^0-9] 的行为同样只针对 ASCII 数字。'
        ],
        examples: [
          {
            title: '非数字片段',
            text: 'abc123xyz456',
            pattern: '[^0-9]+',
            goal: '和 \\D+ 结果一致：abc、xyz。',
            expect: ['abc', 'xyz']
          },
          {
            title: '找出数字间的分隔符',
            text: '1,2;3|4',
            pattern: '[^0-9]',
            goal: '每个符号各命中一次，用来分析数据的分隔规则。',
            expect: [',', ';', '|']
          }
        ],
        exercises: [
          {
            id: 'set-negated-digit-1',
            level: 2,
            prompt: '把文本里的"非数字内容"都提取出来（连续的算一段）。',
            text: 'A1B22C333',
            expect: ['A', 'B', 'C'],
            answer: '[^0-9]+',
            hints: ['数字是 1、2、3 这些。', '取反的写法是在方括号里加 ^。', '[^0-9]+。'],
            explain: '每个字母后面紧跟着数字，所以每次取反集合只能命中一个字母，得到 A、B、C。',
            knowledge: ['[^0-9]']
          }
        ]
      }
    ]
  }
]
