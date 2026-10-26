<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { cases } from '@/data/cases'
import { run } from '@/core/regex'
import { explainPattern } from '@/core/explain'
import HighlightedText from '@/components/HighlightedText.vue'

const router = useRouter()
const tag = ref('全部')

const tags = computed(() => ['全部', ...new Set(cases.flatMap((c) => c.tags))])
const list = computed(() => (tag.value === '全部' ? cases : cases.filter((c) => c.tags.includes(tag.value))))

function resultOf(pattern: string, text: string, flags = 'g') {
  return run(pattern, flags, text)
}

async function copy(v: string) {
  try {
    await navigator.clipboard.writeText(v)
    ElMessage.success('已复制')
  } catch {
    ElMessage.warning('复制失败，请手动选择')
  }
}

function toLab(text: string, pattern: string) {
  router.push({ path: '/lab', query: { text, pattern, flags: 'g' } })
}
</script>

<template>
  <div class="cases">
    <div class="head">
      <div>
        <h1>实战案例</h1>
        <p class="tiny muted">
          全部来自后端日常：报工数量、公差、订单号、日志、URL、IP、异常、SQL、JSON、脱敏。每个案例都能直接抄进 Java。
        </p>
      </div>
    </div>

    <div class="tags">
      <button v-for="t in tags" :key="t" class="t" :class="{ on: tag === t }" @click="tag = t">{{ t }}</button>
    </div>

    <div class="grid">
      <article v-for="c in list" :key="c.id" class="card panel">
        <div class="c-head">
          <h2>{{ c.title }}</h2>
          <span class="spacer" />
          <span v-for="t in c.tags.slice(0, 3)" :key="t" class="tag tag-gray">{{ t }}</span>
        </div>
        <p class="scene tiny">{{ c.scene }}</p>

        <div class="blabel tiny">文本</div>
        <HighlightedText :text="c.text" :pattern="c.pattern" :flags="c.flags || 'g'" max-height="120px" />

        <div class="goal">
          <span class="g-label">目标</span>{{ c.goal }}
        </div>

        <div class="pat-row">
          <span class="blabel tiny">推荐正则</span>
          <code class="pat mono">/{{ c.pattern }}/{{ c.flags || 'g' }}</code>
          <button class="mini-btn" @click="copy(c.pattern)">复制</button>
          <button class="mini-btn" @click="toLab(c.text, c.pattern)">实验室 ↗</button>
        </div>

        <div class="groups" v-if="c.groups">
          <span class="blabel tiny">结果</span>
          <template v-for="(m, i) in resultOf(c.pattern, c.text, c.flags).matches" :key="i">
            <span v-for="(g, gi) in m.groups" :key="gi" class="gv">
              <span class="gk">G{{ gi + 1 }}</span>{{ g === undefined ? '—' : g }}
            </span>
          </template>
          <span v-if="!resultOf(c.pattern, c.text, c.flags).matches.length" class="tiny muted">无匹配</span>
        </div>

        <ul class="notes">
          <li v-for="(n, i) in c.notes" :key="i">{{ n }}</li>
        </ul>

        <p class="summary">{{ explainPattern(c.pattern).summary }}</p>

        <div v-if="c.snippet" class="snippet">
          <div class="sn-head">
            <span class="tiny">{{ c.snippet.lang }}</span>
            <span class="spacer" />
            <button class="mini-btn" @click="copy(c.snippet.code)">复制代码</button>
          </div>
          <pre class="mono">{{ c.snippet.code }}</pre>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.cases {
  max-width: 1240px;
  margin: 0 auto;
  padding: 20px 20px 60px;
}
.head h1 {
  font-size: 20px;
  margin: 0 0 3px;
}
.tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin: 12px 0;
}
.t {
  border: 1px solid var(--border);
  background: var(--panel);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 11.5px;
  cursor: pointer;
  color: var(--text-2);
}
.t.on {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(370px, 1fr));
  gap: 12px;
  align-items: start;
}
.card {
  padding: 12px 14px;
}
.c-head {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.c-head h2 {
  font-size: 14px;
  margin: 0;
}
.spacer {
  flex: 1;
}
.scene {
  color: var(--text-3);
  margin: 2px 0 8px;
}
.blabel {
  display: block;
  color: var(--text-3);
  font-weight: 700;
  margin-bottom: 4px;
}
.goal {
  margin-top: 8px;
  font-size: 12.5px;
  background: var(--success-soft);
  border: 1px solid #cbe8d3;
  border-radius: 5px;
  padding: 5px 9px;
  color: #1a5e2c;
}
.g-label {
  font-weight: 700;
  font-size: 11px;
  margin-right: 6px;
  color: var(--success);
}
.pat-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.pat-row .blabel {
  margin: 0;
}
.pat {
  font-size: 11.5px;
  background: #eef2f8;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 7px;
  color: #0a3069;
  word-break: break-all;
}
.mini-btn {
  border: 1px solid var(--border);
  background: var(--panel-2);
  border-radius: 4px;
  font-size: 11px;
  padding: 1px 7px;
  cursor: pointer;
  color: var(--text-2);
}
.mini-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.groups {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 9px;
}
.groups .blabel {
  margin: 0;
}
.gv {
  font-size: 11px;
  font-family: var(--mono);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0 5px;
  background: var(--panel-2);
  color: #0a3069;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gk {
  color: var(--text-3);
  margin-right: 4px;
  font-size: 10px;
}
.notes {
  margin: 10px 0 0;
  padding-left: 16px;
  font-size: 12px;
  color: var(--text-2);
  line-height: 1.75;
}
.notes li {
  margin-bottom: 2px;
}
.summary {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--accent);
  background: var(--accent-soft);
  border-radius: 5px;
  padding: 5px 9px;
  line-height: 1.65;
}
.snippet {
  margin-top: 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}
.sn-head {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: var(--panel-2);
  border-bottom: 1px solid var(--border);
}
.snippet pre {
  margin: 0;
  padding: 8px 10px;
  font-size: 11px;
  line-height: 1.65;
  overflow: auto;
  background: #fbfcfd;
  color: #1f2a3d;
}
</style>
