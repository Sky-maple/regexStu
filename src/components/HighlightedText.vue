<script setup lang="ts">
import { computed } from 'vue'
import { run, toSegments } from '@/core/regex'

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

const result = computed(() => run(props.pattern, props.flags, props.text))

// 切片逻辑统一在 core/regex 的 toSegments 里，这里只负责渲染
const parts = computed(() => {
  if (!result.value.matches.length) return [{ text: props.text, matchIndex: null, zero: false }]
  return toSegments(props.text, result.value.matches)
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
      /><span
        v-else-if="p.matchIndex === null"
      >{{ p.text }}</span><span
        v-else
        class="hit"
        :class="[p.matchIndex % 2 === 0 ? 'hit-a' : 'hit-b', { active: activeIndex === p.matchIndex }]"
      >{{ p.text }}</span></template></pre>
    <div v-else class="empty mono">{{ placeholderEmpty }}</div>
    <div v-if="!result.ok && result.error" class="err tiny">⚠ {{ result.error }}</div>
    <div v-else-if="result.truncated" class="err tiny">匹配数量过多，只展示前 500 条。</div>
    <div v-if="result.ok && result.zeroWidth >= 3" class="zero-note tiny">
      {{ result.zeroWidth }} 处空匹配（长度 0）—— 这些位置匹配成功但没有消耗任何字符，
      常见于 <code>^</code> <code>$</code> <code>\b</code> <code>(?=x)</code> 以及 <code>*</code> /
      <code>?</code> 允许的「零次」。
    </div>
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
  height: 0;
  position: relative;
  vertical-align: baseline;
  /* 零宽匹配不占位、不参与行高：标记全部由 ::after 画在基线下方，
     否则 \d* / \d? 会在每个字符间隙插一条竖线，把文本切成碎片 */
}
.zw::after {
  content: '';
  position: absolute;
  left: -1px;
  top: 0.05em;
  width: 2px;
  height: 3px;
  border-radius: 1px;
  background: rgba(47, 111, 235, 0.32);
}
.zw.active::after {
  top: -0.85em;
  height: 1.15em;
  background: var(--accent);
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
.zero-note {
  margin-top: 6px;
  color: var(--text-3);
  line-height: 1.6;
}
</style>
