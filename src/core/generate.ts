/**
 * 随机题生成：知识点固定，数据随机 —— 防止背答案。
 * 每个生成器「先造数据、再算期望」，所以标准答案天然自洽。
 */
import type { Exercise, Generator, Level } from '@/types'

/* ---------------- 随机工具 ---------------- */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

export function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

export function pickMany<T>(rng: () => number, arr: T[], n: number): T[] {
  const pool = [...arr]
  const out: T[] = []
  while (out.length < n && pool.length) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0])
  }
  return out
}

/** 生成指定长度的正整数（不带前导 0） */
function num(rng: () => number, digits: number): string {
  let s = String(randInt(rng, 1, 9))
  for (let i = 1; i < digits; i++) s += String(randInt(rng, 0, 9))
  return s
}

const WORDS = ['abc', 'hello', 'order', 'user', 'test', 'demo', 'data', 'item', 'redis', 'mysql']
const CN = ['编号', '订单', '批次', '记录', '库存']
const LEVEL_TEXT: Record<Level, string> = { 1: '入门', 2: '基础', 3: '进阶', 4: '高级', 5: '实战' }

function mk(
  genId: string,
  level: Level,
  prompt: string,
  text: string,
  expect: string[],
  answer: string,
  hints: string[],
  explain: string,
  knowledge: string[],
  mode: Exercise['mode'] = 'matches',
  accept?: string[]
): Exercise {
  return {
    id: `rand-${genId}`,
    level,
    prompt,
    text,
    mode,
    expect,
    answer,
    accept,
    hints,
    explain,
    knowledge,
    flags: 'g'
  }
}

export function levelName(l: number): string {
  return `Lv${l} ${LEVEL_TEXT[l as Level] || ''}`
}

/* ---------------- 生成器 ---------------- */

export const generators: Generator[] = [
  {
    id: 'digit-extract',
    name: '提取所有连续数字',
    level: 1,
    knowledge: ['\\d', '+'],
    build(rng) {
      const w1 = pick(rng, WORDS)
      const w2 = pick(rng, WORDS)
      const n1 = num(rng, randInt(rng, 2, 4))
      const n2 = num(rng, randInt(rng, 2, 4))
      const text = `${w1}${n1}${w2}${n2}`
      return mk(
        'digit-extract',
        1,
        '从下面这段文本中提取出所有「连续的数字」（每段数字作为一个整体）。',
        text,
        [n1, n2],
        '\\d+',
        [
          '你要找的东西是「数字」，而且数字是连着出现的。',
          '数字可以用 \\d 表示。',
          '光有 \\d 只能一次吃一个字符，后面还需要一个表示「重复」的量词，比如 +。'
        ],
        `\\d 匹配一个数字，+ 表示前面的元素重复 1 次或多次。合起来 \\d+ 就会把 ${n1} 整体吃掉，而不是拆成单个数字。`,
        ['\\d', '+']
      )
    }
  },
  {
    id: 'digit-range',
    name: '提取 3~5 位数字',
    level: 2,
    knowledge: ['\\d', '{n,m}'],
    build(rng) {
      const ok1 = num(rng, randInt(rng, 3, 5))
      const ok2 = num(rng, randInt(rng, 3, 5))
      const short = num(rng, 2)
      const long = num(rng, 6)
      const items = [
        { v: short, ok: false },
        { v: ok1, ok: true },
        { v: long, ok: false },
        { v: ok2, ok: true }
      ]
      const shuffled = pickMany(rng, items, 4)
      const text = shuffled.map((it, i) => `${CN[i % CN.length]} ${it.v}`).join('，')
      const expect = shuffled.filter((it) => it.ok).map((it) => it.v)
      return mk(
        'digit-range',
        2,
        '提取出「长度为 3 到 5 位」的数字，2 位和 6 位都不算。',
        text,
        expect,
        '\\d{3,5}',
        [
          '先想清楚长度范围：至少 3 位，最多 5 位。',
          '数量范围用 {n,m} 表示，所以数字部分可以写成 \\d{...}。',
          '把范围填进去：\\d{3,5}。'
        ],
        `{3,5} 是「最少 3 次、最多 5 次」，所以 \\d{3,5} 只会吃 3 到 5 个数字。2 位不够长，6 位里虽然能切出 5 位，但题目里的数字都被非数字隔开了，所以不会误伤。`,
        ['\\d', '{n,m}']
      )
    }
  },
  {
    id: 'paren-extract',
    name: '提取括号中的内容',
    level: 3,
    knowledge: ['\\(', '\\)', '()', '[^]'],
    build(rng) {
      const k1 = pick(rng, ['host=redis', 'port=6379', 'mode=prod', 'level=debug', 'retry=3'])
      const k2 = pick(rng, ['pool=20', 'timeout=3s', 'cache=on', 'threads=8', 'limit=100'])
      const text = `启动参数(${k1})与连接配置(${k2})已加载`
      return mk(
        'paren-extract',
        3,
        `提取出两个括号里的内容（不要括号本身）：${k1} 和 ${k2}。`,
        text,
        [k1, k2],
        '\\(([^)]+)\\)',
        [
          '括号在正则里是特殊字符，要匹配它本身必须先转义。',
          '括号里的内容「不是右括号」的任意字符，可以写成 [^)]。',
          '用捕获组把内容括起来：\\(([^)]+)\\)，这样 group(1) 就是括号里的内容。'
        ],
        `\\( 和 \\) 匹配真正的括号；([^)]+) 用捕获组包住「一个或多个非右括号字符」，所以 group(1) 拿到的正好是括号内的文字；+ 保证不会匹配到空括号。`,
        ['\\(', '()', '[^]'],
        'groups',
        ['\\(([^)]*)\\)', '[(]([^)]+)[)]']
      )
    }
  },
  {
    id: 'lookahead-price',
    name: '取「元」前面的金额',
    level: 4,
    knowledge: ['(?=)', '\\d', '+'],
    build(rng) {
      const a = `${num(rng, randInt(rng, 2, 4))}.${String(randInt(rng, 0, 99)).padStart(2, '0')}`
      const b = num(rng, randInt(rng, 2, 4))
      const c = `${num(rng, randInt(rng, 2, 3))}.${String(randInt(rng, 0, 99)).padStart(2, '0')}`
      const text = `价格 ${a}元，运费 ${b}美元，优惠 ${c}元`
      return mk(
        'lookahead-price',
        4,
        '只提取「元」前面的金额（美元那个不要）。',
        text,
        [a, c],
        '\\d+(?:\\.\\d+)?(?=元)',
        [
          '金额里可能带小数点，先想清楚数字部分怎么描述。',
          '要限定「后面必须是元」，但又不能把「元」匹配进来 —— 这就是前瞻。',
          '用 (?=元) 放在最后：\\d+(?:\\.\\d+)?(?=元)。'
        ],
        `\\d+(?:\\.\\d+)? 匹配整数或小数；(?=元) 是零宽断言，只检查后面是不是「元」，不消耗字符，所以结果里不含「元」，而「美元」因为紧跟的是「美」而不是「元」，自然被排除。`,
        ['(?=)', '\\d']
      )
    }
  },
  {
    id: 'order-no',
    name: '提取订单号',
    level: 2,
    knowledge: ['[A-Z]', '\\d', '+'],
    build(rng) {
      const date = `2026${String(randInt(rng, 1, 12)).padStart(2, '0')}${String(randInt(rng, 1, 28)).padStart(2, '0')}`
      const tail = String(randInt(rng, 1, 9999)).padStart(4, '0')
      const no = `SO${date}${tail}`
      const other = `PO${date}${String(randInt(rng, 1, 9999)).padStart(4, '0')}`
      const text = `订单号：${no}（关联采购单 ${other}）`
      return mk(
        'order-no',
        2,
        `提取以 SO 开头的订单号（别把采购单 ${other} 也拿进来）。`,
        text,
        [no],
        'SO\\d+',
        [
          '订单号的固定特征是前缀 SO，后面全是数字。',
          'SO 是普通字符，直接写就行；数字部分用 \\d。',
          '数字是连续多个，别忘了量词：SO\\d+。'
        ],
        `SO 是字面量，\\d+ 匹配后面连续的数字。因为前缀写死了 SO，所以 PO 开头的那串不会被匹配。`,
        ['literal', '\\d', '+']
      )
    }
  },
  {
    id: 'log-field',
    name: '从日志里取 userId',
    level: 3,
    knowledge: ['()', '\\d', 'literal'],
    build(rng) {
      const uid = num(rng, randInt(rng, 4, 6))
      const lvl = pick(rng, ['INFO', 'WARN', 'ERROR'])
      const act = pick(rng, ['LOGIN', 'LOGOUT', 'QUERY', 'PAY'])
      const text = `2026-10-26 15:30:25 [${lvl}] userId=${uid} action=${act}`
      return mk(
        'log-field',
        3,
        '提取 userId 的值（只取数字部分，不要 "userId=" 这几个字）。',
        text,
        [uid],
        'userId=(\\d+)',
        [
          '先定位：值出现在 "userId=" 后面。',
          '把要保留的部分用括号括起来，才能单独取到它。',
          '写成 userId=(\\d+)，group(1) 就是你要的值。'
        ],
        `userId= 是定位用的字面量，括号里的 (\\d+) 才是捕获内容。因为用了捕获组，group(1) 只返回值，不包含 key。`,
        ['()', '\\d'],
        'groups'
      )
    }
  },
  {
    id: 'url-parts',
    name: '拆解 URL',
    level: 5,
    knowledge: ['()', '[^]', '\\w'],
    build(rng) {
      const scheme = pick(rng, ['https', 'http'])
      const domain = `${pick(rng, ['example', 'api', 'shop', 'admin'])}.com`
      const path = `/${pick(rng, ['user', 'order', 'item', 'v1/log'])}`
      const id = num(rng, randInt(rng, 3, 6))
      const text = `${scheme}://${domain}${path}?id=${id}`
      return mk(
        'url-parts',
        5,
        '把 URL 拆成四部分：协议、域名、路径、查询串（依次放进 4 个捕获组）。',
        text,
        [scheme, domain, path, `id=${id}`],
        '(\\w+)://([^/]+)(/[^?]*)\\?(.+)',
        [
          '四段分别用四个括号括起来，顺序就是捕获组编号。',
          '协议是字母，域名到第一个 / 为止，路径是 / 开头、? 之前的部分。',
          '可以用 [^/] 表示「不是斜杠的字符」，用 \\? 匹配问号本身。'
        ],
        `(\\w+) 取协议，([^/]+) 取域名（一直取到 / 为止），(/[^?]*) 取路径（到 ? 为止），\\? 匹配问号本身，( .+) 取剩下的查询串。四个括号从左到右就是 group(1..4)。`,
        ['()', '[^]', '\\?']
      )
    }
  },
  {
    id: 'ip-port',
    name: '拆 IP 与端口',
    level: 4,
    knowledge: ['\\d', '{n}', '()'],
    build(rng) {
      const ip = [randInt(rng, 10, 223), randInt(rng, 0, 255), randInt(rng, 0, 255), randInt(rng, 1, 254)].join('.')
      const port = String(randInt(rng, 3000, 9999))
      const text = `服务器地址：${ip}:${port}，连接超时 3000ms`
      return mk(
        'ip-port',
        4,
        '分别提取 IP 和端口（IP 放 group(1)，端口放 group(2)）。',
        text,
        [ip, port],
        '(\\d{1,3}(?:\\.\\d{1,3}){3}):(\\d+)',
        [
          'IP 是四段数字，用点连接；点本身要转义。',
          '「.数字」这一段重复了 3 次，可以用非捕获组配合 {3}。',
          '端口是冒号后的一串数字，别忘了把冒号转义前先想清楚它是不是特殊字符。'
        ],
        `\\d{1,3} 匹配第一段，(?:\\.\\d{1,3}){3} 表示「点 + 数字」再重复 3 次，正好凑满四段；冒号不是特殊字符可以直接写，冒号后的一串数字 (\\d+) 就是端口。注意要排除后面那个 3000ms —— 因为它前面没有冒号，所以不会被误匹配。`,
        ['\\d', '{n}', '(?:)']
      )
    }
  },
  {
    id: 'email',
    name: '提取邮箱',
    level: 3,
    knowledge: ['[]', '+', 'literal'],
    build(rng) {
      const user = `${pick(rng, ['zhang', 'li', 'wang', 'ops', 'dev'])}${randInt(rng, 1, 99)}`
      const mail = `${user}@${pick(rng, ['example.com', 'corp.cn', 'mail.io'])}`
      const text = `联系人：${mail}，备用：${user}@backup.cn`
      return mk(
        'email',
        3,
        '提取文本里的所有邮箱地址。',
        text,
        [mail, `${user}@backup.cn`],
        '[\\w.+-]+@[\\w-]+\\.[\\w.]+',
        [
          '邮箱 = 用户名 @ 域名，中间一定有 @。',
          '用户名允许字母数字和 . _ + -，可以用字符集合或 \\w 加上几个符号。',
          '@ 后面的域名里要小心那个点，它是特殊字符，需要 \\. 才算字面量。'
        ],
        `[\\w.+-]+ 匹配用户名部分；@ 是字面量；[\\w-]+ 匹配域名主体；\\. 匹配真正的点；[\\w.]+ 匹配顶级域名。`,
        ['[]', '+', '\\.']
      )
    }
  },
  {
    id: 'date-parts',
    name: '拆解日期',
    level: 3,
    knowledge: ['()', '{n}', '\\d'],
    build(rng) {
      const y = randInt(rng, 2020, 2026)
      const m = String(randInt(rng, 1, 12)).padStart(2, '0')
      const d = String(randInt(rng, 1, 28)).padStart(2, '0')
      const text = `业务日期 ${y}-${m}-${d}，请在三日内完成对账`
      return mk(
        'date-parts',
        3,
        '把日期拆成年、月、日三个捕获组（依次放在 group(1)(2)(3)）。',
        text,
        [String(y), m, d],
        '(\\d{4})-(\\d{2})-(\\d{2})',
        [
          '日期结构固定：4 位数字 - 2 位数字 - 2 位数字。',
          '每组数字用括号括起来，就是三个捕获组。',
          '注意：文本里有两个日期，题目要的是第二个 —— 你的正则要能匹配到它。'
        ],
        `\\d{4} 匹配年份，(\\d{2}) 匹配月份，(\\d{2}) 匹配日期，中间的 - 是字面量。因为每个数字段都加了括号，group(1..3) 依次是年、月、日。`,
        ['()', '{n}'],
        'groups',
        ['(\\d{4})-(\\d{2})-(\\d{2})']
      )
    }
  },
  {
    id: 'sql-table',
    name: '取出 SQL 里的表名',
    level: 4,
    knowledge: ['\\s', '()', '\\w'],
    build(rng) {
      const table = pick(rng, ['t_order', 't_user', 't_stock', 't_work_report'])
      const text = `select id, name from ${table} where status = 1 order by id desc`
      return mk(
        'sql-table',
        4,
        '提取 FROM 后面的表名（只要表名，不要 FROM）。',
        text,
        [table],
        'from\\s+(\\w+)',
        [
          '先定位关键字 FROM，注意 SQL 里大小写可能不一样。',
          '关键字后面至少有一个空白，用 \\s+。',
          '表名是字母数字下划线，用 \\w+，并用括号捕获它。'
        ],
        `from 是字面量定位，\\s+ 吃掉中间的空格，括号里的 \\w+ 才是表名。用 i 修饰符可以兼容大小写。`,
        ['\\s', '()', '\\w'],
        'groups'
      )
    }
  },
  {
    id: 'java-exception',
    name: '提取 Java 异常类型',
    level: 4,
    knowledge: ['[A-Za-z]', '\\w', '()'],
    build(rng) {
      const ex = pick(rng, [
        'java.lang.NullPointerException',
        'java.lang.IllegalArgumentException',
        'java.util.ConcurrentModificationException',
        'org.springframework.beans.factory.BeanCreationException'
      ])
      const short = ex.split('.').pop() as string
      const text = `${ex}: 处理订单时发生错误\n\tat com.demo.OrderService.handle(OrderService.java:42)`
      return mk(
        'java-exception',
        4,
        '提取整行异常的全限定类名（不含冒号和后面的描述）。',
        text,
        [ex],
        '^[\\w.]+(?=Exception|Error)[\\w.]*',
        [
          '异常类型由包名 + 类名组成，都是字母、数字、点和下划线。',
          '这一行开头就是异常类名，可以用 ^ 卡住行首。',
          '更稳的写法：先匹配 [\\w.]+，再用 (?=Exception|Error) 断言后面确实跟着 Exception/Error。'
        ],
        `^ 卡住行首，[\\w.]+ 吃掉包名和类名主体，(?=Exception|Error) 确保我们停下的位置后面正好是 Exception 或 Error，最后 [\\w.]* 把 Exception 后缀一起吃完 —— 这样既准确又不会把冒号后的描述带进来。`,
        ['^', '(?=)', '\\w']
      )
    }
  }
]

/** 按难度筛生成器 */
export function generatorsByLevel(level: Level | 0): Generator[] {
  return level === 0 ? generators : generators.filter((g) => g.level === level)
}

/** 抽一批不重复的随机题 */
export function randomBatch(count = 10, seed = Date.now()): Exercise[] {
  const rng = mulberry32(seed)
  const pool = [...generators]
  const out: Exercise[] = []
  let round = 0
  while (out.length < count && round < 10) {
    if (!pool.length) pool.push(...generators)
    const idx = Math.floor(rng() * pool.length)
    const gen = pool.splice(idx, 1)[0]
    const ex = gen.build(rng)
    // id 里带上轮次，避免同一题被当成同一道（错题本会合并）
    out.push({ ...ex, id: `${ex.id}#${seed}-${out.length}` })
    round++
  }
  return out
}
