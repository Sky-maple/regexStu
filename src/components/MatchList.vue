<script setup lang="ts">
import type { MatchInfo } from '@/core/regex'

withDefaults(
  defineProps<{
    matches: MatchInfo[]
    activeIndex?: number | null
    showGroups?: boolean
    maxHeight?: string
  }>(),
  { activeIndex: null, showGroups: true, maxHeight: '260px' }
)

const emit = defineEmits<{ (e: 'hover', index: number | null): void }>()
</script>

<template>
  <div class="match-list">
    <div class="head tiny">
      <span>匹配结果</span>
      <span class="count">{{ matches.length }} 处</span>
    </div>
    <div v-if="!matches.length" class="none tiny">没有匹配到任何内容</div>
    <div v-else class="body" :style="{ maxHeight }">
      <div
        v-for="(m, i) in matches"
        :key="i"
        class="item"
        :class="{ active: activeIndex === i }"
        @mouseenter="emit('hover', i)"
        @mouseleave="emit('hover', null)"
      >
        <div class="row1">
          <span class="idx">#{{ i + 1 }}</span>
          <span v-if="m.value" class="val mono">{{ m.value }}</span>
          <span v-else class="val zero">「空匹配」</span>
          <span class="pos tiny">@{{ m.index }}–{{ m.end }}</span>
        </div>
        <div v-if="showGroups && m.groups.length" class="groups">
          <span v-for="(g, gi) in m.groups" :key="gi" class="g">
            <span class="gk">G{{ gi + 1 }}</span>
            <span class="gv mono">{{ g === undefined ? '—' : g === '' ? '「空」' : g }}</span>
          </span>
        </div>
      </div>
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
