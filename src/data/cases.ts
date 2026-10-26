import type { CaseStudy } from '@/types'

/** 实战案例：全部来自后端日常（订单、日志、URL、IP、异常、SQL、JSON、文件名） */
export const cases: CaseStudy[] = [
  {
    id: 'case-count',
    title: '从规格描述里取数量（1）',
    scene: 'MOM 报工 / 包装规格，数量被写在括号里',
    text: '5行*5列（25枚）',
    pattern: '(\\d+)枚',
    goal: '拿到 25',
    notes: [
      '括号里的中文是干扰项，直接锚定"枚"这个后缀更稳。',
      '用捕获组把数字单独框出来，group(1) 就是纯数字。',
      '如果数字可能带小数，把 \\d+ 换成 \\d+(?:\\.\\d+)?。'
    ],
    tags: ['数字', '捕获组', '中文'],
    groups: true,
    expect: ['25枚'],
    snippet: {
      lang: 'java',
      code: `String text = "5行*5列（25枚）";
Matcher m = Pattern.compile("(\\\\d+)枚").matcher(text);
if (m.find()) {
    System.out.println(Integer.parseInt(m.group(1))); // 25
}`
    }
  },
  {
    id: 'case-count2',
    title: '从规格描述里取数量（2）',
    scene: '同上，换一批数据验证你的正则不是"记住了答案"',
    text: '7行*5列（35枚）',
    pattern: '(\\d+)枚',
    goal: '拿到 35',
    notes: [
      '和上一个案例用同一条正则 —— 这说明它描述的是"形状"，而不是具体文本。',
      '注意前面的 "5列" 也有数字，如果不用"枚"锚定，就可能取错。'
    ],
    tags: ['数字', '捕获组'],
    groups: true,
    expect: ['35枚']
  },
  {
    id: 'case-tolerance',
    title: '取公差前的尺寸（1）',
    scene: '质检 / 图纸尺寸解析：174.30±0.02',
    text: '174.30±0.02',
    pattern: '[\\d.]+(?=±)',
    goal: '拿到 174.30（不含公差）',
    notes: [
      '± 是分隔符，用前瞻保证它不进入结果。',
      '[\\d.]+ 同时接受整数和小数，比 \\d+\\.\\d+ 更宽容。',
      '严格一点可以写 \\d+(?:\\.\\d+)?(?=±)，能避免 "1.2.3" 这种脏数据。'
    ],
    tags: ['前瞻', '数字', '工业'],
    expect: ['174.30'],
    snippet: {
      lang: 'java',
      code: `Matcher m = Pattern.compile("[\\\\d.]+(?=±)").matcher("174.30±0.02");
if (m.find()) System.out.println(m.group()); // 174.30`
    }
  },
  {
    id: 'case-tolerance2',
    title: '取公差前的尺寸（2）',
    scene: '同一条正则处理另一组尺寸',
    text: '102.10±0.02',
    pattern: '[\\d.]+(?=±)',
    goal: '拿到 102.10',
    notes: ['注意 102.10 的末尾 0 不会被丢掉 —— 正则只负责截取，不做数字格式化。'],
    tags: ['前瞻', '数字'],
    expect: ['102.10']
  },
  {
    id: 'case-order',
    title: '提取订单号',
    scene: '客服工单 / 对账：从一段话里捞出业务单号',
    text: '订单号：SO202610260001，请尽快处理',
    pattern: 'SO\\d+',
    goal: '拿到 SO202610260001',
    notes: [
      '前缀 SO 是"锚"，比只用 \\d+ 精准得多。',
      '如果单号规则固定是 SO + 14 位数字，用 SO\\d{14} 更严格。',
      '要校验"整条就是单号"，记得加 ^ ... $。'
    ],
    tags: ['订单号', '日志'],
    expect: ['SO202610260001'],
    snippet: {
      lang: 'java',
      code: `Pattern p = Pattern.compile("SO\\\\d+");
Matcher m = p.matcher(text);
while (m.find()) {
    System.out.println(m.group()); // 支持一段文本里多个单号
}`
    }
  },
  {
    id: 'case-log',
    title: '解析一行应用日志',
    scene: '日志采集 / 告警分析：把一行文本拆成结构化字段',
    text: '2026-10-26 15:30:25 [INFO] userId=10086 action=LOGIN',
    pattern: '(\\d{4}-\\d{2}-\\d{2}) (\\d{2}:\\d{2}:\\d{2}) \\[(\\w+)\\] userId=(\\d+) action=(\\w+)',
    goal: '时间 / 级别 / userId / action 四个字段',
    notes: [
      '整条正则的结构是：定位文字 + 捕获组，交替出现。',
      '\\[ 和 \\] 要转义，否则会被当成字符集合。',
      'group(1) 日期、group(2) 时间、group(3) 级别、group(4) userId、group(5) action。',
      '生产环境建议用非捕获组 (?:...) 包住不需要的定位片段，避免编号错位。'
    ],
    tags: ['日志', '捕获组', '时间'],
    groups: true,
    expect: ['2026-10-26 15:30:25 [INFO] userId=10086 action=LOGIN'],
    snippet: {
      lang: 'java',
      code: `String line = "2026-10-26 15:30:25 [INFO] userId=10086 action=LOGIN";
String regex = "(\\\\d{4}-\\\\d{2}-\\\\d{2}) (\\\\d{2}:\\\\d{2}:\\\\d{2}) \\\\[(\\\\w+)\\\\] userId=(\\\\d+) action=(\\\\w+)";
Matcher m = Pattern.compile(regex).matcher(line);
if (m.matches()) {
    String date = m.group(1), time = m.group(2), level = m.group(3);
    String userId = m.group(4), action = m.group(5);
}`
    }
  },
  {
    id: 'case-url',
    title: '拆解 URL',
    scene: '网关日志 / 埋点解析：协议、域名、路径、参数',
    text: 'https://example.com/user?id=10086',
    pattern: '(\\w+)://([^/]+)(/[^?]*)\\?(.+)',
    goal: '协议 https / 域名 example.com / 路径 /user / 参数 id=10086',
    notes: [
      '([^/]+) 一直取到第一个斜杠，正好是域名。',
      '路径用 (/[^?]*) 取到问号之前，避免把参数带进去。',
      '\\? 匹配真正的问号，问号在正则里是量词。',
      '生产环境更推荐直接用 URI 类解析，正则适合做日志预处理。'
    ],
    tags: ['URL', '捕获组', '转义'],
    groups: true,
    expect: ['https://example.com/user?id=10086']
  },
  {
    id: 'case-ip',
    title: '拆 IP 与端口',
    scene: '服务器地址配置 / 连接失败排查',
    text: '服务器地址：192.168.1.100:8080，连接超时 3000ms',
    pattern: '(\\d{1,3}(?:\\.\\d{1,3}){3}):(\\d+)',
    goal: 'IP 192.168.1.100 / 端口 8080',
    notes: [
      '{1,3} 允许 0~255 这种 1~3 位写法，但它不校验"每段 ≤ 255"。',
      '(?:\\.\\d{1,3}){3} 用非捕获组把"点 + 数字"重复 3 次，正好四段。',
      '最后的 3000ms 因为前面没有冒号，不会被误匹配。'
    ],
    tags: ['IP', '端口', '非捕获组'],
    groups: true,
    expect: ['192.168.1.100:8080']
  },
  {
    id: 'case-exception',
    title: '提取 Java 异常类型',
    scene: '异常日志聚合 / 按异常类型做告警统计',
    text: 'java.lang.NullPointerException: Cannot invoke "xxx"',
    pattern: '^[\\w.]+Exception',
    goal: 'java.lang.NullPointerException',
    notes: [
      '^ 保证从行首开始，避免把堆栈里其它类名也抓进来。',
      '[\\w.]+ 匹配包名 + 类名（字母、数字、下划线、点）。',
      '如果有的异常以 Error 结尾，写成 ^[\\w.]+(?:Exception|Error)。'
    ],
    tags: ['Java', '异常', '日志'],
    expect: ['java.lang.NullPointerException'],
    snippet: {
      lang: 'java',
      code: `Matcher m = Pattern.compile("^[\\\\w.]+(?:Exception|Error)").matcher(line);
if (m.find()) {
    String type = m.group();          // java.lang.NullPointerException
    String simple = type.substring(type.lastIndexOf('.') + 1);
}`
    }
  },
  {
    id: 'case-mask',
    title: '手机号脱敏',
    scene: '日志脱敏 / 前台展示：保留前 3 后 4',
    text: '联系号码 13800138000 已登记',
    pattern: '(\\d{3})\\d{4}(\\d{4})',
    goal: '捕获前 3 位和后 4 位，中间 4 位用 $1****$2 替换',
    notes: [
      '两个捕获组分别框住"要保留"的部分，中间的 \\d{4} 故意不捕获。',
      '替换时用 $1 与 $2 引用，replaceAll 会自动处理所有匹配。',
      '这一招同样适用于身份证、银行卡脱敏。'
    ],
    tags: ['脱敏', '捕获组', 'replaceAll'],
    groups: true,
    expect: ['13800138000'],
    snippet: {
      lang: 'java',
      code: `String masked = "13800138000".replaceAll("(\\\\d{3})\\\\d{4}(\\\\d{4})", "$1****$2");
System.out.println(masked); // 138****8000`
    }
  },
  {
    id: 'case-sql',
    title: '取出 SQL 里的表名',
    scene: 'SQL 审计 / 表血缘分析',
    text: 'select id, name from t_order where status = 1',
    pattern: 'from\\s+(\\w+)',
    goal: 't_order',
    notes: [
      'SQL 关键字大小写不统一，实际使用时加 i 修饰符。',
      '\\s+ 吃掉中间的空格/换行，比写死一个空格更稳。',
      '复杂 SQL（子查询、JOIN）不适合用单条正则完全解析，建议只做粗筛。'
    ],
    tags: ['SQL', '表名'],
    groups: true,
    expect: ['from t_order']
  },
  {
    id: 'case-json',
    title: '取 JSON 字段值',
    scene: '报文排查：从一段 JSON 里快速定位订单号',
    text: '{"orderId":"SO202610260001","amount":199.00}',
    pattern: '"orderId"\\s*:\\s*"([^"]+)"',
    goal: 'SO202610260001',
    notes: [
      '键名用字面量定位，冒号两侧可能有空格，用 \\s* 兜住。',
      '([^"]+) 表示"不是引号的一串字符"，比 .+? 更稳。',
      '解析 JSON 请用 Jackson；正则只适合日志里"夹着"的 JSON 片段。'
    ],
    tags: ['JSON', '捕获组'],
    groups: true,
    expect: ['"orderId":"SO202610260001"']
  },
  {
    id: 'case-filename',
    title: '拆文件名与扩展名',
    scene: '日志文件归档 / 上传校验',
    text: '/var/log/app-2026-10-26.log',
    pattern: '([^/\\\\]+)\\.(\\w+)$',
    goal: 'app-2026-10-26 / log',
    notes: [
      '([^/\\\\]+) 排除路径分隔符，只留最后一段文件名。',
      '\\. 匹配真正的点，否则会把 "app-2026-10-26" 里的连字符也当成通配。',
      '$ 保证取的是最后一段扩展名。'
    ],
    tags: ['文件名', '路径'],
    groups: true,
    expect: ['app-2026-10-26.log']
  }
]
