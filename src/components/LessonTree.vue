<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { chapters, lessons } from '@/data/curriculum'
import { lessonProgress } from '@/stores/progress'

const props = defineProps<{ currentLessonId: string }>()
const router = useRouter()

const currentChapterId = computed(() => lessons.find((l) => l.id === props.currentLessonId)?.chapterId)
const openIds = ref<string[]>(currentChapterId.value ? [currentChapterId.value] : [chapters[0]?.id])

watch(currentChapterId, (v) => {
  if (v && !openIds.value.includes(v)) openIds.value = [...openIds.value, v]
})

function toggle(id: string) {
  openIds.value = openIds.value.includes(id) ? openIds.value.filter((x) => x !== id) : [...openIds.value, id]
}

function go(lessonId: string) {
  router.push(`/learn/${lessonId}`)
}

function stateOf(lessonId: string) {
  const p = lessonProgress(lessonId)
  if (p.learned) return 'learned'
  if (p.attempts) return 'trying'
  return 'todo'
}
</script>

<template>
  <nav class="tree">
    <div class="tree-head">
      <span class="h-title">学习路线</span>
      <span class="tiny muted">{{ chapters.length }} 章 · {{ lessons.length }} 节</span>
    </div>
    <div class="chapters">
      <div v-for="c in chapters" :key="c.id" class="chapter">
        <button class="ch-head" :class="{ open: openIds.includes(c.id) }" @click="toggle(c.id)">
          <span class="ch-no">{{ c.no }}</span>
          <span class="ch-title">{{ c.title }}</span>
          <span class="ch-pct mono">{{
            c.lessons.filter((l) => lessonProgress(l.id).learned).length
          }}/{{ c.lessons.length }}</span>
          <span class="chev">{{ openIds.includes(c.id) ? '▾' : '▸' }}</span>
        </button>
        <div v-if="openIds.includes(c.id)" class="lessons">
          <button
            v-for="l in c.lessons"
            :key="l.id"
            class="lesson"
            :class="{ active: l.id === currentLessonId, [stateOf(l.id)]: true }"
            @click="go(l.id)"
          >
            <span class="dot" />
            <span class="l-title">{{ l.title }}</span>
            <span v-if="stateOf(l.id) === 'learned'" class="mark">✓</span>
            <span v-else-if="stateOf(l.id) === 'trying'" class="mark trying">•</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.tree-head {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.h-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: var(--text-2);
}
.chapters {
  overflow: auto;
  padding: 6px 0 20px;
  flex: 1;
}
.ch-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  color: var(--text);
  font-size: 12.5px;
}
.ch-head:hover {
  background: var(--bg);
}
.ch-no {
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--text-3);
}
.ch-title {
  font-weight: 600;
  flex: 1;
}
.ch-pct {
  font-size: 10.5px;
  color: var(--text-3);
}
.chev {
  color: var(--text-3);
  font-size: 10px;
}
.lessons {
  padding: 2px 0 6px;
}
.lesson {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px 5px 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-size: 12.5px;
  color: var(--text-2);
  border-left: 2px solid transparent;
}
.lesson:hover {
  background: var(--bg);
  color: var(--text);
}
.lesson.active {
  background: var(--accent-soft);
  color: var(--accent);
  border-left-color: var(--accent);
  font-weight: 600;
}
.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--border-strong);
  flex: 0 0 auto;
}
.lesson.learned .dot {
  background: var(--success);
}
.lesson.trying .dot {
  background: var(--accent);
}
.l-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mark {
  font-size: 11px;
  color: var(--success);
  font-weight: 700;
}
.mark.trying {
  color: var(--accent);
}
</style>
