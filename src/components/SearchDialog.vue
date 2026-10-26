<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { searchGlossary } from '@/data/glossary'
import { lessons } from '@/data/curriculum'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const router = useRouter()
const keyword = ref('')
const inputRef = ref()

const results = computed(() => {
  const k = keyword.value.trim()
  if (!k) return []
  return searchGlossary(k).slice(0, 8)
})

const lessonHits = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return []
  return lessons
    .filter((l) => `${l.title} ${l.essence} ${l.points.join(' ')}`.toLowerCase().includes(k))
    .slice(0, 5)
})

function close() {
  emit('update:modelValue', false)
}

function goLesson(id?: string) {
  if (!id) return
  router.push(`/learn/${id}`)
  close()
}

function tryInLab(pattern: string) {
  router.push({ path: '/lab', query: { pattern, flags: 'g' } })
  close()
}

function onEnter() {
  if (results.value.length) goLesson(results.value[0].lessonId)
  else if (lessonHits.value.length) goLesson(lessonHits.value[0].id)
}

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    emit('update:modelValue', !props.modelValue)
  }
  if (e.key === 'Escape' && props.modelValue) close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

watch(
  () => props.modelValue,
  async (v) => {
    if (v) {
      await nextTick()
      inputRef.value?.focus?.()
    } else {
      keyword.value = ''
    }
  }
)
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    width="620px"
    :show-close="false"
    align-center
    class="search-dialog"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
  >
    <template #header>
      <div class="sd-head">
        <el-input
          ref="inputRef"
          v-model="keyword"
          size="large"
          placeholder="搜索 \\d、+、?=、lookbehind、捕获组…"
          @keyup.enter="onEnter"
        />
      </div>
    </template>

    <div class="sd-body">
      <div v-if="!keyword.trim()" class="tip">
        <p>试试这些：</p>
        <div class="chips">
          <button v-for="k in ['\\d', '+', '[]', '(?=)', '贪婪', 'Java']" :key="k" class="chip mono" @click="keyword = k">
            {{ k }}
          </button>
        </div>
      </div>

      <template v-else>
        <div v-if="results.length" class="group">
          <div class="g-title tiny">知识点</div>
          <button v-for="r in results" :key="r.key" class="item" @click="goLesson(r.lessonId)">
            <div class="i-head">
              <code class="key mono">{{ r.key }}</code>
              <span class="i-title">{{ r.title }}</span>
              <span class="tag tag-gray tiny">{{ r.kind }}</span>
            </div>
            <p class="i-sum">{{ r.summary }}</p>
            <p v-if="r.related" class="i-rel tiny muted">相关：{{ r.related.join(' · ') }}</p>
            <span class="try tiny" @click.stop="tryInLab(r.key === '\\' ? '\\\\' : r.key)">在实验室试一下 ↗</span>
          </button>
        </div>

        <div v-if="lessonHits.length" class="group">
          <div class="g-title tiny">课程</div>
          <button v-for="l in lessonHits" :key="l.id" class="item lesson-item" @click="goLesson(l.id)">
            <span class="tag tag-blue tiny">{{ l.chapterNo }}</span>
            <span class="i-title">{{ l.title }}</span>
            <span class="muted tiny">{{ l.chapterTitle }}</span>
          </button>
        </div>

        <div v-if="!results.length && !lessonHits.length" class="tip">
          没有找到「{{ keyword }}」。换个关键词试试，比如 <code class="mono">\\d</code>、
          <code class="mono">量词</code>。
        </div>
      </template>
    </div>
  </el-dialog>
</template>

<style scoped>
.sd-head {
  padding-right: 4px;
}
.sd-body {
  max-height: 60vh;
  overflow: auto;
}
.tip {
  font-size: 12.5px;
  color: var(--text-3);
}
.tip p {
  margin: 0 0 8px;
}
.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.chip {
  border: 1px solid var(--border);
  background: var(--panel-2);
  border-radius: 5px;
  padding: 2px 8px;
  font-size: 12px;
  cursor: pointer;
  color: var(--text-2);
}
.chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.group {
  margin-bottom: 10px;
}
.g-title {
  color: var(--text-3);
  font-weight: 700;
  letter-spacing: 0.5px;
  margin: 4px 0 4px;
}
.item {
  display: block;
  width: 100%;
  text-align: left;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 6px;
  padding: 7px 9px;
  cursor: pointer;
  position: relative;
}
.item:hover {
  background: var(--bg);
  border-color: var(--border);
}
.i-head {
  display: flex;
  align-items: center;
  gap: 7px;
}
.key {
  font-size: 11.5px;
  background: #eef2f8;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0 5px;
  color: #0a3069;
}
.i-title {
  font-weight: 600;
  font-size: 12.5px;
  color: var(--text);
}
.i-sum {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--text-2);
  line-height: 1.6;
}
.i-rel {
  margin: 2px 0 0;
  font-family: var(--mono);
}
.try {
  position: absolute;
  right: 8px;
  top: 7px;
  color: var(--accent);
  opacity: 0.55;
  transition: opacity 0.12s ease;
}
.item:hover .try {
  opacity: 1;
}
.lesson-item {
  display: flex;
  align-items: center;
  gap: 7px;
}
</style>
