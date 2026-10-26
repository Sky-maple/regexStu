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

function runRegex(pattern, flags, text) {
  const f = [...new Set(((flags || 'g') + 'g').split(''))].join('')
  const re = new RegExp(pattern, f)
  const out = []
  let m
  let guard = 0
  while ((m = re.exec(text)) !== null) {
    out.push({ value: m[0], groups: m.slice(1) })
    if (m[0] === '') re.lastIndex++
    if (++guard > 2000) break
  }
  return out
}

const errors = []
let checked = 0

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

  let lessonCount = 0
  let exampleCount = 0
  let exerciseCount = 0

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
        } catch (e) {
          errors.push(`${label}\n    抛错: ${e.message}`)
        }
      }

      for (const exercise of lesson.exercises) {
        exerciseCount++
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
      }
    }
  }

  for (const c of cases) {
    if (c.expect === undefined) continue
    const label = `[案例] ${c.title} ${c.pattern}`
    const ms = runRegex(c.pattern, c.flags, c.text)
    expectEqual(label, ms.map((m) => m.value), c.expect)
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
