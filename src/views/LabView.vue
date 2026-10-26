<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { samples } from '@/data/samples'
import { run, patternRisk } from '@/core/regex'
import { explainPattern } from '@/core/explain'
import HighlightedText from '@/components/HighlightedText.vue'
import MatchList from '@/components/MatchList.vue'
import TokenTable from '@/components/TokenTable.vue'

const route = useRoute()

const mode = ref<'single' | 'compare'>('single')
const text = ref('订单号：SO202610260001，金额：199.00\n用户 13800138000 于 2026-10-26 15:30:25 登录')
const pattern = ref('(SO)(\\d+)')
const flags = ref('g')
const activeIndex = ref<number | null>(null)

const comparePatterns = ref<string[]>(['\\d+', '\\d*', '\\d?'])
const compareText = ref('编号 123 与 456')
const showExplain = ref(true)

const flagSet = ref(new Set(['g']))
const FLAGS = [
  { key: 'g', label: 'g', tip: '全局匹配' },
  { key: 'i', label: 'i', tip: '忽略大小写' },
  { key: 'm', label: 'm', tip: '多行模式' },
  { key: 's', label: 's', tip: 'dotAll' }
]

function toggleFlag(k: string) {
  const next = new Set(flagSet.value)
  if (next.has(k)) {
    if (k === 'g') return
    next.delete(k)
  } else next.add(k)
  flagSet.value = next
  flags.value = [...next].join('')
}

const flagsStr = computed(() => [...flagSet.value].join('') || 'g')
const result = computed(() => run(pattern.value, flagsStr.value, text.value))
const explained = computed(() => explainPattern(pattern.value))
const effectiveCount = computed(() => result.value.matches.filter((m) => m.value !== '').length)
const emptyCount = computed(() => result.value.matches.length - effectiveCount.value)
const risk = computed(() => patternRisk(pattern.value))

const compareResults = computed(() =>
  comparePatterns.value.map((p) => {
    const r = run(p, 'g', compareText.value)
    const effective = r.matches.filter((m) => m.value !== '')
    return {
      pattern: p,
      result: r,
      count: effective.length,
      emptyCount: r.matches.length - effective.length,
      values: effective.map((m) => m.value)
    }
  })
)

const currentSample = ref('')

function useSample(id: string) {
  const s = samples.find((x) => x.id === id)
  if (!s) return
  currentSample.value = id
  if (mode.value === 'single') {
    text.value = s.text
    if (s.try) pattern.value = s.try
  } else {
    compareText.value = s.text
  }
}

function setComparePreset(kind: 'quant' | 'anchor' | 'lazy') {
  if (kind === 'quant') {
    mode.value = 'compare'
    compareText.value = '编号 123 与 456'
    comparePatterns.value = ['\\d+', '\\d*', '\\d?']
  } else if (kind === 'anchor') {
    mode.value = 'compare'
    compareText.value = 'abc\nabcd\n xabc'
    comparePatterns.value = ['abc', '^abc', '^abc$']
  } else {
    mode.value = 'compare'
    compareText.value = '<a>123</a><a>456</a>'
    comparePatterns.value = ['<a>.*</a>', '<a>.*?</a>', '<a>[^<]*</a>']
  }
}

onMounted(() => {
  const q = route.query
  if (q.text) text.value = String(q.text)
  if (q.pattern) pattern.value = String(q.pattern)
  if (q.flags) {
    flags.value = String(q.flags)
    flagSet.value = new Set(String(q.flags).split(''))
  }
  if (q.compare === '1') {
    mode.value = 'compare'
    if (q.text) compareText.value = String(q.text)
  }
})

watch(flagsStr, (v) => {
  flags.value = v
})
</script>

<template>
  <div class="lab">
    <div class="lab-head">
      <div>
        <h1>正则实验室</h1>
        <p class="tiny muted">
          左边写文本，右边写正则。所有结果、分组、逐字符解释都是同一份计算 —— 改一个字符，三处同时变。
        </p>
      </div>
      <div class="tabs">
        <button class="tab" :class="{ on: mode === 'single' }" @click="mode = 'single'">单正则</button>
        <button class="tab" :class="{ on: mode === 'compare' }" @click="mode = 'compare'">对比模式</button>
      </div>
    </div>

    <div v-if="mode === 'single'" class="grid">
      <!-- 文本 -->
      <section class="panel panel-pad">
        <div class="ph">
          <h2 class="section-title">文本</h2>
          <span class="tiny muted">{{ text.length }} 字符</span>
        </div>
        <el-input v-model="text" type="textarea" :rows="12" spellcheck="false" placeholder="粘贴任意文本…" />
        <div class="samples">
          <div class="sh tiny">示例文本</div>
          <div class="chips">
            <button
              v-for="s in samples"
              :key="s.id"
              class="chip"
              :class="{ on: currentSample === s.id }"
              :title="s.text.slice(0, 60)"
              @click="useSample(s.id)"
            >
              {{ s.category }}
            </button>
          </div>
        </div>
      </section>

      <!-- 正则 -->
      <section class="panel panel-pad">
        <div class="ph">
          <h2 class="section-title">正则表达式</h2>
          <div class="flags">
            <button v-for="f in FLAGS" :key="f.key" class="flag" :class="{ on: flagSet.has(f.key) }" :title="f.tip" @click="toggleFlag(f.key)">
              {{ f.label }}
            </button>
          </div>
        </div>
        <el-input v-model="pattern" spellcheck="false" placeholder="例如 (SO)(\d+)" size="large">
          <template #prepend>/</template>
          <template #append>/{{ flagsStr }}</template>
        </el-input>
        <div v-if="!result.ok" class="err tiny">⚠ {{ result.error }}</div>
        <div v-if="risk" class="risk tiny">⚠ {{ risk }}</div>

        <div class="quick">
          <span class="tiny">对比预设：</span>
          <button class="qbtn" @click="setComparePreset('quant')">+ / * / ?</button>
          <button class="qbtn" @click="setComparePreset('anchor')">锚点</button>
          <button class="qbtn" @click="setComparePreset('lazy')">贪婪 vs 懒惰</button>
        </div>

        <div class="preview">
          <div class="plabel tiny">高亮预览</div>
          <HighlightedText
            :text="text"
            :pattern="pattern"
            :flags="flagsStr"
            :active-index="activeIndex"
            max-height="220px"
          />
        </div>

        <div class="mini-stats">
          <span class="ms"><b class="mono">{{ effectiveCount }}</b> 处匹配</span>
          <span v-if="emptyCount" class="ms"><b class="mono">{{ emptyCount }}</b> 处空匹配</span>
          <span class="ms"><b class="mono">{{ explained.captureCount }}</b> 个捕获组</span>
          <span class="ms"><b class="mono">{{ explained.rows.length }}</b> 个 token</span>
        </div>
      </section>

      <!-- 结果 + 解释 -->
      <section class="panel panel-pad">
        <div class="ph">
          <h2 class="section-title">匹配结果</h2>
          <span class="tiny muted">悬停看高亮</span>
        </div>
        <MatchList :matches="result.matches" :active-index="activeIndex" max-height="200px" @hover="activeIndex = $event" />

        <div class="explain-head">
          <h2 class="section-title">逐字符解释</h2>
          <button class="link-btn tiny" @click="showExplain = !showExplain">{{ showExplain ? '收起' : '展开' }}</button>
        </div>
        <div v-if="showExplain" class="explain">
          <TokenTable :pattern="pattern" />
        </div>
      </section>
    </div>

    <!-- 对比模式 -->
    <div v-else class="compare">
      <section class="panel panel-pad">
        <div class="ph">
          <h2 class="section-title">同一段文本</h2>
          <span class="tiny muted">三个正则并排看差异</span>
        </div>
        <el-input v-model="compareText" type="textarea" :rows="4" spellcheck="false" />
        <HighlightedText class="cmp-hl" :text="compareText" :pattern="comparePatterns[0] || ''" flags="g" max-height="120px" />
      </section>

      <section class="cmp-grid">
        <div v-for="(cp, i) in compareResults" :key="i" class="panel panel-pad cmp-card">
          <div class="ph">
            <h2 class="section-title">正则 {{ String.fromCharCode(65 + i) }}</h2>
            <span class="tiny mono" :class="cp.count ? 'ok' : 'muted'">
              {{ cp.count }} 处<template v-if="cp.emptyCount"> · 空 {{ cp.emptyCount }}</template>
            </span>
          </div>
          <el-input v-model="comparePatterns[i]" spellcheck="false" size="small" />
          <div class="cmp-hl">
            <HighlightedText :text="compareText" :pattern="cp.pattern" flags="g" max-height="96px" />
          </div>
          <div class="cmp-values">
            <span v-for="(v, mi) in cp.values.slice(0, 20)" :key="mi" class="cv mono">{{ v }}</span>
            <span v-if="!cp.values.length" class="tiny muted">无匹配</span>
          </div>
          <p class="cmp-desc tiny">{{ explainPattern(cp.pattern).summary }}</p>
        </div>
      </section>

      <div class="cmp-tip tiny muted">
        提示：把 <code class="regex-code">\d+</code> 换成 <code class="regex-code">\d*</code>，注意"空匹配"
        和数量变化 —— 这就是"允不允许 0 次"的差别。
      </div>
    </div>
  </div>
</template>

<style scoped>
.lab {
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px 20px 50px;
}
.lab-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.lab-head h1 {
  font-size: 20px;
  margin: 0 0 3px;
}
.tabs {
  display: flex;
  background: var(--bg-sunken);
  border-radius: 7px;
  padding: 3px;
}
.tab {
  border: none;
  background: transparent;
  padding: 5px 14px;
  border-radius: 5px;
  font-size: 12.5px;
  cursor: pointer;
  color: var(--text-2);
}
.tab.on {
  background: var(--panel);
  color: var(--text);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}
.grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.1fr) minmax(0, 1.05fr);
  gap: 12px;
  align-items: start;
}
.ph {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 9px;
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
}
.flag.on {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.err {
  color: var(--danger);
  margin-top: 6px;
}
.risk {
  color: var(--warn);
  margin-top: 4px;
}
.samples {
  margin-top: 10px;
}
.sh {
  color: var(--text-3);
  font-weight: 700;
  margin-bottom: 5px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  max-height: 100px;
  overflow: auto;
}
.chip {
  border: 1px solid var(--border);
  background: var(--panel-2);
  border-radius: 4px;
  font-size: 11px;
  padding: 1px 7px;
  cursor: pointer;
  color: var(--text-2);
}
.chip.on,
.chip:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}
.quick {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.qbtn {
  border: 1px dashed var(--border-strong);
  background: transparent;
  color: var(--text-2);
  font-size: 11px;
  border-radius: 4px;
  padding: 1px 7px;
  cursor: pointer;
}
.qbtn:hover {
  color: var(--accent);
  border-color: var(--accent);
}
.preview {
  margin-top: 12px;
}
.plabel {
  color: var(--text-3);
  font-weight: 700;
  margin-bottom: 4px;
}
.mini-stats {
  display: flex;
  gap: 16px;
  margin-top: 9px;
  font-size: 11.5px;
  color: var(--text-3);
}
.ms b {
  color: var(--text);
  font-size: 13px;
}
.explain-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 14px 0 6px;
}
.link-btn {
  border: none;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
}
.explain {
  border-top: 1px dashed var(--border);
  padding-top: 8px;
}
:deep(.el-input-group__prepend),
:deep(.el-input-group__append) {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text-3);
  padding: 0 8px;
  background: var(--panel-2);
}
.compare {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cmp-hl {
  margin-top: 8px;
}
.cmp-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.cmp-card .ok {
  color: var(--success);
  font-weight: 700;
}
.cmp-values {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
  min-height: 24px;
}
.cv {
  font-size: 11px;
  background: var(--match-a);
  border: 1px solid var(--match-a-edge);
  border-radius: 3px;
  padding: 0 5px;
  color: #6b4b00;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cmp-desc {
  margin: 8px 0 0;
  color: var(--text-3);
  line-height: 1.6;
  border-top: 1px dashed var(--border);
  padding-top: 6px;
}
@media (max-width: 1180px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .cmp-grid {
    grid-template-columns: 1fr;
  }
}
</style>
