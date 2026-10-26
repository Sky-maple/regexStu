<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import SearchDialog from './SearchDialog.vue'
import { progress } from '@/stores/progress'

const route = useRoute()
const searchOpen = ref(false)

const nav = [
  { to: '/', label: '首页' },
  { to: '/learn', label: '学习' },
  { to: '/lab', label: '实验室' },
  { to: '/practice', label: '练习' },
  { to: '/challenge', label: '随机挑战' },
  { to: '/mistakes', label: '错题本' },
  { to: '/cases', label: '实战案例' },
  { to: '/progress', label: '进度' }
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <header class="hdr">
    <div class="inner">
      <router-link to="/" class="logo">
        <span class="mark mono">.*</span>
        <span class="name">正则实验室</span>
      </router-link>

      <nav class="nav">
        <router-link
          v-for="n in nav"
          :key="n.to"
          :to="n.to"
          class="nav-item"
          :class="{ active: isActive(n.to) }"
        >
          {{ n.label }}
        </router-link>
      </nav>

      <div class="right">
        <button class="search" @click="searchOpen = true">
          <span class="ico">⌕</span>
          <span class="ph">搜索知识点</span>
          <span class="kbd mono">Ctrl K</span>
        </button>
        <div v-if="progress.stats.streak > 0" class="streak" title="当前连续答对">
          ⚡ {{ progress.stats.streak }}
        </div>
      </div>
    </div>
    <SearchDialog v-model="searchOpen" />
  </header>
</template>

<style scoped>
.hdr {
  height: 52px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 30;
}
.inner {
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 18px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
  flex: 0 0 auto;
}
.mark {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  background: linear-gradient(140deg, #2f6feb, #8250df);
  color: #fff;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.name {
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.2px;
}
.nav {
  display: flex;
  align-items: center;
  gap: 2px;
  overflow-x: auto;
  flex: 1;
  scrollbar-width: none;
}
.nav::-webkit-scrollbar {
  display: none;
}
.nav-item {
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 12.5px;
  color: var(--text-2);
  white-space: nowrap;
  transition: all 0.12s ease;
}
.nav-item:hover {
  background: var(--bg);
  color: var(--text);
}
.nav-item.active {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}
.right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--border);
  background: var(--panel-2);
  border-radius: 6px;
  color: var(--text-3);
  cursor: pointer;
  font-size: 12px;
}
.search:hover {
  border-color: var(--border-strong);
  color: var(--text-2);
}
.ico {
  font-size: 13px;
}
.kbd {
  font-size: 10px;
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 0 3px;
  background: var(--panel);
}
.streak {
  font-size: 11.5px;
  font-family: var(--mono);
  color: var(--warn);
  background: var(--warn-soft);
  border: 1px solid #f0dfa8;
  border-radius: 999px;
  padding: 1px 7px;
}
@media (max-width: 900px) {
  .name {
    display: none;
  }
  .ph,
  .kbd {
    display: none;
  }
}
</style>
