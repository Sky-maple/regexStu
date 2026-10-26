import type { SampleText } from '@/types'

/** 内置示例文本库：20 类，实验室里点一下就能填进文本框 */
export const samples: SampleText[] = [
  {
    id: 's-number',
    category: '数字',
    label: '订单与金额',
    text: '订单 25 件，单价 199.00 元，库存 0',
    try: '\\d+'
  },
  {
    id: 's-phone',
    category: '手机号',
    label: '两个号码',
    text: '联系方式：13800138000 / 13912345678，备用 12345',
    try: '1[3-9]\\d{9}'
  },
  {
    id: 's-email',
    category: '邮箱',
    label: '多个邮箱',
    text: 'admin@example.com, ops.team+alert@corp.cn',
    try: '[\\w.+-]+@[\\w-]+\\.[\\w.]+'
  },
  {
    id: 's-ip',
    category: 'IP',
    label: '带端口的地址',
    text: 'database 10.0.12.5:5432, cache 127.0.0.1:6379',
    try: '\\d{1,3}(?:\\.\\d{1,3}){3}:\\d+'
  },
  {
    id: 's-url',
    category: 'URL',
    label: '接口地址',
    text: 'GET https://api.example.com/v1/orders?page=1&size=20 200 OK',
    try: 'https?://[^\\s]+'
  },
  {
    id: 's-date',
    category: '日期',
    label: '两种格式',
    text: '开始 2026-10-26，结束 2026/10/26',
    try: '\\d{4}-\\d{2}-\\d{2}'
  },
  {
    id: 's-time',
    category: '时间',
    label: '起止时间',
    text: '15:30:25 开始，16:05:00 结束',
    try: '\\d{2}:\\d{2}:\\d{2}'
  },
  {
    id: 's-order',
    category: '订单号',
    label: '销售单与采购单',
    text: '订单号：SO202610260001，采购单：PO202610260002',
    try: 'SO\\d+'
  },
  {
    id: 's-idcard',
    category: '身份证格式',
    label: '18 位身份证',
    text: '证件号 110101199003071234，校验位可能是 X',
    try: '\\d{17}[\\dXx]'
  },
  {
    id: 's-filename',
    category: '文件名',
    label: '配置路径',
    text: '/opt/app/config/application-prod.yml',
    try: '[^/]+\\.\\w+$'
  },
  {
    id: 's-log',
    category: '日志',
    label: '两行应用日志',
    text: '2026-10-26 15:30:25 [INFO] userId=10086 action=LOGIN\n2026-10-26 15:31:02 [ERROR] userId=10087 action=PAY code=500',
    try: '^\\d{4}-\\d{2}-\\d{2}'
  },
  {
    id: 's-javalog',
    category: 'Java 日志',
    label: '异常堆栈',
    text: 'java.lang.NullPointerException: Cannot invoke "xxx"\n\tat com.demo.OrderService.handle(OrderService.java:42)\n\tat com.demo.Api.main(Api.java:10)',
    try: '^[\\w.]+Exception'
  },
  {
    id: 's-sql',
    category: 'SQL',
    label: '带条件的查询',
    text: 'select o.id, u.name from t_order o join t_user u on o.user_id = u.id where o.status = 1',
    try: 'join\\s+(\\w+)'
  },
  {
    id: 's-json',
    category: 'JSON',
    label: '订单报文',
    text: '{"orderId":"SO202610260001","amount":199.00,"items":[{"sku":"A1","qty":2}]}',
    try: '"orderId"\\s*:\\s*"([^"]+)"'
  },
  {
    id: 's-xml',
    category: 'XML',
    label: '简单配置',
    text: '<config><item key="timeout" value="3000"/><item key="retry" value="3"/></config>',
    try: 'key="([^"]+)"'
  },
  {
    id: 's-html',
    category: 'HTML',
    label: '两个链接',
    text: '<a href="/user/1">张三</a><a href="/user/2">李四</a>',
    try: '<a href="([^"]+)">([^<]+)</a>'
  },
  {
    id: 's-markdown',
    category: 'Markdown',
    label: '标题与代码',
    text: '# 正则实验室\n\n用 `\\d+` 匹配数字。\n\n- 学习\n- 练习',
    try: '^#{1,6}\\s+.+$'
  },
  {
    id: 's-chinese',
    category: '中文文本',
    label: '一段说明',
    text: '正则表达式是一门描述文本形状的小语言，适合处理格式不固定的文本。',
    try: '[\\u4e00-\\u9fa5]+'
  },
  {
    id: 's-english',
    category: '英文文本',
    label: '一段说明',
    text: 'A regular expression describes the shape of text, not its exact content.',
    try: '[A-Za-z]+'
  },
  {
    id: 's-mixed',
    category: '混合文本',
    label: '典型生产日志',
    text: '2026-10-26 15:30:25 [WARN] order=SO202610260001 userId=10086 cost=128.50ms msg="slow query"',
    try: '(\\w+)=([^\\s]+)'
  }
]
