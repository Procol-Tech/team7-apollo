import { defineStore } from 'pinia'

interface SearchResult {
  id: number
  title: string
  description: string
  type: string
}

export const useSearchStore = defineStore('search', () => {
  // State
  const isOpen = ref(false)
  const searchQuery = ref('')
  const selectedIcon = ref(-1)
  const searchResults = ref<SearchResult[]>([])
  const searchHistory = ref<string[]>([])

  // Getters
  const hasSearchQuery = computed(() => searchQuery.value.trim().length > 0)
  const recentSearches = computed(() => searchHistory.value.slice(0, 5))

  // Actions
  const openSearch = () => {
    isOpen.value = true
  }

  const closeSearch = () => {
    isOpen.value = false
    searchQuery.value = ''
    selectedIcon.value = -1
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setSelectedIcon = (iconIndex: number) => {
    selectedIcon.value = iconIndex
  }

  const addToHistory = (query: string) => {
    if (query.trim() && !searchHistory.value.includes(query.trim())) {
      searchHistory.value.unshift(query.trim())
      // Keep only last 10 searches
      if (searchHistory.value.length > 10) {
        searchHistory.value = searchHistory.value.slice(0, 10)
      }
    }
  }

  const clearHistory = () => {
    searchHistory.value = []
  }

  const performSearch = async (query: string, iconType?: string) => {
    try {
      // Add to history
      addToHistory(query)
      
      // TODO: Implement actual search logic based on iconType
      console.log('Searching for:', query, 'with icon type:', iconType)
      
      // Mock search results - replace with actual API call
      const mockResults = [
        { id: 1, title: 'Search Result 1', description: 'Description for result 1', type: iconType || 'general' },
        { id: 2, title: 'Search Result 2', description: 'Description for result 2', type: iconType || 'general' }
      ]
      
      searchResults.value = mockResults
      return mockResults
    } catch (error) {
      console.error('Search error:', error)
      searchResults.value = []
      return []
    }
  }

  return {
    // State
    isOpen: readonly(isOpen),
    searchQuery: readonly(searchQuery),
    selectedIcon: readonly(selectedIcon),
    searchResults: readonly(searchResults),
    searchHistory: readonly(searchHistory),
    
    // Getters
    hasSearchQuery,
    recentSearches,
    
    // Actions
    openSearch,
    closeSearch,
    setSearchQuery,
    setSelectedIcon,
    addToHistory,
    clearHistory,
    performSearch
  }
})
