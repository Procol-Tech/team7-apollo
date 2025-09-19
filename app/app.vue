<template>
  <div>
   <NuxtPage />
   <GlobalSearch ref="globalSearch" />
  </div>
</template>

<script setup lang="ts">
import { useSearchStore } from './store/search.store'

const searchStore = useSearchStore();

// Expose global search methods
const openSearch = (): void => {
  searchStore.openSearch()
}

// Make search available globally
// provide('globalSearch', { openSearch })
</script>
