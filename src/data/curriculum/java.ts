import type { Chapter } from '@/types'

/** 第 11 章 Java 正则专题 */
export const javaChapters: Chapter[] = [
  {
    id: 'java',
    no: '11',
    title: 'Java 正则专题',
    subtitle: 'Pattern / Matcher 与那两层转义',
    stage: '第四阶段 · 落地',
    lessons: [
      {
        id: 'java-find-vs-matches',
        title: 'find() 与 matches()',
        essence: 'find() 是"文本里有没有"，matches() 是"整串是不是"。这是 Java 新手第一个坑。',
        points: [
          'find()：从任意位置开始找，找到一个就返回 true，可以循环找全部。',
          'matches()：要求整个输入从头到尾完全匹配，等价于正则前后自动加了 ^ 和 $。',
          '所以同一个正则，find() 成功不代表 matches() 成功。',
          '要判断"包含"用 find()，要判断"格式合法"用 matches()。'
        ],
        examples: [
          {
            title: 'find() 命中，matches() 不命中',
            text: '订单号：SO202610260001，采购单：PO202610260002',
            pattern: 'SO\\d+',
            goal: '这段文本里确实有 SO202610260001，所以 find() 返回 true；但它不是"整串"，matches() 返回 false。',
            expect: ['SO202610260001']
          },
          {
            title: '想用 matches() 校验，就得把两头也描述出来',
            text: 'SO202610260001',
            pattern: '^SO\\d+$',
            goal: '加上 ^ $ 才是"整串必须是订单号"。Java 里可以直接用 SO\\d+.matches 语义的 matches()。',
            expect: ['SO202610260001']
          }
        ],
        code: [
          {
            lang: 'java',
            title: 'find() 循环找出全部订单号',
            code: `String text = "订单号：SO202610260001，采购单：PO202610260002";
Pattern pattern = Pattern.compile("SO\\\\d+");
Matcher matcher = pattern.matcher(text);

while (matcher.find()) {
    System.out.println(matcher.group());   // SO202610260001
}

// 对比：matches() 要求整串完全匹配
System.out.println(Pattern.compile("SO\\\\d+").matcher(text).matches()); // false
System.out.println(text.matches(".*SO\\\\d+.*"));                       // true（用 .* 放宽两头）`
          }
        ],
        exercises: [
          {
            id: 'java-find-1',
            level: 3,
            prompt: '提取文本中所有的订单号（SO 开头 + 数字），这题对应 Java 里 find() 的语义。',
            text: '订单号：SO202610260001，采购单：PO202610260002，退款单：SO202610270009',
            expect: ['SO202610260001', 'SO202610270009'],
            answer: 'SO\\d+',
            hints: ['先找固定前缀。', '前缀后面是一串数字。', 'SO\\d+，在 Java 里配合 while (matcher.find()) 使用。'],
            explain: 'find() 会在文本里逐次搜索，每次找到一个就停下，所以两笔 SO 订单都能拿到；PO 开头的因为前缀不符被跳过。',
            knowledge: ['Java', 'find', '\\d']
          }
        ]
      },
      {
        id: 'java-group',
        title: 'group() 与 replaceAll / split',
        essence: 'group(n) 取第 n 个捕获组；replaceAll 用 $n 反向引用；split 用正则当分隔符。',
        points: [
          'group(0) 是整个匹配，group(1..n) 是捕获组，顺序按左括号。',
          'replaceAll 的替换串里可以用 $1、$2 引用捕获组，实现格式重组。',
          'split 的参数是正则，不是普通字符串：按点切分要写 split("\\\\.")。',
          '这三个 API 覆盖了后端 90% 的正则使用场景。'
        ],
        examples: [
          {
            title: 'group 取值：拆日期',
            text: '2026-10-26',
            pattern: '(\\d{4})-(\\d{2})-(\\d{2})',
            goal: 'group(1)=2026、group(2)=10、group(3)=26。这就是 Java 里 matcher.group(1) 拿到的内容。',
            expect: ['2026-10-26'],
            groups: ['2026', '10', '26']
          },
          {
            title: 'replaceAll 重组格式',
            text: '2026-10-26',
            pattern: '\\d{4}-\\d{2}-\\d{2}',
            goal: '匹配整段日期，再在 Java 里用 $1 年 $2 月 $3 日 重组。注意：这里展示的是"匹配"，替换动作由 replaceAll 完成。',
            expect: ['2026-10-26']
          }
        ],
        code: [
          {
            lang: 'java',
            title: 'group / replaceAll / split 三件套',
            code: `String date = "2026-10-26";
Matcher m = Pattern.compile("(\\\\d{4})-(\\\\d{2})-(\\\\d{2})").matcher(date);
if (m.find()) {
    System.out.println(m.group(1)); // 2026
    System.out.println(m.group(2)); // 10
    System.out.println(m.group(3)); // 26
}

// $1 $2 $3 反向引用捕获组
String cn = date.replaceAll("(\\\\d{4})-(\\\\d{2})-(\\\\d{2})", "$1年$2月$3日");
System.out.println(cn); // 2026年10月26日

// split 的参数是正则，点号要转义
String[] parts = "a.b.c".split("\\\\.");
System.out.println(parts.length); // 3

// 按逗号或分号切分（或运算）
"a,b;c".split("[,;]");`
          }
        ],
        exercises: [
          {
            id: 'java-group-2',
            level: 5,
            prompt: '实战：把这一整行日志拆成 5 个字段（日期、时间、级别、userId、action），并用 ^ ... $ 卡住整行。',
            text: '2026-10-26 15:30:25 [INFO] userId=10086 action=LOGIN',
            expect: ['2026-10-26', '15:30:25', 'INFO', '10086', 'LOGIN'],
            answer: '^(\\d{4}-\\d{2}-\\d{2}) (\\d{2}:\\d{2}:\\d{2}) \\[(\\w+)\\] userId=(\\d+) action=(\\w+)$',
            mode: 'groups',
            hints: [
              '先把这一行的固定结构拆开：日期、空格、时间、空格、[级别]、userId=数字、action=单词。',
              '每个要取出来的部分用括号括起来，定位用的文字（如 userId=）放在括号外。',
              '方括号是元字符要转义，最后用 ^ 和 $ 保证整行都符合，不能多出内容。'
            ],
            explain:
              '五个捕获组从左到右就是五个字段。定位文字（空格、方括号、userId=、action=）全部放在括号外，只捕获真正需要的值 —— 这就是日志解析的标准写法。',
            knowledge: ['Java', 'group', '^', '$', '\\[']
          },
          {
            id: 'java-group-1',
            level: 4,
            prompt: '把日期拆成三个捕获组：年、月、日。',
            text: '生成时间：2026-10-26 15:30:25',
            expect: ['2026', '10', '26'],
            answer: '(\\d{4})-(\\d{2})-(\\d{2})',
            mode: 'groups',
            hints: ['三段数字分别加括号。', '年份 4 位，月日各 2 位。', '(\\d{4})-(\\d{2})-(\\d{2})。'],
            explain: '三个捕获组从左到右依次是年、月、日，对应 Java 里的 group(1)(2)(3)。',
            knowledge: ['Java', 'group', '()']
          }
        ]
      },
      {
        id: 'java-double-escape',
        title: '为什么是两层转义',
        essence: 'Java 字符串先要把 \\ 转义成 \\\\，正则引擎才看得到 \\d —— 所以正则 \\d+ 在 Java 里写成 "\\\\d+"。',
        points: [
          '第一层是 Java 字符串字面量：\\ 在字符串里必须写成 \\\\。',
          '第二层是正则语法：正则想要 \\d，字符串里就得提供 \\d 这个字符序列。',
          '结论：正则里每出现一个反斜杠，Java 字符串里就要写两个。',
          '用 Pattern.quote() 可以自动转义一段"字面量"，但不要用它包整条正则。'
        ],
        examples: [
          {
            title: '正则想要的效果',
            text: 'userId=10086',
            pattern: '\\d+',
            goal: '正则层面：\\d+ 匹配连续数字。这是"引擎看到的东西"。',
            expect: ['10086']
          },
          {
            title: 'Java 里要写成这样',
            text: 'a.b',
            pattern: '\\.',
            goal: '正则层面的 \\.（匹配真正的点），在 Java 代码里必须写成 "\\\\."。多出来的那层给编译器看，不是给正则看。',
            expect: ['.']
          }
        ],
        code: [
          {
            lang: 'java',
            title: '同一件事的三种写法',
            code: `// 目标：匹配连续数字
Pattern.compile("\\\\d+");        // 正确：字符串 "\\d+" → 正则 \\d+

// 目标：匹配真正的点
Pattern.compile("\\\\.");         // 正确：字符串 "\\." → 正则 \\.

// 目标：匹配反斜杠本身
Pattern.compile("\\\\\\\\");      // 正确：字符串 "\\\\" → 正则 \\\\

// 常见错误
// Pattern.compile("\\d+");       // 编译期报错：\\d 不是合法转义序列
// Pattern.compile("\\\\d+") 写成 "\\d+" 时，正则看到的是 d+，语义完全不同`
          },
          {
            lang: 'java',
            title: '一个容易忽略的细节：split 的写法',
            code: `// 错误：字符串 "\\." 传给 split 是正则 \\.（匹配点）—— 这其实是"正确"的
"a.b".split("\\\\.");   // ["a","b"]

// 更常见的错误：写成 "."
"a.b".split(".");        // 结果长度 0 —— 因为 . 是"任意字符"，整串被吃光`
          }
        ],
        pitfalls: [
          {
            wrong: '把正则工具里调好的 \\d+ 直接粘进 Java 字符串',
            why: '必须再补一层反斜杠："\\\\d+"。同理 \\s → "\\\\s"、\\. → "\\\\."'
          }
        ],
        exercises: [
          {
            id: 'java-double-escape-1',
            level: 3,
            prompt: '匹配真正的句点（这题在网页里写 \\. 即可；到 Java 里它要写成 "\\\\."）。',
            text: '1.5 与 1x5',
            expect: ['.'],
            answer: '\\.',
            hints: ['点在正则里是特殊字符。', '要匹配它本身必须转义。', '答案是 \\.，Java 字符串里是 "\\\\."。'],
            explain: '正则 \\. 匹配真正的点；Java 源码里因为字符串转义，要写成 "\\\\."。',
            knowledge: ['Java', '转义', '\\.']
          }
        ]
      }
    ]
  }
]
