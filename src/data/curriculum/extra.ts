import type { Chapter } from '@/types'

/**
 * 第 12 章 额外篇
 * 定位：主干课程按「从简到繁」的顺序推进，必然会漏掉一些"不在主线上的语法"。
 * 这一章只做一件事 —— 把漏掉的补齐，并说明每一条为什么重要。
 */
export const extraChapters: Chapter[] = [
  {
    id: 'extra',
    no: '12',
    title: '额外篇 · 补全语法',
    subtitle: '主干没覆盖、但天天会遇到的 9 组语法',
    stage: '第五阶段 · 补全',
    lessons: [
      {
        id: 'extra-word-boundary',
        title: '\\b 与 \\B 单词边界',
        essence: '\\b 不是一个字符，而是一个「位置」：单词字符和非单词字符交界的那条缝，宽度为 0。',
        points: [
          '\\w 管的是 [A-Za-z0-9_]，\\b 就是"这边属于 \\w、那边不属于 \\w"的缝。',
          '它是零宽的，写在结果两边不会多出任何字符。',
          '中文、空格、标点在正则眼里都不是 \\w，所以「中文」和「英文」之间天然存在 \\b —— 这是匹配中文旁边英文时最容易踩的坑。',
          '\\B 正好相反：只匹配"两边同属一类"的位置，也就是单词内部的缝。'
        ],
        examples: [
          {
            title: '只有独立成词的 cat 命中',
            text: 'cat catcat scat',
            pattern: '\\bcat\\b',
            goal: 'catcat 里的 cat 后面还连着 c，scat 里的 cat 前面还有 s —— 两边都不在边界上，所以只有第一个命中。',
            expect: ['cat']
          },
          {
            title: '\\b 只看字符类别，不认字',
            text: '订单order已创建',
            pattern: '\\border\\b',
            goal: '中文不是 \\w，所以「单」和「o」之间、r 和「已」之间都是边界 —— 夹在中文里的 order 照样能匹配到。想连中文一起要求，就得靠断言。',
            expect: ['order']
          },
          {
            title: '下划线算 \\w，连字符不算',
            text: 'order_id order-id',
            pattern: '\\border\\b',
            goal: 'order_id 里 order 后面紧跟下划线，仍属于 \\w，不算边界；order-id 里是连字符，属于边界。所以只有一个命中。',
            expect: ['order']
          },
          {
            title: '\\B 反过来：只认"粘在单词中间"的',
            text: 'cat concat',
            pattern: '\\Bcat',
            goal: 'concat 里的 cat 前一位是字母 n，属于单词内部，\\B 成立；开头那个 cat 前面是字符串起点，\\B 不成立。',
            expect: ['cat']
          }
        ],
        pitfalls: [
          {
            wrong: '[\\b]',
            why: '字符类里的 \\b 是「退格符」U+0008，不是单词边界。要匹配退格得这么写，要边界就不能放进方括号。'
          },
          {
            wrong: '\\b中文\\b',
            why: '中文本身不是 \\w，所以 \\b中文\\b 的边界根本卡不住 —— 它就退化成普通的「中文」两个字。'
          }
        ],
        exercises: [
          {
            id: 'extra-wb-1',
            level: 3,
            prompt: '只提取独立成词的 java，不要 JavaScript、javaSE 里的 java。',
            text: 'java JavaScript javaSE java',
            expect: ['java', 'java'],
            answer: '\\bjava\\b',
            hints: [
              '要排除"后面还粘着字母"的情况，就得约束左右两侧。',
              '约束"两侧必须是边界"用 \\b。',
              '写成 \\bjava\\b：左边界 + java + 右边界。'
            ],
            explain: 'JavaScript 里 java 后面紧跟 S（仍属 \\w），右边界不成立；javaSE 同理。只有首尾两个 java 两侧都是空格或字符串端点，\\b 全部成立。',
            knowledge: ['\\b']
          },
          {
            id: 'extra-wb-2',
            level: 3,
            prompt: '提取所有独立的 ok，大小写都算，但 okgo 里的不算。',
            text: 'ok OK okgo',
            flags: 'gi',
            expect: ['ok', 'OK'],
            answer: '\\bok\\b',
            hints: [
              '大小写差异靠 i 修饰符解决，不用在正则里写 [oO][kK]。',
              '剩下的问题是"别让 ok 粘着后面的字母"。',
              '\\bok\\b 配 gi。'
            ],
            explain: 'i 让 ok 能命中 OK；\\b 卡住右侧，把 okgo 排除掉。两件事各归各管，这也是修饰符存在的意义。',
            knowledge: ['\\b', 'i']
          }
        ]
      },
      {
        id: 'extra-backreference',
        title: '\\1 反向引用',
        essence: '\\1 表示"这里必须出现和第 1 个捕获组刚刚捕获到的内容一模一样的东西" —— 它记的是结果，不是那段正则。',
        points: [
          '编号规则：从左到右数左括号，第 n 个左括号就是 \\n。命名组也参与编号。',
          '它让正则有了"记忆"，所以能做重复字符、重复单词、成对标签这类判断。',
          '引用的是运行时捕获到的文本，所以 (\\w)\\1 能匹配 aa、bb、77，绝不会匹配 ab。',
          '只写了括号却不需要回头引用时，最好改成 (?:)，省一个捕获组也省一次编号。'
        ],
        examples: [
          {
            title: '相邻两个相同字符',
            text: 'hello 1234 book',
            pattern: '(\\w)\\1',
            goal: 'hello 里的 ll、book 里的 oo 命中；1234 相邻两位都不相同，所以一处也不命中。',
            expect: ['ll', 'oo']
          },
          {
            title: '重复出现的单词',
            text: 'is is a test test',
            pattern: '\\b(\\w+)\\s+\\1\\b',
            goal: '括号先抓住一个单词，\\s+ 吃掉中间的空格，\\1 要求下一段和它完全相同。这能用来查文档里重复输入的字。',
            expect: ['is is', 'test test']
          },
          {
            title: '引号必须配对',
            text: `"abc" 'def'`,
            pattern: `(['"])\\w+\\1`,
            goal: '开头是单引号还是双引号先被捕获，结尾就必须是同一个 —— 如果用两个独立的 [\'"]，那 "abc\' 也会被当成合法。',
            expect: [`"abc"`, `'def'`]
          }
        ],
        pitfalls: [
          {
            wrong: '(a|b)\\1',
            why: '它不是"再匹配一次 a 或 b"，而是"再匹配一次刚才捕获的那一个"。所以能匹配 aa、bb，但不能匹配 ab。'
          }
        ],
        exercises: [
          {
            id: 'extra-br-1',
            level: 3,
            prompt: '找出所有"相邻两个字符完全相同"的地方（只要这两个字符本身）。',
            text: 'coffee 1001 book',
            expect: ['ff', 'ee', '00', 'oo'],
            answer: '(\\w)\\1',
            hints: [
              '先记住一个字符，再要求下一个和它一样。',
              '记住靠 ()，回头比较靠 \\1。',
              '写成 (\\w)\\1。'
            ],
            explain: 'coffee 里 ff、ee；1001 里两个 0；book 里 oo。注意 1001 的 1 和 1 之间隔着两个 0，不相邻，所以不算。',
            knowledge: ['()', '\\1']
          },
          {
            id: 'extra-br-2',
            level: 4,
            prompt: '找出连续重复出现的同一个单词（形如 "xxx xxx"），结果要包含中间的空格。',
            text: 'the cat is is a cat cat',
            expect: ['is is', 'cat cat'],
            answer: '\\b(\\w+)\\s+\\1\\b',
            hints: [
              '要抓住整个单词，所以括号里是 \\w+ 而不是 \\w。',
              '中间的空格不要算进捕获组，否则比较的就不是单词了。',
              '\\b(\\w+)\\s+\\1\\b。'
            ],
            explain: '括号只包住单词，空格用 \\s+ 单独吃掉，这样 \\1 比较的才是纯粹的单词。前后的 \\b 保证不会从单词中间截一段来比。',
            knowledge: ['\\1', '\\s', '\\b']
          }
        ]
      },
      {
        id: 'extra-named-group',
        title: '(?<名字>) 命名分组',
        essence: '给捕获组起个名字，取结果时就不用数括号 —— 编号会变，名字不会。',
        points: [
          '写法是 (?<year>\\d{4})，JS 里从 match.groups.year 取，Java 里用 matcher.group("year")。',
          '命名组照样占编号，顺序仍然是从左到右数左括号 ——( ?<y>…) 是第 1 组，紧跟的普通组是第 2 组。',
          '命名反向引用写成 \\k<名字>，比数 \\3 靠谱得多。',
          '一条正则里有 4 个以上的组时，命名几乎是必须的，否则半年后没人看得懂。'
        ],
        examples: [
          {
            title: '日期三段各取名字',
            text: '2026-10-26',
            pattern: '(?<y>\\d{4})-(?<m>\\d{2})-(?<d>\\d{2})',
            goal: '三个组分别叫 y、m、d。取的时候写 groups.y，不需要再数"这是第 2 个括号"。',
            expect: ['2026-10-26'],
            groups: ['2026', '10', '26']
          },
          {
            title: '命名反向引用',
            text: `"abc" 'def'`,
            pattern: `(?<q>['"])\\w+\\k<q>`,
            goal: '和上一节用 \\1 的效果完全一样，但读的时候一眼能看出"结尾要和开头那个引号一样"，不用回头数括号。',
            expect: [`"abc"`, `'def'`]
          },
          {
            title: '命名不改变编号',
            text: 'a1',
            pattern: '(?<letter>[a-z])(\\d)',
            goal: '命名组 letter 是第 1 组，后面的普通组是第 2 组。命名只是给编号取了个别名，顺序还是按左括号出现的位置。',
            expect: ['a1'],
            groups: ['a', '1']
          }
        ],
        exercises: [
          {
            id: 'extra-ng-1',
            level: 3,
            mode: 'groups',
            prompt: '从查询串里把每个 key 和 value 都取出来（按出现顺序，一共 6 段）。',
            text: 'user=10086&role=admin&city=SH',
            expect: ['user', '10086', 'role', 'admin', 'city', 'SH'],
            answer: '(?<key>\\w+)=(?<val>\\w+)',
            accept: ['(\\w+)=(\\w+)'],
            hints: [
              '每一组都是「单词 = 单词」的形状。',
              '两个要取的部分各自加括号，中间那个等号放在括号外。',
              '可以用命名组 (?<key>\\w+)=(?<val>\\w+)，也可以用普通组 (\\w+)=(\\w+)。'
            ],
            explain: '等号是定位用的固定文字，不该进捕获组；两侧的 \\w+ 才是要取的值。& 不是 \\w，所以下一个匹配会自动从它后面开始。',
            knowledge: ['(?<>)', '()']
          },
          {
            id: 'extra-ng-2',
            level: 4,
            prompt: '找出配对正确的 HTML 标签整体（开标签和闭标签名字要一致），最后一组名字对不上，不要它。',
            text: '<b>x</b> <i>y</i> <b>z</i>',
            expect: ['<b>x</b>', '<i>y</i>'],
            answer: '<(?<tag>\\w+)>[^<]*</\\k<tag>>',
            accept: ['<(\\w+)>[^<]*</\\1>'],
            hints: [
              '先把标签名存起来，闭合时再拿出来比较。',
              '存用 (?<tag>\\w+)，回头比较用 \\k<tag>。',
              '中间的内容用 [^<]*，比 .* 更严格，也不会跨过下一个标签。'
            ],
            explain: '<b>z</i> 之所以没命中，是因为 \\k<tag> 拿到的是 b，而这里闭合写的是 i，对不上就整体失败。这正是"记忆"能做的事，纯字符类做不到。',
            knowledge: ['\\k<>', '[]', '*']
          }
        ]
      },
      {
        id: 'extra-lazy-all',
        title: '懒惰的完整形态：*? +? ?? {n,m}?',
        essence: '任何量词后面加一个 ? 就变懒惰：先试最少，满足不了才多吃一口。',
        points: [
          '*? +? ?? {n,m}? 规律完全统一 —— 不要只记住 .*? 这一种。',
          '?? 是"能不要就不要"，所以它经常匹配出空串，这是它合法的表现，不是 bug。',
          '懒惰只改变"优先顺序"，不改变"能不能匹配"：同一个目标，贪婪和懒惰最终都能命中，只是边界不同。',
          '当后面还有别的条件时，懒惰才有真正的用武之地 —— 后面没条件，两者结果一样。'
        ],
        examples: [
          {
            title: '贪婪：先吃满 4 位',
            text: '1234567',
            pattern: '\\d{2,4}',
            goal: '每个位置都尽量吃 4 个：1234、567（最后只剩 3 位，就在允许范围内取 3 个）。',
            expect: ['1234', '567']
          },
          {
            title: '懒惰：只吃 2 位就走',
            text: '1234567',
            pattern: '\\d{2,4}?',
            goal: '同一个文本，同一个量词，只多了一个 ?：每次只取最少的 2 位，得到 12、34、56，最后剩一个 7 不够 2 位就放弃。',
            expect: ['12', '34', '56']
          },
          {
            title: '后面有条件时，懒惰才显出来',
            text: 'a<b>c<d>',
            pattern: '<.+?>',
            goal: '.+? 每吃一个字符就回头看看后面是不是 >，是就停。如果写成 <.+>（贪婪），它会一路吃到最后一个 >，结果是 <b>c<d>。',
            expect: ['<b>', '<d>']
          }
        ],
        exercises: [
          {
            id: 'extra-lz-1',
            level: 3,
            prompt: '把每个 HTML 标签单独切出来，不能一次吞掉整段。',
            text: '<a>1</a><b>2</b>',
            expect: ['<a>', '</a>', '<b>', '</b>'],
            answer: '<.+?>',
            hints: [
              '标签的形状是 < 开头、> 结尾，中间是标签内容。',
              '如果不加限制，.+ 会一路吃到最后一个 >。',
              '在量词后面加 ? 变成懒惰：<.+?>。'
            ],
            explain: '<.+?> 每吃一个字符就检查一次后面的 >，所以四个标签各自成段。换成 <.+> 只会得到一个 <a>1</a><b>2</b>，因为贪婪会一直吃到最后一个 >。',
            knowledge: ['.+?', '.*?']
          },
          {
            id: 'extra-lz-2',
            level: 4,
            prompt: '取出每个 <p> 标签里的文字（标签本身不要），两段都要。',
            text: '<p>hi</p><p>yo</p>',
            expect: ['hi', 'yo'],
            answer: '(?<=<p>).+?(?=</p>)',
            hints: [
              '文字前面一定是 <p>，后面一定是 </p>，但两边都不该出现在结果里。',
              '前面用后行断言 (?<=<p>)，后面用先行断言 (?=</p>)。',
              '中间的文字用 .+?，懒惰一点，别跨过 </p>。'
            ],
            explain: '两个断言都是零宽的，所以结果只剩文字本身。.+? 保证吃到第一个 </p> 之前就停；如果写成 .+，在两段之间它有可能越过边界。',
            knowledge: ['(?<=)', '(?=)', '.+?']
          }
        ]
      },
      {
        id: 'extra-unicode',
        title: '\\p{...} Unicode 属性类',
        essence: '\\p{属性} 按 Unicode 官方分类去匹配字符，是唯一能可靠匹配「汉字 / 字母 / 标点」的手段。',
        points: [
          '必须配 u 修饰符，否则整条正则直接编译不过（不是匹配不到，是报错）。',
          '\\p{Script=Han} 是汉字（不含中文标点），\\p{L} 是所有语言的字母，\\p{Nd} 是所有语言的十进制数字。',
          '\\P{...} 是取反，等价于 [^\\p{...}]。',
          '\\w 和 \\d 只管 ASCII：全角数字 １２３ 用 \\d 一个都匹配不到，得用 \\p{Nd}。'
        ],
        examples: [
          {
            title: '只取汉字',
            text: 'abc中文123',
            pattern: '\\p{Script=Han}+',
            flags: 'gu',
            goal: 'Script=Han 精确指向汉字，英文和数字都不会被卷进来。比起 [\\u4e00-\\u9fa5]，它能覆盖生僻字和扩展区汉字。',
            expect: ['中文']
          },
          {
            title: '\\d 认不出全角数字',
            text: '123 １２３',
            pattern: '\\d+',
            goal: '后面那三个全角数字 １２３ 用 \\d 一个也匹配不到 —— 这是处理用户输入时非常容易翻车的地方。',
            expect: ['123']
          },
          {
            title: '\\p{Nd} 才认所有数字',
            text: '123 １２３',
            pattern: '\\p{Nd}+',
            flags: 'gu',
            goal: '同一个文本、同一个思路，换成 \\p{Nd} 就能把全角和半角都拿下：得到两段。',
            expect: ['123', '１２３']
          },
          {
            title: '中文标点也自成一类',
            text: 'Hello，世界！',
            pattern: '\\p{P}+',
            flags: 'gu',
            goal: '\\p{P} 是"标点"这个大类，中文的，和！都算。英文句号、括号也都在里面。',
            expect: ['，', '！']
          }
        ],
        pitfalls: [
          {
            wrong: '\\p{Script=Han} 不带 u 修饰符',
            why: '浏览器会直接抛 Invalid property name 之类的错误，而不是"匹配不到"。看到这类报错，先检查 u。'
          }
        ],
        exercises: [
          {
            id: 'extra-uni-1',
            level: 4,
            prompt: '提取所有汉字（中文标点和英文都不要），连在一起的要合成一段。',
            text: '第 3 章：正则表达式（Regex）',
            flags: 'gu',
            expect: ['第', '章', '正则表达式'],
            answer: '\\p{Script=Han}+',
            accept: ['\\p{sc=Han}+'],
            hints: [
              '汉字不是 \\w，所以 \\w+ 这条路走不通。',
              '需要按 Unicode 分类来匹配，并且记得加 u 修饰符。',
              '\\p{Script=Han}+，flag 用 gu。'
            ],
            explain: '：和（）都是标点，不属于 Han；Regex 属于拉丁字母。所以三段汉字被单独切出来，中间的间隔都被排除了。',
            knowledge: ['\\p{}', 'u']
          },
          {
            id: 'extra-uni-2',
            level: 4,
            prompt: '反过来：提取所有"不是汉字"的连续片段。',
            text: '正则RegExp学习',
            flags: 'gu',
            expect: ['RegExp'],
            answer: '\\P{Script=Han}+',
            accept: ['[^\\p{Script=Han}]+'],
            hints: [
              '汉字那一段要排掉，所以要用"取反"的属性类。',
              '\\p{...} 的取反写法是把 p 换成大写 P。',
              '\\P{Script=Han}+。'
            ],
            explain: '\\P 是 \\p 的反面，匹配"属性不是 Han"的字符。RegExp 六个字母连在一起，所以只得到一段。',
            knowledge: ['\\P{}', 'u']
          }
        ]
      },
      {
        id: 'extra-escape-codes',
        title: '码位转义：\\x41 \\u4e00 \\u{1F600}',
        essence: '用十六进制码位写字符，专门用来表达看不见的字符，或者写一段范围。',
        points: [
          '\\xNN 是两位十六进制（Latin-1 范围）；\\uNNNN 是四位；\\u{...} 要配 u 修饰符，能写到 U+10FFFF（emoji 必须用它）。',
          '[\\u4e00-\\u9fa5] 是网上最常见的中文范围，但它只覆盖 CJK 基本区 —— 更稳的写法是 \\p{Script=Han}。',
          '码位转义在字符类里也能做范围的一端：[\\x30-\\x39] 就是 [0-9]。',
          '看不见的控制字符：\\t 制表、\\n 换行、\\r 回车、\\f 换页、\\v 垂直制表、\\0 空字符。'
        ],
        examples: [
          {
            title: '\\x41 就是 A',
            text: 'A B C',
            pattern: '\\x41',
            goal: '0x41 是拉丁大写字母 A 的码位，效果和直接写 A 完全一样。写码位的好处是不受文件编码和肉眼歧义影响。',
            expect: ['A']
          },
          {
            title: '用范围圈住中文',
            text: 'abc中文xyz',
            pattern: '[\\u4e00-\\u9fa5]+',
            goal: '这是老项目里最常见的中文范围写法。能跑，但只覆盖 20902 个常用汉字，生僻字会漏。',
            expect: ['中文']
          },
          {
            title: 'emoji 必须用花括号',
            text: '😀 hi',
            pattern: '\\u{1F600}',
            flags: 'gu',
            goal: 'U+1F600 超出了四位十六进制的表示范围（超过 FFFF），只能用 \\u{...} 并且必须开 u 修饰符。',
            expect: ['😀']
          }
        ],
        exercises: [
          {
            id: 'extra-code-1',
            level: 3,
            prompt: '用码位范围匹配出中文部分（连续的要合成一段）。',
            text: 'abc中文xyz',
            expect: ['中文'],
            answer: '[\\u4e00-\\u9fa5]+',
            hints: [
              '要给中文划定一个码位区间。',
              '常用汉字大致在 \\u4e00 到 \\u9fa5 之间。',
              '写成 [\\u4e00-\\u9fa5]+。'
            ],
            explain: '字符类里用码位做范围是完全合法的，这样写不依赖任何具体汉字，换一段中文照样能匹配。',
            knowledge: ['\\u', '[]']
          },
          {
            id: 'extra-code-2',
            level: 3,
            prompt: '用十六进制码位表示 0-9 的范围，找出文本里的数字。',
            text: 'A1B2',
            expect: ['1', '2'],
            answer: '[\\x30-\\x39]',
            accept: ['[0-9]'],
            hints: [
              '数字 0 的码位是 0x30，9 是 0x39。',
              '在字符类里用这两个码位组成范围。',
              '[\\x30-\\x39]，它和 [0-9] 完全等价。'
            ],
            explain: '0x30 到 0x39 正好是 ASCII 的 0 到 9。写码位和写 0-9 效果一样，但码位写法能避免某些环境下数字被当成别的字符。',
            knowledge: ['\\x', '[]']
          }
        ]
      },
      {
        id: 'extra-flags',
        title: 'i / s / u / y / d 五个修饰符',
        essence: '修饰符改变整条正则的"世界观"：大小写算不算一样、点能不能跨行、边界按行还是按整段。',
        points: [
          'i 忽略大小写；s 让 . 也能匹配换行；m 让 ^ $ 按行生效（前面章节已讲）；u 启用 Unicode；y 粘性；d 返回位置信息。',
          '可以叠加：gim、gsu 都合法。注意 s 和 m 名字像但完全无关 —— s 是 dotAll，m 是 multiline。',
          'y（sticky）比 g 严格：g 会跳过不合格的位置继续找，y 要求必须紧接着上一次的结束位置。',
          '本工具的输入框把修饰符放在独立的一栏，写代码时它们是 new RegExp(pattern, flags) 的第二个参数。'
        ],
        examples: [
          {
            title: 'i：大小写不敏感',
            text: 'Hello HELLO hello',
            pattern: 'hello',
            flags: 'gi',
            goal: '只加一个 i，三种大小写全部命中。这比手写 [hH][eE][lL][lL][oO] 可读得多。',
            expect: ['Hello', 'HELLO', 'hello']
          },
          {
            title: '不开 s，点过不了换行',
            text: 'a\nb',
            pattern: 'a.b',
            goal: 'a 和 b 中间是一个换行符，而 . 默认不匹配换行，所以一处也匹配不到。',
            expect: []
          },
          {
            title: 's：让点也吃换行',
            text: 'a\nb',
            pattern: 'a.b',
            flags: 'gs',
            goal: '同一个正则、同一个文本，只多了 s，就能跨过换行把 a 和 b 连起来。',
            expect: ['a\nb']
          },
          {
            title: 'y：必须紧挨着上一次的结尾',
            text: 'ab-ab-ab',
            pattern: 'ab',
            flags: 'gy',
            goal: '粘性匹配拿到第一个 ab 后，要求第二个必须从 - 开始 —— 它不是 ab，于是整个匹配过程立刻停止，只得到一个结果。',
            expect: ['ab']
          },
          {
            title: 'g：跳过不合格的位置继续找',
            text: 'ab-ab-ab',
            pattern: 'ab',
            flags: 'g',
            goal: '和上面同一个正则、同一个文本，g 会自动跳过两个 -，所以三个都拿到。这就是 g 和 y 唯一的区别。',
            expect: ['ab', 'ab', 'ab']
          }
        ],
        pitfalls: [
          {
            wrong: '把 s 当成"多行模式"',
            why: 's 是 dotAll（点匹配换行），多行是 m（^ $ 按行）。名字很像，作用完全不同。'
          },
          {
            wrong: '以为 \\w 开了 u 就认识中文',
            why: 'u 只是让 \\p{...}、\\u{...}、代理对正常工作，\\w 仍然只管 [A-Za-z0-9_]。要中文还得用 \\p{Script=Han}。'
          }
        ],
        exercises: [
          {
            id: 'extra-flag-1',
            level: 3,
            prompt: '提取所有 error，不管大小写。',
            text: 'ERROR error Error warn',
            flags: 'gi',
            expect: ['ERROR', 'error', 'Error'],
            answer: 'error',
            hints: [
              '不需要在正则里写 [eE][rR]... 这种笨办法。',
              '大小写差异交给修饰符。',
              '直接写 error，加上 i（本工具里还要带 g）。'
            ],
            explain: 'i 让整个正则的大小写判断失效，所以三种写法都被当成同一个词。修饰符的作用范围是整条正则，没有"只对某一段生效"的说法。',
            knowledge: ['i']
          },
          {
            id: 'extra-flag-2',
            level: 4,
            prompt: '跨行把 a=1 和紧跟的 b=2 连成一段（两行都要，中间包含换行）。',
            text: 'a=1\nb=2\nc=3',
            flags: 'gs',
            expect: ['a=1\nb=2'],
            answer: '^a=1.b=2',
            hints: [
              '要让 . 吃掉中间的换行符。',
              '对应的修饰符是 s（dotAll）。',
              '^a=1.b=2，flag 用 gs。'
            ],
            explain: '没有 s 时 . 在换行处就断了；加了 s 之后 . 才真正变成"任意字符"。注意它不会替你把 c=3 也吃进来，因为模式里写死到 b=2 就结束了。',
            knowledge: ['s', '^']
          }
        ]
      },
      {
        id: 'extra-charset-edge',
        title: '字符类内部的规则细节',
        essence: '方括号里有一整套独立规则：多数元字符失效，但 - ] ^ \\ 四个仍然特殊。',
        points: [
          '- 只有夹在两个字符中间才是"范围"；放在开头或结尾就是普通的连字符：[a-] 匹配 a 或 -。',
          '] 必须转义成 \\]；^ 只有紧跟 [ 时才是取反，写在别处就是普通的 ^。',
          '. * + ? ( ) { } 进了方括号就全部失去特殊含义：[.] 只匹配一个实实在在的点。',
          '坑：[] 在 JS 里是"永不匹配"的空集合，[^] 反而是"匹配任何字符"（包括换行）—— 两个都不能凭直觉理解。'
        ],
        examples: [
          {
            title: '- 在末尾是普通字符',
            text: 'a-b',
            pattern: '[a-]+',
            goal: '这里的 - 在方括号最后，不是范围符号，所以集合是 {a, -}，b 不在里面，命中就停在 b 之前。',
            expect: ['a-']
          },
          {
            title: '点在类里不是"任意字符"',
            text: 'a.b c.d',
            pattern: '[.]+',
            goal: '方括号里的点只代表点本身，所以只拿到两个真实的句点。',
            expect: ['.', '.']
          },
          {
            title: '对比：类外的点是任意字符',
            text: 'a.b c.d',
            pattern: '.+',
            goal: '同样一个点，写在方括号外就变成"任意字符"，贪婪之下整段都被吃掉了。',
            expect: ['a.b c.d']
          }
        ],
        pitfalls: [
          {
            wrong: '[*+]',
            why: '这写法本身没问题（类里的 * 就是普通星号），但要清楚它匹配的是「星号或加号」这两个字符，不是"任意多次"。'
          },
          {
            wrong: '[]',
            why: 'JS 里空方括号是"永远匹配不上"的正则，不会报错，只会静默地一处都不匹配。想要"任意字符"写 [^]。'
          }
        ],
        exercises: [
          {
            id: 'extra-cs-1',
            level: 3,
            prompt: '提取文本里的点或连字符（连续的算一段）。',
            text: 'v1.2.3-release build-42',
            expect: ['.', '.', '-', '-'],
            answer: '[.-]+',
            hints: [
              '这两个符号都可以放进同一个方括号里。',
              '注意 - 的位置：放在最后就不会被当成范围。',
              '[.-]+。'
            ],
            explain: '集合里只有 . 和 -，所以 1、2、3、release 这些字母数字全部被排除。如果把 - 放在中间写成 [.-x]，它就变成"从 . 到 x"的范围了。',
            knowledge: ['[]', '-']
          },
          {
            id: 'extra-cs-2',
            level: 3,
            prompt: '匹配文本里的右方括号（连着几个算一段）。',
            text: 'a]]b',
            expect: [']]'],
            answer: '[\\]]+',
            accept: ['\\]+'],
            hints: [
              '] 是方括号的结束标记，直接写会提前把类闭合。',
              '要么在类里转义成 \\]，要么干脆不用类、直接转义 \\]。',
              '[\\]]+ 或 \\]+。'
            ],
            explain: '类里的 ] 必须转义，否则解析器认为集合到那里就结束了。这条规则和外面一样：想让元字符变成普通字符，就加反斜杠。',
            knowledge: ['[]', '\\]']
          }
        ]
      },
      {
        id: 'extra-engine-diff',
        title: 'Java 有、浏览器没有的语法',
        essence: '正则不是"一种语言"：Java 和浏览器各有一套引擎，同一段正则在两边行为可能不同 —— 这一节专门讲差异。',
        points: [
          'Java 独有：\\Q...\\E（中间全按字面量）、\\A \\z（绝对首尾）、\\G（上次匹配结束处）、内联修饰符 (?i)、原子组 (?>...)、占有量词 *+。',
          '浏览器独有：y（粘性）、d（位置信息）、更宽松的变长后顾断言（Java 只允许有限长度）。',
          '最实际的差异：Java 的 $ 默认也匹配"结尾换行符之前"，浏览器的 $ 不匹配 —— 同一个 ^abc$ 在两边结论可能相反。',
          '本地工具用浏览器引擎跑，所以 Java 独有语法在这里会直接报错。先用等价写法验证思路，再贴到 Java 里替换。'
        ],
        examples: [
          {
            title: 'Java 的 \\Q...\\E 对应这里的逐个转义',
            text: 'a+b c*d',
            pattern: 'a\\+b',
            goal: 'Java 里可以写 \\Qa+b\\E 让中间整段按字面量处理；浏览器不支持 \\Q，只能像这样把 + 手动转义成 \\+。',
            expect: ['a+b']
          },
          {
            title: '内联 (?i) 对应这里的 i 修饰符',
            text: 'ABC abc',
            pattern: 'abc',
            flags: 'gi',
            goal: 'Java 支持 (?i) 并且能只影响后面一段（(?i:abc) 只作用于这个组）；浏览器只能用整条 i 修饰符，做不到"局部忽略大小写"。',
            expect: ['ABC', 'abc']
          },
          {
            title: '原子组要防的回溯，用互斥字符类代替',
            text: '<a><b>',
            pattern: '<[^>]*>',
            goal: 'Java 里 (?><[^>]*>) 或 <[^>]*+> 用来禁止回溯、避免 (a+)+ 式的爆炸。浏览器没有这两个语法，通常改用 [^>]* 这种"和结束符互斥"的类达到同样效果。',
            expect: ['<a>', '<b>']
          }
        ],
        code: [
          {
            lang: 'java',
            title: '只有 Java 支持的写法',
            code: `// 1) \\Q...\\E：中间的内容全部按字面量，不用逐个转义
Pattern.compile("\\\\Qa+b\\\\E");          // 等价于 a\\+b

// 2) \\A \\z：绝对的字符串首尾（^ $ 在 MULTILINE 下会变成按行）
Pattern.compile("\\\\Aorder-\\\\d+\\\\z");

// 3) 内联修饰符：只影响它后面
Pattern.compile("(?i)select|UPDATE");     // 后面全部忽略大小写，UPDATE 也算
Pattern.compile("(?i:select)|UPDATE");    // 只有 select 忽略大小写

// 4) 原子组 / 占有量词：放弃回溯，避免 (a+)+ 爆炸
Pattern.compile("(?>\\\\d+)");             // 原子组
Pattern.compile("\\\\d++");                // 占有量词

// 5) 注释模式：忽略空白，可以写注释（JS 没有）
Pattern.compile("(?x) \\\\d{4} - \\\\d{2} - \\\\d{2}   # 日期");`
          },
          {
            lang: 'java',
            title: 'Java 里 $ 的那个坑',
            code: `// Java：$ 默认也匹配"结尾换行符之前"
Pattern.compile("abc$").matcher("abc\\n").find();   // true  ← 容易踩
Pattern.compile("abc\\\\z").matcher("abc\\n").find();  // false ← 想要绝对结尾用它

// 浏览器（本工具）：$ 不认结尾换行，同一个正则会返回 false
// 所以一段正则从 Java 搬到前端，务必回归这两个用例`
          }
        ],
        exercises: [
          {
            id: 'extra-diff-1',
            level: 3,
            prompt: '把每个标签单独取出来（标签内部不含 >，所以不要用 .* 硬吃）。',
            text: '<title>A</title><title>B</title>',
            expect: ['<title>', '</title>', '<title>', '</title>'],
            answer: '<[^>]*>',
            hints: [
              '标签内部的字符有一个天然的限制：不可能出现 >。',
              '用"排除某个字符"的字符类，比用 . 更严格。',
              '<[^>]*>。'
            ],
            explain: '这就是浏览器里替代原子组的常用手法：[^>]* 和结束符 > 互斥，所以它天然不会跨过边界，也就不存在需要回溯的情况。',
            knowledge: ['[]', '*']
          },
          {
            id: 'extra-diff-2',
            level: 4,
            prompt: '文本必须以 .java 结尾才算（用词：结尾，不是"后面每行都算"）。',
            text: 'a.java b.java.txt c.java',
            expect: ['.java'],
            answer: '\\.java$',
            hints: [
              '要先匹配一个真正的点，再加扩展名。',
              '点本身是元字符，得转义成 \\.。',
              '结尾限定用 $，整条写 \\.java$。'
            ],
            explain: 'b.java.txt 虽然含 .java，但它后面还有 .txt，$ 卡不住，所以被排除；c.java 是真正的结尾，命中。Java 里想表达"绝对结尾"更稳的是 \\z。',
            knowledge: ['$', '\\.']
          }
        ]
      }
    ]
  }
]
