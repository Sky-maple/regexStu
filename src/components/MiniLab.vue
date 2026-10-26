<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HighlightedText from './HighlightedText.vue'
import MatchList from './MatchList.vue'
import TokenTable from './TokenTable.vue'
import { run } from '@/core/regex'

const props = withDefaults(
  defineProps<{
    text: string
    pattern: string
    flags?: string
    /** 文本区行数 */
    rows?: number
    /** 是否显示逐字符解释入口 */
    explain?: boolean
  }>(),
  { flags: 'g', rows: 5, explain: true }
)

const emit = defineEmits<{
  (e: 'update:text', v: string): void
  (e: 'update:pattern', v: string): void
  (e: 'update:flags', v: string): void
}>()

const localText = ref(props.text)
const localPattern = ref(props.pattern)
const flagSet = ref(new Set((props.flags || 'g').split('')))

watch(
  () => props.text,
  (v) => {
    if (v !== localText.value) localText.value = v
  }
)
watch(
  () => props.pattern,
  (v) => {
    if (v !== localPattern.value) localPattern.value = v
  }
)
watch(
  () => props.flags,
  (v) => {
    const next = new Set((v || 'g').split(''))
    if ([...next].sort().join('') !== [...flagSet.value].sort().join('')) flagSet.value = next
  }
)

const flagsStr = computed(() => [...flagSet.value].join(''))
const result = computed(() => run(localPattern.value, flagsStr.value, localText.value))
const showExplain = ref(false)

const FLAGS: { key: string; label: string; tip: string }[] = [
  { key: 'g', label: 'g', tip: '全局：找出所有匹配' },
  { key: 'i', label: 'i', tip: '忽略大小写' },
  { key: 'm', label: 'm', tip: '多行：^ $ 按行生效' },
  { key: 's', label: 's', tip: 'dotAll：. 可匹配换行' }
]

function toggleFlag(key: string) {
  const next = new Set(flagSet.value)
  if (next.has(key)) {
    if (key === 'g') return
    next.delete(key)
  } else next.add(key)
  flagSet.value = next
  emit('update:flags', [...next].join(''))
}

function onText(v: string) {
  localText.value = v
  emit('update:text', v)
}
function onPattern(v: string) {
  localPattern.value = v
  emit('update:pattern', v)
}
</script>

<template>
  <div class="mini-lab">
    <div class="field">
      <div class="flabel">
        <span>测试文本</span>
        <span class="tiny muted">{{ localText.length }} 字符</span>
      </div>
      <el-input
        :model-value="localText"
        type="textarea"
        :rows="rows"
        spellcheck="false"
        placeholder="在这里粘贴一段文本…"
        @update:model-value="onText"
      />
    </div>

    <div class="field">
      <div class="flabel">
        <span>正则表达式</span>
        <span class="flags">
          <button
            v-for="f in FLAGS"
            :key="f.key"
            class="flag"
            :class="{ on: flagSet.has(f.key) }"
            :title="f.tip"
            @click="toggleFlag(f.key)"
          >
            {{ f.label }}
          </button>
        </span>
      </div>
      <el-input
        :model-value="localPattern"
        spellcheck="false"
        placeholder="例如 \d+"
        class="pat"
        @update:model-value="onPattern"
      >
        <template #prepend>/</template>
        <template #append>/{{ flagsStr }}</template>
      </el-input>
    </div>

    <div class="field">
      <div class="flabel"><span>实时匹配</span></div>
      <HighlightedText :text="localText" :pattern="localPattern" :flags="flagsStr" max-height="180px" />
      <div class="matches">
        <MatchList :matches="result.matches" max-height="160px" />
      </div>
    </div>

    <div v-if="explain" class="field">
      <button class="link-btn" @click="showExplain = !showExplain">
        {{ showExplain ? '收起逐字符解释' : '展开逐字符解释' }}
      </button>
      <div v-if="showExplain" class="explain">
        <TokenTable :pattern="localPattern" compact />
      </div>
    </div>
  </div>
</template>

<style scoped>
.mini-lab {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.flabel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  margin-bottom: 5px;
}
.flags {
  display: flex;
  gap: 3px;
}
.flag {
  font-family: var(--mono);
  font-size: 11px;
  height: 20px;
  min-width: 20px;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text-3);
  border-radius: 4px;
  cursor: pointer;
  padding: 0 5px;
  transition: all 0.12s ease;
}
.flag.on {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.matches {
  margin-top: 8px;
}
.link-btn {
  border: none;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font-size: 12.5px;
  padding: 0;
}
.explain {
  margin-top: 8px;
}
:deep(.pat .el-input-group__prepend),
:deep(.pat .el-input-group__append) {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text-3);
  padding: 0 8px;
  background: var(--panel-2);
}
</style>
