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
    :class="{ 
      'search-container--expanded': showAutocomplete && !isFullscreen,
      'search-container--fullscreen': isFullscreen
    }"
  >
    <!-- Icon Buttons -->
    <div v-if="!isFullscreen" class="icon-buttons-container" @click.stop>
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
          @keydown.escape="handleEscape"
          @keydown.enter="handleSearch"
          autofocus
        />
        <div class="keyboard-hint">
          Ctrl or ⌘ + K
        </div>
      </div>
      
      <!-- Autocomplete Dropdown -->
      <div v-if="showAutocomplete" class="autocomplete-container" :class="{ 'autocomplete-container--fullscreen': isFullscreen }">
        <!-- Loading State -->
        <div v-if="searchStore.searchAPIState.status === 'loading'" class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-text">{{ searchStore.searchAPIState.message }}</p>
        </div>
        
        <!-- Success State -->
        <div v-else-if="searchStore.searchAPIState.status === 'success'">
          <div v-if="searchStore.purchaseRequests.length > 0 || searchStore.purchaseOrders.length > 0 || searchStore.approvals.length > 0 || searchStore.events.length > 0">
            <AutocompleteDropdown
              :purchase-requests="searchStore.purchaseRequests"
              :purchase-orders="searchStore.purchaseOrders"
              :approvals="searchStore.approvals"
              :events="searchStore.events"
              :intent="currentIntent"
              @purchase-request-click.prevent="handlePurchaseRequestClick"
              @purchase-order-click.prevent="handlePurchaseOrderClick"
              @approval-click.prevent="handleApprovalClick"
              @event-click.prevent="handleEventClick"
              @show-all.prevent="handleShowAll"
            />
          </div>
          <div v-else class="no-results-state">
            <p class="no-results-text">{{ searchStore.searchAPIState.message }}</p>
            <div v-if="searchStore.recentSearches.length > 0" class="recent-section">
              <div class="recent-header">Recent searches</div>
              <div class="recent-list">
                <button
                  v-for="(item, idx) in searchStore.recentSearches"
                  :key="idx"
                  class="recent-item"
                  @click="handleRecentClick(item)"
                >
                  <UIcon name="i-heroicons-clock" class="recent-icon" />
                  <span class="recent-text">{{ item }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Failed State -->
        <div v-else-if="searchStore.searchAPIState.status === 'failed'" class="error-state">
          <div class="error-icon">⚠️</div>
          <p class="error-text">{{ searchStore.searchAPIState.message }}</p>
          <button class="retry-button" @click="retrySearch">Try Again</button>
        </div>
        
        <!-- Idle State -->
        <div v-else-if="searchStore.searchAPIState.status === 'idle'" class="idle-state">
          <p class="idle-text">Start typing to perform an action...</p>
          <div v-if="searchStore.recentSearches.length > 0" class="recent-section">
            <div class="recent-header">Recent searches</div>
            <div class="recent-list">
              <button
                v-for="(item, idx) in searchStore.recentSearches"
                :key="idx"
                class="recent-item"
                @click="handleRecentClick(item)"
              >
                <UIcon name="i-heroicons-clock" class="recent-icon" />
                <span class="recent-text">{{ item }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSearchStore } from '~/store/search.store'
import AutocompleteDropdown from './AutocompleteDropdown.vue'

interface PurchaseRequest {
  readonly uuid: string
  readonly data: {
    readonly prNo: string
    readonly purchGrp: string
    readonly prTypeDesc: string
    readonly additional_pr_data: readonly {
      readonly data: {
        readonly value: string | number
        readonly option_key?: string
        readonly prefix?: string
      }
      readonly key_attribute: string
    }[]
  }
  readonly created_at: string
  readonly status: string
  readonly rfq_no: string
}

interface IconButton {
  name: string
  normal: string
  selected: string
}

const searchStore = useSearchStore()
const searchInput = ref<HTMLInputElement | null>(null)
const hoveredIcon = ref<number>(-1)

// Show autocomplete state
const showAutocomplete = ref(false)

// Fullscreen mode state
const isFullscreen = ref(false)

// Get intent from API response
const currentIntent = computed(() => {
  if (searchStore.apiResponse?.results?.[0]?.intent_classification?.intent) {
    return searchStore.apiResponse.results[0].intent_classification.intent
  }
  return 'purchase_request' // default fallback
})

// Debounce timer ref
let debounceTimer: NodeJS.Timeout | null = null

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

// Debounced search function
const debouncedSearch = (query: string): void => {
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  // Set new timer
  debounceTimer = setTimeout(async () => {
    if (query && query.trim()) {
      const iconType = searchStore.selectedIcon >= 0 ? iconButtons[searchStore?.selectedIcon ?? 0]?.name : undefined
      console.log('Triggering debounced API call for:', query)
      await searchStore.performSearch(query, iconType)
    }
  }, 200) // 400ms debounce
}

// Handle search when Enter is pressed
const handleSearch = async (): Promise<void> => {
  isFullscreen.value = true

  if (searchStore.searchQuery.trim()) {
    // Clear any pending debounced search to prevent duplicate calls
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    
    // Add to recent searches only on explicit Enter
    searchStore.addToHistory(searchStore.searchQuery)
    const iconType = searchStore.selectedIcon >= 0 ? iconButtons[searchStore?.selectedIcon ?? 0]?.name : undefined
    await searchStore.performSearch(searchStore.searchQuery, iconType)
    
    // Enter fullscreen mode if we have results
    if (searchStore.purchaseRequests.length > 0 || searchStore.purchaseOrders.length > 0 || searchStore.approvals.length > 0 || searchStore.events.length > 0) {
      showAutocomplete.value = true
      // Ensure input maintains focus in fullscreen mode
      nextTick(() => {
        searchInput.value?.focus()
      })
    } else {
      searchStore.closeSearch()
    }
  }
}

// Handle purchase request click
const handlePurchaseRequestClick = (purchaseRequest: PurchaseRequest): void => {
  const baseUrl = 'https://cpanel.ag-ri.in/purchase-requisitions/'
  const uuid = purchaseRequest?.uuid
  if (uuid) {
    const url = `${baseUrl}${uuid}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  searchStore.closeSearch()
}

// Handle purchase order click
const handlePurchaseOrderClick = (purchaseOrder: any): void => {
  console.log('Purchase Order clicked:', purchaseOrder)
  // You can add logic here to open the purchase order
  searchStore.closeSearch()
}

// Handle approval click
const handleApprovalClick = (approval: any): void => {
  console.log('Approval clicked:', approval)
  // You can add logic here to open the approval
  searchStore.closeSearch()
}

// Handle event click
const handleEventClick = (event: any): void => {
  const baseUrl = 'https://cpanel.ag-ri.in/project/'
  const uuid = event?.uuid
  if (uuid) {
    const url = `${baseUrl}${uuid}/details`
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  searchStore.closeSearch()
}

// Handle backdrop click
const handleBackdropClick = (): void => {
  console.log('Backdrop clicked - closing search')
  if (isFullscreen.value) {
    isFullscreen.value = false
    showAutocomplete.value = false
  } else {
    searchStore.closeSearch()
  }
}

// Handle escape key to exit fullscreen
const handleEscape = (): void => {
  console.log('Escape key pressed, isFullscreen:', isFullscreen.value)
  if (isFullscreen.value) {
    isFullscreen.value = false
    showAutocomplete.value = false
    console.log('Exited fullscreen mode')
  } else {
    searchStore.closeSearch()
    console.log('Closed search')
  }
}

// Handle retry search
const retrySearch = (): void => {
  if (searchStore.searchQuery.trim()) {
    const iconType = searchStore.selectedIcon >= 0 ? iconButtons[searchStore?.selectedIcon ?? 0]?.name : undefined
    searchStore.performSearch(searchStore.searchQuery, iconType)
  }
}

// Handle show all button click
const handleShowAll = (): void => {
  console.log('Show All clicked - functionality to be implemented later')
  // TODO: Implement show all functionality
}

// Handle icon button click
const handleIconClick = (icon: IconButton): void => {
  searchStore.setSelectedIcon(iconButtons.indexOf(icon))
  console.log('Icon clicked:', icon.name)
}

// Handle recent search click
const handleRecentClick = async (query: string): Promise<void> => {
  if (!query || !query.trim()) return
  searchStore.setSearchQuery(query)
  isFullscreen.value = true
  // Cancel any pending debounce to avoid double calls
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  const iconType = searchStore.selectedIcon >= 0 ? iconButtons[searchStore?.selectedIcon ?? 0]?.name : undefined
  await searchStore.performSearch(query, iconType)
  showAutocomplete.value = true
  nextTick(() => {
    searchInput.value?.focus()
  })
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
    
    // Trigger debounced API call
    debouncedSearch(newQuery)
    
    // Show autocomplete dropdown
    showAutocomplete.value = true
  } else {
    // Clear selection when query is empty
    if (searchStore.selectedIcon !== -1) {
      searchStore.setSelectedIcon(-1)
    }
    showAutocomplete.value = false
    
    // Clear any pending debounced search
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
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
    // Cleanup debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  })
})
</script>

<style scoped>

@keyframes fadeIn {
  from {
    scale: 0.8;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    scale: 1;
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes slideUp {
  from {
    top: 50%;
    transform: translate(-50%, -50%);
  }
  to {
    top: 10%;
    transform: translate(-50%, 0);
  }
}

@keyframes slideDown {
  from {
    top: 10%;
    transform: translate(-50%, 0);
  }
  to {
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

@keyframes expandToFullscreen {
  from {
    top: 10%;
    left: 50%;
    transform: translate(-50%, 0);
    width: 100%;
    max-width: 42rem;
    margin: 0 16px;
  }
  to {
    top: 0;
    left: 0;
    transform: none;
    width: 100vw;
    max-width: none;
    margin: 0;
    height: 100vh;
  }
}

@keyframes slideToTop {
  from {
    top: 10%;
    transform: translate(-50%, 0);
  }
  to {
    top: 0;
    transform: translate(-50%, 0);
  }
}
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
  animation: fadeIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  animation-fill-mode: forwards;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.search-container--expanded {
  top: 10%;
  transform: translate(-50%, 0);
  animation: slideUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
  animation-fill-mode: forwards;
}

.search-container--fullscreen {
  top: 0;
  left: 0;
  transform: none;
  width: 100vw;
  height: 100vh;
  max-width: none;
  margin: 0;
  border-radius: 0;
  animation: expandToFullscreen 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
  animation-fill-mode: forwards;
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

.search-container--fullscreen .search-bar {
  border-radius: 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-left: none;
  border-right: none;
  border-top: none;
}

.search-container--fullscreen .search-input-container {
  padding: 20px 24px;
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
  max-height: 400px;
  overflow-y: auto;
}

.autocomplete-container--fullscreen {
  height: calc(100vh - 80px);
  max-height: none;
  padding: 24px;
  background: white;
  border-top: 1px solid #f3f4f6;
  overflow-y: auto;
}

/* N States Architecture - State Components */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.no-results-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.no-results-text {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.error-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.error-text {
  color: #dc2626;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.retry-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.retry-button:hover {
  background: #2563eb;
}

.idle-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.idle-text {
  color: #9ca3af;
  font-size: 14px;
  margin: 0;
}

/* Recent searches styles */
.recent-section {
  margin-top: 16px;
}

.recent-header {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
}

.recent-item:hover {
  background: #f3f4f6;
}

.recent-icon {
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.recent-text {
  color: #374151;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>