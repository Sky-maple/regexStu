/** 课程数据模型 —— 静态常量，构建时由 scripts/verify-curriculum.mjs 断言 */

export type Level = 1 | 2 | 3 | 4 | 5

export interface RegexExample {
  /** 小标题，例如「只匹配数字」 */
  title?: string
  /** 待匹配的原始文本 */
  text: string
  /** 正则 */
  pattern: string
  /** 修饰符，默认 'g' */
  flags?: string
  /** 这个例子想让学习者看到什么 */
  goal?: string
  /** 期望的完整匹配（构建期断言，同时用于展示） */
  expect?: string[]
  /** 第一个匹配的捕获组（不含 group0） */
  groups?: (string | null)[]
}

/** 判定模式：完整匹配列表 / 首个匹配的分组 / 匹配数量 */
export type JudgeMode = 'matches' | 'groups' | 'count'

export interface Exercise {
  id: string
  level: Level
  prompt: string
  text: string
  flags?: string
  mode?: JudgeMode
  /** matches: 期望的完整匹配数组；groups: 首个匹配的 group1..n；count: 长度 */
  expect: string[]
  answer: string
  /** 其它同样正确的写法（答案比对仍以结果为准，这里只用于展示） */
  accept?: string[]
  /** 三条递进提示 */
  hints: string[]
  /** 详细解析 */
  explain: string
  knowledge: string[]
}

export interface Pitfall {
  wrong: string
  why: string
}

export interface Lesson {
  id: string
  title: string
  /** 一句话本质 */
  essence: string
  /** 要点 */
  points: string[]
  examples: RegexExample[]
  pitfalls?: Pitfall[]
  exercises: Exercise[]
  /** 可选代码块（Java 专题用） */
  code?: { lang: string; title: string; code: string }[]
}

export interface Chapter {
  id: string
  /** 章序号，例如 '01' */
  no: string
  title: string
  subtitle: string
  /** 阶段名 */
  stage: string
  lessons: Lesson[]
}

/** 实战案例 */
export interface CaseStudy {
  id: string
  title: string
  scene: string
  text: string
  pattern: string
  flags?: string
  /** 目标：要拿到什么 */
  goal: string
  /** 结果说明 */
  notes: string[]
  /** 可抄走的 Java / SQL 片段 */
  snippet?: { lang: string; code: string }
  tags: string[]
  mode?: JudgeMode
  groups?: boolean
  /** 构建期断言用：pattern 在 text 上的完整匹配 */
  expect?: string[]
}

/** 示例文本库 */
export interface SampleText {
  id: string
  category: string
  label: string
  text: string
  /** 推荐试试的正则 */
  try?: string
}

/** 知识点词条（全局搜索） */
export interface GlossaryEntry {
  key: string
  title: string
  kind: 'meta' | 'class' | 'quantifier' | 'group' | 'anchor' | 'flag' | 'concept'
  summary: string
  detail: string
  related?: string[]
  /** 英文关键词，供搜索命中 */
  en?: string
  lessonId?: string
}

/** 错题本条目 */
export interface Mistake {
  id: string
  exerciseId: string
  lessonId: string
  lessonTitle: string
  prompt: string
  text: string
  level: number
  myPattern: string
  answer: string
  reason: string
  knowledge: string[]
  count: number
  fixed: boolean
  at: number
  /** 题目快照：随机题不来自课程，靠这个都能重练 */
  exercise?: Exercise
}

/** 随机练习生成器 */
export interface Generator {
  id: string
  name: string
  level: Level
  knowledge: string[]
  build: (rng: () => number) => Exercise
}
