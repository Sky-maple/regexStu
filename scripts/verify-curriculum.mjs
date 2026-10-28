/**
 * 课程数据自检脚本
 * 作用：把 TS 数据用 esbuild 打包成 ESM，逐条断言「示例期望」「练习题标准答案」「实战案例期望」
 * 都真实成立 —— 避免课程里写错一个字符，把学习者教歪。
 *
 * 用法：npm run verify
 */
import { build } from 'esbuild'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, '.verify')

async function bundle(entry, name) {
  const outfile = path.join(outDir, `${name}.mjs`)
  await build({
    entryPoints: [path.join(root, entry)],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    alias: { '@': path.join(root, 'src') },
    logLevel: 'silent'
  })
  const mod = await import(pathToFileURL(outfile).href + `?t=${Date.now()}`)
  return mod
}

/**
 * 断言用的匹配一律走产品自身的 run()，不再另写一套 exec 循环 ——
 * 出现过「高亮层和匹配层各写一份切片逻辑、只改了一处」的问题，这里同理。
 */
function runRegex(pattern, flags, text) {
  return run(pattern, flags, text).matches
}

const errors = []
let checked = 0
/** 由 src/core/regex.ts 注入，保证断言与产品完全同一套逻辑 */
let run
let toSegments

function expectEqual(label, actual, expected) {
  checked++
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a !== e) errors.push(`${label}\n    期望: ${e}\n    实际: ${a}`)
}

function flattenGroups(matches) {
  return matches.flatMap((m) => m.groups.map((g) => (g === undefined ? '' : g)))
}

try {
  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })

  const { chapters } = await bundle('src/data/curriculum/index.ts', 'curriculum')
  const { cases } = await bundle('src/data/cases.ts', 'cases')
  const { samples } = await bundle('src/data/samples.ts', 'samples')
  const { explainPattern } = await bundle('src/core/explain.ts', 'explain')
  const { parsePattern } = await bundle('src/core/parser.ts', 'parser')
  ;({ run, toSegments } = await bundle('src/core/regex.ts', 'regex'))
  const { judge } = await bundle('src/core/evaluate.ts', 'evaluate')

  /**
   * 高亮切片自检：把片段拼回去必须一字不差地等于原文。
   * \d*、\d? 这类会产生大量空匹配，一旦游标没推进，
   * 文本就会被重复拼接、在高亮区显示成“乱码”。这条断言专门盯这个。
   */
  const checkHighlight = (label, text, pattern, flags) => {
    const r = run(pattern, flags, text)
    if (!r.ok) return
    const rebuilt = toSegments(text, r.matches).map((s) => s.text).join('')
    expectEqual(label + ' (高亮切片)', rebuilt, text)
  }

  let lessonCount = 0
  let exampleCount = 0
  let exerciseCount = 0
  /** id -> 题目，供后面的判分回归使用 */
  const exerciseById = new Map()

  for (const chapter of chapters) {
    for (const lesson of chapter.lessons) {
      lessonCount++
      for (const [i, ex] of lesson.examples.entries()) {
        exampleCount++
        const label = `[${chapter.no} ${chapter.title} / ${lesson.title}] 例${i + 1} ${ex.pattern}`
        try {
          const ms = runRegex(ex.pattern, ex.flags, ex.text)
          if (ex.expect !== undefined) {
            expectEqual(label, ms.map((m) => m.value), ex.expect)
          }
          if (ex.groups !== undefined) {
            expectEqual(label + ' (groups)', flattenGroups(ms), ex.groups)
          }
          // 解释器必须能处理（不抛错）
          explainPattern(ex.pattern)
          parsePattern(ex.pattern)
          checkHighlight(label, ex.text, ex.pattern, ex.flags)
        } catch (e) {
          errors.push(`${label}\n    抛错: ${e.message}`)
        }
      }

      for (const exercise of lesson.exercises) {
        exerciseCount++
        exerciseById.set(exercise.id, exercise)
        const label = `[${chapter.no} ${chapter.title} / ${lesson.title}] 题 ${exercise.id}`
        const answers = [exercise.answer, ...(exercise.accept || [])]
        for (const ans of answers) {
          try {
            const ms = runRegex(ans, exercise.flags, exercise.text)
            const mode = exercise.mode || 'matches'
            const actual =
              mode === 'count'
                ? [String(ms.length)]
                : mode === 'groups'
                  ? flattenGroups(ms)
                  : ms.map((m) => m.value)
            expectEqual(`${label} (${ans})`, actual, exercise.expect)

            // 标准答案必须被判对 —— 判分层改了逻辑却没回归，是很容易踩的坑
            const jr = judge(exercise, ans)
            expectEqual(`${label} 标准答案应判对 (${ans})`, jr.correct, true)
          } catch (e) {
            errors.push(`${label} (${ans})\n    抛错: ${e.message}`)
          }
        }
        if (!exercise.hints || exercise.hints.length < 3) {
          errors.push(`${label}\n    提示不足 3 条`)
        }
        if (!exercise.explain || exercise.explain.length < 10) {
          errors.push(`${label}\n    缺少详细解析`)
        }
        checkHighlight(label, exercise.text, exercise.answer, exercise.flags)
      }
    }
  }

  for (const c of cases) {
    if (c.expect === undefined) continue
    const label = `[案例] ${c.title} ${c.pattern}`
    const ms = runRegex(c.pattern, c.flags, c.text)
    expectEqual(label, ms.map((m) => m.value), c.expect)
    checkHighlight(label, c.text, c.pattern, c.flags)
  }

  // 零宽匹配回归：这些正则会在每个「不能匹配」的位置产生长度为 0 的匹配，
  // 曾经让高亮区把整段文本重复拼接（用户看到的就是“乱码”）
  const zeroWidthCases = [
    ['\\d*', 'abc123def456'],
    ['\\d?', 'abc123'],
    ['\\d*', '订单号：SO202610260001，金额：199.00\n用户 13800138000 登录'],
    ['^', 'abc\ndef'],
    ['$', 'abc\ndef'],
    ['(?=a)', 'aaa'],
    ['(?!a)', 'abc'],
    ['\\b', 'hello world'],
    ['(?<=>)', '<a>1</a>'],
    ['a*', 'aaa'],
    ['x*', 'abc'],
    ['\\s*', 'a b c'],
    ['', 'abc']
  ]
  for (const [pat, text] of zeroWidthCases) {
    checkHighlight(`[零宽回归] ${pat}`, text, pat, 'gm')
  }

  /**
   * 判分回归：空匹配不能当作「一项结果」混进对比和错因。
   * 曾经 [abc]* 在 "ac abc abbc adc" 上被判成 10 项，错因里出现
   * 「你多匹配到 「」、「」、「」、「a」」—— 全是空串，看起来就是乱码。
   */
  const judgeCases = [
    ['quant-star-1', '[abc]*', false],
    ['quant-star-1', 'ab*c', true],
    ['quant-star-1', '[abc]+', false],
    ['quant-star-1', 'ab+', false],
    ['quant-star-1', 'a.c', false],
    ['quant-star-1', 'abc*', false]
  ]
  for (const [id, pat, want] of judgeCases) {
    const ex = exerciseById.get(id)
    if (!ex) {
      errors.push(`[判分回归] 找不到题目 ${id}`)
      continue
    }
    const jr = judge(ex, pat)
    expectEqual(`[判分回归] ${id} /${pat}/ 应${want ? '判对' : '判错'}`, jr.correct, want)
    if (!jr.correct) {
      if (jr.reason.includes('「」')) {
        errors.push(`[判分回归] ${id} /${pat}/ 错因里出现空的「」引用：${jr.reason}`)
      }
      if (jr.actualEmpty > 0 && !jr.reason.includes('空匹配')) {
        errors.push(`[判分回归] ${id} /${pat}/ 产生了 ${jr.actualEmpty} 处空匹配，错因却没解释：${jr.reason}`)
      }
    }
    if ((ex.mode || 'matches') === 'matches') {
      const contentCount = jr.actual.filter((v) => v !== '').length
      expectEqual(`[判分回归] ${id} /${pat}/ 空匹配单独计数`, contentCount + jr.actualEmpty, jr.actual.length)
    }
  }

  for (const s of samples) {
    if (!s.try) continue
    try {
      new RegExp(s.try, 'g')
    } catch (e) {
      errors.push(`[示例文本] ${s.category} 的推荐正则不合法: ${s.try} (${e.message})`)
    }
  }

  console.log(
    `检查完成：${chapters.length} 章 / ${lessonCount} 节 / ${exampleCount} 个示例 / ${exerciseCount} 道练习 / ${cases.length} 个案例`
  )
  console.log(`断言数：${checked}`)
  if (errors.length) {
    console.error(`\n✗ 发现 ${errors.length} 处问题：\n`)
    for (const e of errors) console.error('  ' + e + '\n')
    process.exitCode = 1
  } else {
    console.log('\n✓ 全部通过：示例与答案在题面文本上都成立')
    await writeFile(path.join(outDir, 'ok'), 'ok')
  }
} catch (e) {
  console.error('自检脚本执行失败：', e)
  process.exitCode = 2
}
