<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { RegexExample } from '@/types'
import HighlightedText from './HighlightedText.vue'
import TokenTable from './TokenTable.vue'
import { run } from '@/core/regex'

const props = withDefaults(defineProps<{ example: RegexExample; index?: number }>(), { index: 0 })
const router = useRouter()
const open = ref(props.index === 0)

const result = computed(() => run(props.example.pattern, props.example.flags || 'g', props.example.text))
const groups = computed(() => props.example.groups ?? [])

function toLab() {
  router.push({
    path: '/lab',
    query: {
      text: props.example.text,
      pattern: props.example.pattern,
      flags: props.example.flags || 'g'
    }
  })
}
</script>

<template>
  <div class="example panel">
    <div class="head">
      <div class="title">
        <span class="no">例 {{ index + 1 }}</span>
        <span>{{ example.title || '示例' }}</span>
      </div>
      <div class="right">
        <code class="pat mono">/{{ example.pattern }}/{{ example.flags || 'g' }}</code>
        <el-button size="small" text @click="toLab">在实验室打开 ↗</el-button>
      </div>
    </div>

    <div class="body">
      <div class="block">
        <div class="blabel">文本</div>
        <HighlightedText :text="example.text" :pattern="example.pattern" :flags="example.flags || 'g'" />
      </div>

      <div v-if="example.goal" class="goal">
        <span class="glabel">看到什么</span>
        {{ example.goal }}
      </div>

      <div v-if="groups.length" class="groups">
        <span class="glabel">捕获组</span>
        <span v-for="(g, i) in groups" :key="i" class="g">
          <span class="gk">G{{ i + 1 }}</span>
          <span class="gv mono">{{ g === null ? '—' : g }}</span>
        </span>
      </div>

      <div class="matches-line tiny">
        <span class="muted">匹配到 {{ result.matches.length }} 处：</span>
        <span v-for="(m, i) in result.matches.slice(0, 8)" :key="i" class="chip mono">{{ m.value || '∅' }}</span>
        <span v-if="result.matches.length > 8" class="muted">…</span>
      </div>

      <button class="toggle" @click="open = !open">
        {{ open ? '▾ 收起拆解' : '▸ 逐字符拆解这个正则' }}
      </button>
      <div v-if="open" class="explain">
        <TokenTable :pattern="example.pattern" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.example {
  overflow: hidden;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  background: var(--panel-2);
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}
.title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
}
.no {
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid #cddffd;
  border-radius: 4px;
  padding: 0 5px;
}
.right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.pat {
  font-size: 12px;
  color: #0a3069;
  background: #eef2f8;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 7px;
  word-break: break-all;
}
.body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.blabel {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: var(--text-3);
  margin-bottom: 4px;
}
.goal {
  font-size: 12.5px;
  color: #3d4a5c;
  background: #f7f9fc;
  border-left: 3px solid var(--accent);
  border-radius: 0 6px 6px 0;
  padding: 7px 10px;
  line-height: 1.7;
}
.glabel {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-3);
  margin-right: 8px;
}
.groups {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.g {
  display: inline-flex;
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  font-size: 11px;
}
.gk {
  background: #f0f3f7;
  color: var(--text-3);
  padding: 0 4px;
  font-family: var(--mono);
}
.gv {
  padding: 0 5px;
  color: #0a3069;
}
.matches-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}
.chip {
  background: var(--match-a);
  border: 1px solid var(--match-a-edge);
  border-radius: 3px;
  padding: 0 5px;
  font-size: 11.5px;
  color: #6b4b00;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.toggle {
  align-self: flex-start;
  border: none;
  background: transparent;
  color: var(--text-2);
  font-size: 12px;
  cursor: pointer;
  padding: 0;
}
.toggle:hover {
  color: var(--accent);
}
.explain {
  border-top: 1px dashed var(--border);
  padding-top: 8px;
}
</style>
