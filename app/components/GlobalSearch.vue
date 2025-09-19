<template>
  <!-- Backdrop -->
  <div 
    v-if="searchStore.isOpen" 
    class="backdrop"
    @click="handleBackdropClick"
  />
  
  <!-- Floating Search Bar -->
  <div 
    v-if="searchStore.isOpen"
    class="search-container"
  >
    <!-- Icon Buttons -->
    <div class="icon-buttons-container" @click.stop>
      <button
        v-for="(icon, index) in iconButtons"
        :key="index"
        class="icon-button"
        :class="{ 
          'selected': searchStore.selectedIcon === index,
          'hovered': hoveredIcon === index && searchStore.selectedIcon !== index
        }"
        @mouseenter="hoveredIcon = index"
        @mouseleave="hoveredIcon = -1"
        @click="handleIconClick(icon)"
      >
        <img 
          :src="(searchStore.selectedIcon === index || hoveredIcon === index) ? icon.selected : icon.normal" 
          :alt="icon.name"
          class="icon-image"
        />
      </button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar" @click.stop>
      <div class="search-input-container">
        <UIcon name="i-heroicons-magnifying-glass" class="search-icon" />
        <input
          ref="searchInput"
          v-model="searchStore.searchQuery"
          class="search-input"
          placeholder="Search for anything.."
          @keydown.escape="searchStore.closeSearch"
          @keydown.enter="handleSearch"
          autofocus
        />
        <div class="keyboard-hint">
          Ctrl or ⌘ + K
        </div>
      </div>
      
      <!-- Autocomplete Dropdown -->
      <div v-if="showAutocomplete" class="autocomplete-container">
        <AutocompleteDropdown
          :suggested-actions="suggestedActions"
          :related-documents="relatedDocuments"
          @action-click.prevent="handleActionClick"
          @document-click.prevent="handleDocumentClick"
          @duration-change.prevent="handleDurationChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSearchStore } from '~/store/search.store'
import AutocompleteDropdown from './AutocompleteDropdown.vue'
import { getAutocompleteData, type SuggestedAction, type RelatedDocument } from '~/data/autocomplete-data'

interface IconButton {
  name: string
  normal: string
  selected: string
}

const searchStore = useSearchStore()
const searchInput = ref<HTMLInputElement | null>(null)
const hoveredIcon = ref<number>(-1)

// Autocomplete data
const suggestedActions = ref<SuggestedAction[]>([])
const relatedDocuments = ref<RelatedDocument[]>([])
const showAutocomplete = ref(false)

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

// Keywords that trigger icon selection
const iconKeywords = {
  'approvals': ['approval', 'approvals', 'approve', 'approved', 'approving', 'sign off', 'signoff', 'authorize', 'authorization'],
  'custom': ['custom', 'customize', 'customization', 'personal', 'personalize', 'settings', 'preferences', 'config', 'configuration'],
  'pending': ['pending', 'waiting', 'queue', 'queued', 'in progress', 'processing', 'awaiting', 'hold', 'on hold'],
  'pr': ['pr', 'pull request', 'pullrequest', 'merge', 'review', 'code review', 'github', 'git', 'branch', 'commit']
}

// Handle search when Enter is pressed
const handleSearch = async (): Promise<void> => {
  if (searchStore.searchQuery.trim()) {
    const iconType = searchStore.selectedIcon >= 0 ? iconButtons[searchStore?.selectedIcon ?? 0]?.name : undefined
    await searchStore.performSearch(searchStore.searchQuery, iconType)
    searchStore.closeSearch()
  }
}

// Handle autocomplete action click
const handleActionClick = (action: SuggestedAction): void => {
  console.log('GlobalSearch - Action clicked:', action)
  // All actions are now expandable, so don't close search
  console.log('Not closing search - action is expandable')
}

// Handle autocomplete document click
const handleDocumentClick = (document: RelatedDocument): void => {
  console.log('Document clicked:', document)
  // You can add logic here to open the document
  searchStore.closeSearch()
}

// Handle duration change
const handleDurationChange = (actionId: string, duration: string): void => {
  console.log('Duration changed:', actionId, duration)
  // You can add logic here to handle duration changes
}

// Handle backdrop click
const handleBackdropClick = (): void => {
  console.log('Backdrop clicked - closing search')
  searchStore.closeSearch()
}

// Handle icon button click
const handleIconClick = (icon: IconButton): void => {
  searchStore.setSelectedIcon(iconButtons.indexOf(icon))
  console.log('Icon clicked:', icon.name)
}

// Function to find matching icon based on search query
const findMatchingIcon = (query: string): number => {
  const lowerQuery = query.toLowerCase().trim()
  
  for (const [iconName, keywords] of Object.entries(iconKeywords)) {
    const hasMatch = keywords.some(keyword => lowerQuery.includes(keyword))
    
    if (hasMatch) {
      const iconIndex = iconButtons.findIndex(icon => icon.name === iconName)
      return iconIndex
    }
  }
  
  return -1 // No match found
}

// Watch for search query changes and auto-select icon
watch(() => searchStore.searchQuery, (newQuery) => {
  if (newQuery && newQuery.trim()) {
    const matchingIconIndex = findMatchingIcon(newQuery)
    if (matchingIconIndex !== searchStore.selectedIcon) {
      searchStore.setSelectedIcon(matchingIconIndex)
    }
    
    // Show autocomplete dropdown with sample data
    const autocompleteData = getAutocompleteData(newQuery)
    suggestedActions.value = autocompleteData.suggestedActions
    relatedDocuments.value = autocompleteData.relatedDocuments
    showAutocomplete.value = true
  } else {
    // Clear selection when query is empty
    if (searchStore.selectedIcon !== -1) {
      searchStore.setSelectedIcon(-1)
    }
    showAutocomplete.value = false
    suggestedActions.value = []
    relatedDocuments.value = []
  }
}, { immediate: true })

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
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  z-index: 50;
}

.search-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  width: 100%;
  max-width: 42rem;
  margin: 0 16px;
}

.icon-buttons-container {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  justify-content: flex-start;
}

.search-bar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e5e7eb;
}

.search-input-container {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
}

.search-icon {
  width: 20px;
  height: 20px;
  color: #9ca3af;
  flex-shrink: 0;
}

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

.keyboard-hint {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
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
  background: #3B82F6;
  border-color: #2563EB;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.icon-button.hovered {
  background: #F3F4F6;
  border-color: #D1D5DB;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.icon-image {
  width: 40px;
  height: 40px;
  transition: opacity 0.2s ease;
}

.autocomplete-container {
  border-top: 1px solid #f3f4f6;
  padding: 16px;
}
</style>