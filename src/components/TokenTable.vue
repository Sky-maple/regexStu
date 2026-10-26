<script setup lang="ts">
import { computed } from 'vue'
import { explainPattern } from '@/core/explain'

const props = withDefaults(
  defineProps<{
    pattern: string
    /** 紧凑模式：隐藏组合解释 */
    compact?: boolean
  }>(),
  { compact: false }
)

const explained = computed(() => explainPattern(props.pattern))
</script>

<template>
  <div class="token-table">
    <div v-if="!compact" class="summary">
      <span class="label">组合解释</span>
      <p>{{ explained.summary }}</p>
    </div>

    <div v-if="explained.issues.length" class="issues">
      <div v-for="(it, i) in explained.issues" :key="i" class="issue">⚠ {{ it }}</div>
    </div>

    <div v-if="explained.rows.length" class="rows">
      <div v-for="(row, i) in explained.rows" :key="i" class="row" :class="`k-${row.kind}`">
        <span class="raw" :style="{ marginLeft: row.depth * 10 + 'px' }">{{ row.raw }}</span>
        <div class="txt">
          <span class="name">{{ row.name }}</span>
          <span class="detail">{{ row.detail }}</span>
        </div>
      </div>
    </div>

    <div v-if="explained.captureCount > 0" class="cap tiny muted">
      这段正则共有 {{ explained.captureCount }} 个捕获组，可用 group(1) ~ group({{ explained.captureCount }}) 取值。
    </div>
  </div>
</template>

<style scoped>
.token-table {
  font-size: 12.5px;
  width: 100%;
}
.summary {
  background: var(--accent-soft);
  border: 1px solid #d5e2fb;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 8px;
}
.summary .label {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.4px;
}
.summary p {
  margin: 3px 0 0;
  color: #14396f;
  line-height: 1.7;
}
.issues {
  margin-bottom: 8px;
}
.issue {
  color: var(--danger);
  background: var(--danger-soft);
  border: 1px solid #f7c9cb;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 12px;
  margin-bottom: 4px;
}
.rows {
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}
.row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 5px 8px;
  border-bottom: 1px solid #f1f3f6;
}
.row:last-child {
  border-bottom: none;
}
.row:nth-child(even) {
  background: #fcfdfe;
}
.raw {
  flex: 0 0 auto;
  min-width: 40px;
  max-width: 110px;
  font-family: var(--mono);
  font-size: 11.5px;
  background: #f0f3f7;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0 5px;
  color: #0a3069;
  white-space: pre-wrap;
  word-break: break-all;
  text-align: center;
  line-height: 18px;
  margin-top: 1px;
}
.txt {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}
.name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
}
.detail {
  font-size: 12px;
  color: var(--text-3);
  line-height: 1.65;
}
.k-quantifier .raw {
  background: #fff4d6;
  border-color: #eedca6;
  color: #7a5300;
}
.k-quantifier .name {
  color: #7a5300;
}
.k-anchor .raw {
  background: #eaf7ee;
  border-color: #bfe3c9;
  color: #1a7f37;
}
.k-anchor .name {
  color: #1a7f37;
}
.k-group .raw {
  background: #f5f0ff;
  border-color: #e0d4fb;
  color: #6639ba;
}
.k-group .name {
  color: #6639ba;
}
.k-error .raw {
  background: var(--danger-soft);
  border-color: #f7c9cb;
  color: var(--danger);
}
.k-error .name {
  color: var(--danger);
}
.cap {
  margin-top: 6px;
}
</style>
