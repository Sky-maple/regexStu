<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MatchInfo } from '@/core/regex'

const props = withDefaults(
  defineProps<{
    matches: MatchInfo[]
    activeIndex?: number | null
    showGroups?: boolean
    maxHeight?: string
  }>(),
  { activeIndex: null, showGroups: true, maxHeight: '260px' }
)

const emit = defineEmits<{ (e: 'hover', index: number | null): void }>()

/** 已展开的空匹配段（key = 该段第一个匹配的下标） */
const opened = ref<Set<number>>(new Set())
function toggle(key: number) {
  const next = new Set(opened.value)
  next.has(key) ? next.delete(key) : next.add(key)
  opened.value = next
}

type Item =
  | { kind: 'match'; index: number; m: MatchInfo }
  | { kind: 'zero'; key: number; count: number; from: number; to: number }

/**
 * \d* / \d? 这类正则在每个不能匹配的位置都会产生一次空匹配，
 * 一次能刷出几十条。连续 3 条以上就折叠成一行，避免把真正的匹配挤出视野。
 */
const items = computed<Item[]>(() => {
  const out: Item[] = []
  const ms = props.matches
  let i = 0
  while (i < ms.length) {
    if (ms[i].value !== '') {
      out.push({ kind: 'match', index: i, m: ms[i] })
      i++
      continue
    }
    let j = i
    while (j < ms.length && ms[j].value === '') j++
    const count = j - i
    if (count >= 3 && !opened.value.has(i)) {
      out.push({ kind: 'zero', key: i, count, from: ms[i].index, to: ms[j - 1].end })
    } else {
      for (let k = i; k < j; k++) out.push({ kind: 'match', index: k, m: ms[k] })
    }
    i = j
  }
  return out
})

const emptyCount = computed(() => props.matches.filter((m) => m.value === '').length)
const realCount = computed(() => props.matches.length - emptyCount.value)
</script>

<template>
  <div class="match-list">
    <div class="head tiny">
      <span>匹配结果</span>
      <span class="count">
        {{ realCount }} 处<template v-if="emptyCount"> · 空 {{ emptyCount }}</template>
      </span>
    </div>
    <div v-if="!matches.length" class="none tiny">没有匹配到任何内容</div>
    <div v-else class="body" :style="{ maxHeight }">
      <template v-for="(it, ri) in items" :key="ri">
        <div
          v-if="it.kind === 'zero'"
          class="item zero-group"
          :class="{ active: activeIndex !== null && activeIndex >= it.key && activeIndex < it.key + it.count }"
          @click="toggle(it.key)"
        >
          <span class="idx">⋯</span>
          <span class="val zero">{{ it.count }} 处连续空匹配</span>
          <span class="pos tiny">@{{ it.from }}–{{ it.to }}</span>
          <span class="expand tiny">展开</span>
        </div>
        <div
          v-else
          class="item"
          :class="{ active: activeIndex === it.index }"
          @mouseenter="emit('hover', it.index)"
          @mouseleave="emit('hover', null)"
        >
          <div class="row1">
            <span class="idx">#{{ it.index + 1 }}</span>
            <span v-if="it.m.value" class="val mono">{{ it.m.value }}</span>
            <span v-else class="val zero">「空匹配」</span>
            <span class="pos tiny">@{{ it.m.index }}–{{ it.m.end }}</span>
          </div>
          <div v-if="showGroups && it.m.groups.length" class="groups">
            <span v-for="(g, gi) in it.m.groups" :key="gi" class="g">
              <span class="gk">G{{ gi + 1 }}</span>
              <span class="gv mono">{{ g === undefined ? '—' : g === '' ? '「空」' : g }}</span>
            </span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.match-list {
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--panel);
  overflow: hidden;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: var(--panel-2);
  border-bottom: 1px solid var(--border);
  color: var(--text-2);
  font-weight: 600;
}
.count {
  font-family: var(--mono);
  color: var(--accent);
}
.none {
  padding: 12px 10px;
  color: var(--text-3);
}
.body {
  overflow: auto;
}
.item {
  padding: 6px 10px;
  border-bottom: 1px solid #f2f4f7;
  cursor: default;
}
.item:last-child {
  border-bottom: none;
}
.item.active {
  background: var(--accent-soft);
}
.row1 {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.idx {
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--text-3);
  min-width: 24px;
}
.val {
  font-size: 12.5px;
  color: #0a3069;
  word-break: break-all;
  flex: 1;
}
.val.zero {
  color: var(--text-3);
  font-family: var(--sans);
  font-size: 12px;
}
.zero-group {
  display: flex;
  align-items: baseline;
  gap: 8px;
  cursor: pointer;
  background: #fafbfd;
}
.zero-group:hover {
  background: var(--panel-2);
}
.zero-group:hover .expand {
  color: var(--accent);
}
.expand {
  color: var(--text-3);
  flex: 0 0 auto;
}
.pos {
  color: var(--text-3);
  font-family: var(--mono);
}
.groups {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
  padding-left: 32px;
}
.g {
  display: inline-flex;
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  font-size: 11px;
  max-width: 100%;
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
  word-break: break-all;
}
</style>
