<script setup lang="ts">
import { computed } from 'vue'
import { run } from '@/core/regex'

const props = withDefaults(
  defineProps<{
    text: string
    pattern: string
    flags?: string
    /** 高亮某一个匹配（来自匹配列表的 hover） */
    activeIndex?: number | null
    /** 是否显示行号 */
    lineNumbers?: boolean
    maxHeight?: string
    placeholderEmpty?: string
  }>(),
  { flags: 'g', activeIndex: null, lineNumbers: false, maxHeight: 'none', placeholderEmpty: '（文本为空）' }
)

interface Part {
  text: string
  matchIndex: number | null
  zero?: boolean
}

const result = computed(() => run(props.pattern, props.flags, props.text))

const parts = computed<Part[]>(() => {
  const { matches } = result.value
  if (!matches.length) return [{ text: props.text, matchIndex: null }]
  const out: Part[] = []
  let cursor = 0
  matches.forEach((m, i) => {
    if (m.index > cursor) out.push({ text: props.text.slice(cursor, m.index), matchIndex: null })
    if (m.value.length === 0) {
      out.push({ text: '', matchIndex: i, zero: true })
    } else {
      out.push({ text: props.text.slice(m.index, m.end), matchIndex: i })
      cursor = m.end
    }
  })
  if (cursor < props.text.length) out.push({ text: props.text.slice(cursor), matchIndex: null })
  return out
})

const styleObj = computed(() => ({ maxHeight: props.maxHeight, overflow: props.maxHeight === 'none' ? 'visible' : 'auto' }))
</script>

<template>
  <div class="hl-wrap" :style="styleObj">
    <pre v-if="text" class="hl"><template v-for="(p, i) in parts" :key="i"><span
        v-if="p.zero"
        class="zw"
        :class="{ active: activeIndex === p.matchIndex }"
        :title="`空匹配 #${(p.matchIndex ?? 0) + 1}（零宽）`"
      >|</span><span
        v-else-if="p.matchIndex === null"
      >{{ p.text }}</span><span
        v-else
        class="hit"
        :class="[p.matchIndex % 2 === 0 ? 'hit-a' : 'hit-b', { active: activeIndex === p.matchIndex }]"
      >{{ p.text }}</span></template></pre>
    <div v-else class="empty mono">{{ placeholderEmpty }}</div>
    <div v-if="!result.ok && result.error" class="err tiny">⚠ {{ result.error }}</div>
    <div v-else-if="result.truncated" class="err tiny">匹配数量过多，只展示前 500 条。</div>
  </div>
</template>

<style scoped>
.hl-wrap {
  position: relative;
}
.hl {
  margin: 0;
  font-family: var(--mono);
  font-size: 13px;
  line-height: 1.85;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text);
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 12px;
  transition: background 0.15s ease;
}
.hit {
  border-radius: 3px;
  padding: 1px 0;
  box-shadow: inset 0 -1.5px 0 currentColor;
}
.hit-a {
  background: var(--match-a);
  color: #6b4b00;
}
.hit-b {
  background: var(--match-b);
  color: #0b3d63;
}
.hit.active {
  outline: 2px solid var(--accent);
  outline-offset: -1px;
}
.zw {
  display: inline-block;
  width: 0;
  border-left: 1px dashed rgba(47, 111, 235, 0.45);
  height: 1.1em;
  vertical-align: text-bottom;
  margin: 0 -1px;
}
.zw.active {
  border-left: 2px solid var(--accent);
}
.empty {
  color: var(--text-3);
  font-size: 12px;
  padding: 10px 12px;
  background: var(--code-bg);
  border: 1px dashed var(--border);
  border-radius: 6px;
}
.err {
  margin-top: 6px;
  color: var(--danger);
}
</style>
