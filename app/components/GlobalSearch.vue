<template>
  <!-- Backdrop -->
  <div 
    v-if="searchStore.isOpen" 
    class="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
    @click="searchStore.closeSearch"
  />
  
  <!-- Floating Search Bar -->
  <div 
    v-if="searchStore.isOpen"
    class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4"
  >
    <!-- Icon Buttons -->
    <div class="flex gap-2 mb-4 justify-start">
      <button
        v-for="(icon, index) in iconButtons"
        :key="index"
        class="icon-button"
        :class="{ 'selected': hoveredIcon === index }"
        @mouseenter="hoveredIcon = index"
        @mouseleave="hoveredIcon = -1"
        @click="handleIconClick(icon)"
      >
        <img 
          :src="hoveredIcon === index ? icon.selected : icon.normal" 
          :alt="icon.name"
          class="w-10 h-10"
        />
      </button>
    </div>

    <!-- Search Bar -->
    <div class="bg-white rounded-xl shadow-2xl border border-gray-200">
      <div class="flex items-center gap-4 px-6 py-4">
        <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-gray-400 flex-shrink-0" />
        <input
          ref="searchInput"
          v-model="searchStore.searchQuery"
          class="search-input"
          placeholder="Search for anything.."
          @keydown.escape="searchStore.closeSearch"
          @keydown.enter="handleSearch"
          autofocus
        />
        <div class="text-xs text-gray-400 flex-shrink-0">
          Ctrl or ⌘ + K
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSearchStore } from '~/store/search.store'

interface IconButton {
  name: string
  normal: string
  selected: string
}

const searchStore = useSearchStore()
const searchInput = ref<HTMLInputElement | null>(null)
const hoveredIcon = ref<number>(-1)

// Icon buttons configuration
const iconButtons: IconButton[] = [
  {
    name: 'approvals',
    normal: "/icons/approvals-normal.png",
    selected: "/icons/approvals-selected.png"
  },
  {
    name: 'custom',
    normal: "/icons/custom-normal.png",
    selected: "/icons/custom-selected.png"
  },
  {
    name: 'pending',
    normal: "/icons/pending-normal.png",
    selected: "/icons/pending-selected.png"
  },
  {
    name: 'pr',
    normal: "/icons/pr-normal.png",
    selected: "/icons/pr-selected.png"
  }
]

// Handle search when Enter is pressed
const handleSearch = async (): Promise<void> => {
  if (searchStore.searchQuery.trim()) {
    const iconType = searchStore.selectedIcon >= 0 ? iconButtons[searchStore?.selectedIcon ?? 0]?.name : undefined
    await searchStore.performSearch(searchStore.searchQuery, iconType)
    searchStore.closeSearch()
  }
}

// Handle icon button click
const handleIconClick = (icon: IconButton): void => {
  searchStore.setSelectedIcon(iconButtons.indexOf(icon))
  console.log('Icon clicked:', icon.name)
}

// Open search
const openSearch = (): void => {
  searchStore.openSearch()
  nextTick(() => {
    searchInput.value?.focus()
  })
}

// Expose methods for parent component
defineExpose({
  openSearch,
  closeSearch: searchStore.closeSearch
})

// Global keyboard shortcut listener
onMounted(() => {
  const handleKeydown = (event: KeyboardEvent): void => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault()
      searchStore.openSearch()
      nextTick(() => {
        searchInput.value?.focus()
      })
    }
  }
  
  document.addEventListener('keydown', handleKeydown)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})
</script>

<style scoped>
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  color: #374151;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.search-input::placeholder {
  color: #9CA3AF;
  font-weight: 400;
}

.search-input:focus {
  outline: none;
}

.icon-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.icon-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.icon-button.selected {
  background: #F3F4F6;
  border-color: #D1D5DB;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.icon-button img {
  transition: opacity 0.2s ease;
}
</style>