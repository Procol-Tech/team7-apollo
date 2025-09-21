import { defineStore } from 'pinia'
import { useNetFlux } from '~/composables/useNetFlux'
import { type State, type APIState, useStateModifier } from '~/types/api-state'

interface SearchResult {
  id: number
  title: string
  description: string
  type: string
}

interface ApiSearchResponse {
  results: Array<{
    intent_classification: {
      intent_type: string
      intent: string
      status: string
      navigation_result: {
        success: boolean
        data: {
          purchase_requests?: PurchaseRequest[]
          groups?: Array<{
            data: {
              responses: Array<{
                [key: string]: any
              }>
            }
          }>
        }
        status_code: number
      }
    }
    raw_openai_response: string
  }>
  query: string
  user_id: string
  total_results: number
  search_time: number
}

interface PurchaseRequest {
  uuid: string
  data: {
    prNo: string
    purchGrp: string
    prTypeDesc: string
    additional_pr_data: Array<{
      data: {
        value: string | number
        option_key?: string
        prefix?: string
      }
      key_attribute: string
    }>
  }
  created_at: string
  status: string
  rfq_no: string
}

interface PurchaseOrder {
  created_at: string
  updated_at: string
  identifier: string
  invoice_no: string
  line_items_count: number
  buyer_identifier: string
  buyer_name: string
  vendor_name: string
  vendor_identifier: string
  vendor_code: string
  city: string
  event_identifier: string
  event_reference: string
  time_cycle: string | null
  po_number: string | null
  pr_identifier: readonly string[]
  pr_number: readonly string[]
  purchase_order_status: readonly {
    key: string
    type: string
    display_value: string
    order: number
  }[]
  po_error_messages: string | null
  po_amount: string
  project_identifier: string
  proposal_identifier: string
  rfx_number: string
}

interface Approval {
  readonly created_at: string
  readonly updated_at: string
  readonly checkbox: number
  readonly approval_request_id: string
  readonly ref_id: string
  readonly event_title: string
  readonly resource_id: string
  readonly deeplink_prefix: string
  readonly status: readonly {
    readonly key: string
    readonly type: string
    readonly display_value: string
    readonly order: number
  }[]
  readonly my_approval_required: boolean
  readonly my_approver_id: string
  readonly request_id: string
  readonly approval_type: string
  readonly company_name: string
  readonly my_status: readonly {
    readonly key: string
    readonly type: string
    readonly display_value: string
    readonly order: number
  }[]
  readonly project_name: string
  readonly initiator_name: string
  readonly expires_in: string
  readonly turn_around_time: string
  readonly current_approvers: readonly string[]
  readonly current_approvers_id: readonly string[]
  readonly proposal_data: string
  readonly delegated_to: readonly string[]
  readonly delegated_by: readonly string[]
  readonly team: string
  readonly current_stage: string
  readonly plants: string
  readonly quantity: string
  readonly fund_centers: string
  readonly wbs_elements: string
  readonly pr_line_numbers: string
  readonly material_names: string
  readonly product_codes: string
  readonly pr_number: string | null
  readonly pr_numbers: string | null
  readonly vendor_names: readonly string[]
  readonly flow_name: string
  readonly all_approver: readonly string[]
  readonly delegation_id: string | null
}

interface Event {
  readonly uuid: string
  readonly user: {
    readonly name: string
  }
  readonly stages: readonly {
    readonly uuid: string
    readonly ref_uuid: string
    readonly event_group_uuid: string
    readonly order_type: string
    readonly title: string
    readonly product: any
    readonly user_name: string
    readonly rfx_mode: string
    readonly created_at: number
    readonly starting_from: number
    readonly product_count: number
    readonly show_pending_approval: boolean
    readonly ending_at: number
    readonly extra_closing_time: number
    readonly auction_config: string
    readonly updated_at: number
    readonly rank_acceptance_message: string
    readonly status: string
    readonly is_multi_product: boolean
    readonly user_uuid: string
    readonly company_uuid: string
    readonly is_show_pending_delivery: boolean
    readonly firm_name: string
    readonly current_status: string
    readonly default_currency_symbol: string
    readonly is_sealbid_enabled: boolean
    readonly stage_indicator: {
      readonly key: string
      readonly display_value: string
    }
    readonly bid_indicator: {
      readonly key: string
      readonly display_value: string
    }
    readonly active_participants: number
    readonly total_participants: number
    readonly timeline: {
      readonly key: string
      readonly display_value: string
      readonly tooltip_value: string
      readonly time: {
        readonly type: string
        readonly value: string
      }
    }
    readonly updates: readonly {
      readonly key: string
      readonly type: string
      readonly display_value: string
      readonly order: number
      readonly label: string
      readonly count: number
    }[]
  }[]
  readonly title: string
  readonly ref_uuid: string
  readonly line_item_count: number
  readonly latest_stage_time: number
  readonly cursor_value: number
  readonly closed_at: number
  readonly company: {
    readonly uuid: string
    readonly name: string
    readonly status: string
    readonly is_verified: boolean
    readonly image_url: string
    readonly address: string
    readonly category: string
    readonly created_at: number
    readonly updated_at: number
    readonly city_uuid: string
    readonly city: string
    readonly tags: readonly string[]
  }
  readonly unresolved_chat_count: number
}

export const useSearchStore = defineStore('search', () => {
  // Initialize useNetFlux
  const { executeCall } = useNetFlux()
  
  // State
  const isOpen = ref(false)
  const searchQuery = ref('')
  const selectedIcon = ref(-1)
  const searchResults = ref<SearchResult[]>([])
  const searchHistory = ref<string[]>([])
  const apiResponse = ref<ApiSearchResponse | null>(null)
  const purchaseRequests = ref<PurchaseRequest[]>([])
  const purchaseOrders = ref<PurchaseOrder[]>([])
  const approvals = ref<Approval[]>([])
  const events = ref<Event[]>([])
  
  // N States Architecture for search API
  const searchAPIState = ref<APIState>({
    status: 'idle',
    message: 'Ready to search',
    data: null
  })

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

  // Extract purchase requests from API response
  const extractPurchaseRequests = (response: ApiSearchResponse): PurchaseRequest[] => {
    console.log('Extracting purchase requests from response:', response)
    
    const extractedPRs: PurchaseRequest[] = []
    
    // Check if response has results
    if (!response?.results || !Array.isArray(response.results)) {
      console.log('No results array found in response')
      return extractedPRs
    }
    
    // Iterate through each result
    for (const result of response.results) {
      // Check if this result has purchase request data
      if (result?.intent_classification?.intent === 'purchase_request' && 
          result?.intent_classification?.navigation_result?.success &&
          result?.intent_classification?.navigation_result?.data) {
            console.log('Purchase request found in response')
        
        const prData = result.intent_classification.navigation_result.data
        
        // Check if prData has purchase_requests array
        if (prData?.purchase_requests && Array.isArray(prData.purchase_requests)) {
          for (const pr of prData.purchase_requests) {
            if (isValidPurchaseRequest(pr)) {
              extractedPRs.push(pr)
            }
          }
        }
      }
    }
    
    console.log('Extracted purchase requests:', extractedPRs)
    return extractedPRs
  }

  // Helper function to validate if an object is a valid purchase request
  const isValidPurchaseRequest = (obj: any): obj is PurchaseRequest => {
    return (
      obj &&
      typeof obj === 'object' &&
      typeof obj.uuid === 'string' &&
      obj.data &&
      typeof obj.data.prNo === 'string' &&
      typeof obj.data.purchGrp === 'string' &&
      typeof obj.data.prTypeDesc === 'string' &&
      Array.isArray(obj.data.additional_pr_data) &&
      typeof obj.created_at === 'string' &&
      typeof obj.status === 'string' &&
      typeof obj.rfq_no === 'string'
    )
  }

  // Extract purchase orders from API response
  const extractPurchaseOrders = (response: ApiSearchResponse): PurchaseOrder[] => {
    console.log('Extracting purchase orders from response:', response)
    
    const extractedPOs: PurchaseOrder[] = []
    
    // Check if response has results
    if (!response?.results || !Array.isArray(response.results)) {
      console.log('No results array found in response')
      return extractedPOs
    }
    
    // Iterate through each result
    for (const result of response.results) {
      // Check if this result has purchase order data
      if (result?.intent_classification?.intent === 'purchase_order' && 
          result?.intent_classification?.navigation_result?.success &&
          result?.intent_classification?.navigation_result?.data) {
        
        const poData = result.intent_classification.navigation_result.data
        console.log('Purchase order data:', poData)
        
        // Check if poData has groups array
        if (poData?.groups && Array.isArray(poData.groups)) {
          for (const group of poData.groups) {
            if (group?.data?.responses && Array.isArray(group.data.responses)) {
              for (const responseItem of group.data.responses) {
                // responseItem is already the purchase order object
                console.log('Purchase order response item:', responseItem)
                
                // Extract only the required fields for the UI
                const extractedPO: PurchaseOrder = {
                  created_at: responseItem?.created_at || '',
                  updated_at: responseItem?.updated_at || '',
                  identifier: responseItem?.identifier || '',
                  invoice_no: responseItem?.invoice_no || '',
                  line_items_count: responseItem?.line_items_count || 0,
                  buyer_identifier: responseItem?.buyer_identifier || '',
                  buyer_name: responseItem?.buyer_name || '',
                  vendor_name: responseItem?.vendor_name || '',
                  vendor_identifier: responseItem?.vendor_identifier || '',
                  vendor_code: responseItem?.vendor_code || '',
                  city: responseItem?.city || '',
                  event_identifier: responseItem?.event_identifier || '',
                  event_reference: responseItem?.event_reference || '',
                  time_cycle: responseItem?.time_cycle || null,
                  po_number: responseItem?.po_number || null,
                  pr_identifier: responseItem?.pr_identifier || [],
                  pr_number: responseItem?.pr_number || [],
                  purchase_order_status: responseItem?.purchase_order_status || [],
                  po_error_messages: responseItem?.po_error_messages || null,
                  po_amount: responseItem?.po_amount || '',
                  project_identifier: responseItem?.project_identifier || '',
                  proposal_identifier: responseItem?.proposal_identifier || '',
                  rfx_number: responseItem?.rfx_number || ''
                }
                
                console.log('Extracted purchase order:', extractedPO)
                extractedPOs.push(extractedPO)
              }
            }
          }
        }
      }
    }
    
    console.log('Final extracted purchase orders:', extractedPOs)
    return extractedPOs
  }

  // Extract approvals from API response
  const extractApprovals = (response: ApiSearchResponse): Approval[] => {
    console.log('Extracting approvals from response:', response)
    
    const extractedApprovals: Approval[] = []
    
    // Check if response has results
    if (!response?.results || !Array.isArray(response.results)) {
      console.log('No results array found in response')
      return extractedApprovals
    }
    
    // Iterate through each result
    for (const result of response.results) {
      // Check if this result has approval data
      if (result?.intent_classification?.intent === 'approval' && 
          result?.intent_classification?.navigation_result?.success &&
          result?.intent_classification?.navigation_result?.data) {
        
        const approvalData = result.intent_classification.navigation_result.data
        console.log('Approval data:', approvalData)
        
        // Check if approvalData has groups array
        if (approvalData?.groups && Array.isArray(approvalData.groups)) {
          for (const group of approvalData.groups) {
            if (group?.data?.responses && Array.isArray(group.data.responses)) {
              for (const responseItem of group.data.responses) {
                // responseItem is already the approval object
                console.log('Approval response item:', responseItem)
                
                // Extract only the required fields for the UI
                const extractedApproval: Approval = {
                  created_at: responseItem?.created_at || '',
                  updated_at: responseItem?.updated_at || '',
                  checkbox: responseItem?.checkbox || 0,
                  approval_request_id: responseItem?.approval_request_id || '',
                  ref_id: responseItem?.ref_id || '',
                  event_title: responseItem?.event_title || '',
                  resource_id: responseItem?.resource_id || '',
                  deeplink_prefix: responseItem?.deeplink_prefix || '',
                  status: responseItem?.status || [],
                  my_approval_required: responseItem?.my_approval_required || false,
                  my_approver_id: responseItem?.my_approver_id || '',
                  request_id: responseItem?.request_id || '',
                  approval_type: responseItem?.approval_type || '',
                  company_name: responseItem?.company_name || '',
                  my_status: responseItem?.my_status || [],
                  project_name: responseItem?.project_name || '',
                  initiator_name: responseItem?.initiator_name || '',
                  expires_in: responseItem?.expires_in || '',
                  turn_around_time: responseItem?.turn_around_time || '',
                  current_approvers: responseItem?.current_approvers || [],
                  current_approvers_id: responseItem?.current_approvers_id || [],
                  proposal_data: responseItem?.proposal_data || '',
                  delegated_to: responseItem?.delegated_to || [],
                  delegated_by: responseItem?.delegated_by || [],
                  team: responseItem?.team || '',
                  current_stage: responseItem?.current_stage || '',
                  plants: responseItem?.plants || '',
                  quantity: responseItem?.quantity || '',
                  fund_centers: responseItem?.fund_centers || '',
                  wbs_elements: responseItem?.wbs_elements || '',
                  pr_line_numbers: responseItem?.pr_line_numbers || '',
                  material_names: responseItem?.material_names || '',
                  product_codes: responseItem?.product_codes || '',
                  pr_number: responseItem?.pr_number || null,
                  pr_numbers: responseItem?.pr_numbers || null,
                  vendor_names: responseItem?.vendor_names || [],
                  flow_name: responseItem?.flow_name || '',
                  all_approver: responseItem?.all_approver || [],
                  delegation_id: responseItem?.delegation_id || null
                }
                
                console.log('Extracted approval:', extractedApproval)
                extractedApprovals.push(extractedApproval)
              }
            }
          }
        }
      }
    }
    
    console.log('Final extracted approvals:', extractedApprovals)
    return extractedApprovals
  }

  // Extract events from API response
  const extractEvents = (response: ApiSearchResponse): Event[] => {
    console.log('Extracting events from response:', response)
    
    const extractedEvents: Event[] = []
    
    // Check if response has results
    if (!response?.results || !Array.isArray(response.results)) {
      console.log('No results array found in response')
      return extractedEvents
    }
    
    // Iterate through each result
    for (const result of response.results) {
      // Check if this result has event data
      if (result?.intent_classification?.intent === 'event' && 
          result?.intent_classification?.navigation_result?.success &&
          result?.intent_classification?.navigation_result?.data) {
        
        const eventData = result.intent_classification.navigation_result.data
        console.log('Event data:', eventData)
        
        // Check if eventData has event_groups array
        if (eventData?.event_groups && Array.isArray(eventData.event_groups)) {
          for (const eventGroup of eventData.event_groups) {
            // eventGroup is already the event object
            console.log('Event group:', eventGroup)
            
            // Extract only the required fields for the UI
            const extractedEvent: Event = {
              uuid: eventGroup?.uuid || '',
              user: {
                name: eventGroup?.user?.name || ''
              },
              stages: eventGroup?.stages || [],
              title: eventGroup?.title || '',
              ref_uuid: eventGroup?.ref_uuid || '',
              line_item_count: eventGroup?.line_item_count || 0,
              latest_stage_time: eventGroup?.latest_stage_time || 0,
              cursor_value: eventGroup?.cursor_value || 0,
              closed_at: eventGroup?.closed_at || 0,
              company: {
                uuid: eventGroup?.company?.uuid || '',
                name: eventGroup?.company?.name || '',
                status: eventGroup?.company?.status || '',
                is_verified: eventGroup?.company?.is_verified || false,
                image_url: eventGroup?.company?.image_url || '',
                address: eventGroup?.company?.address || '',
                category: eventGroup?.company?.category || '',
                created_at: eventGroup?.company?.created_at || 0,
                updated_at: eventGroup?.company?.updated_at || 0,
                city_uuid: eventGroup?.company?.city_uuid || '',
                city: eventGroup?.company?.city || '',
                tags: eventGroup?.company?.tags || []
              },
              unresolved_chat_count: eventGroup?.unresolved_chat_count || 0
            }
            
            console.log('Extracted event:', extractedEvent)
            extractedEvents.push(extractedEvent)
          }
        }
      }
    }
    
    console.log('Final extracted events:', extractedEvents)
    return extractedEvents
  }

  // Helper function to validate if an object is a valid purchase order
  const isValidPurchaseOrder = (obj: any): obj is PurchaseOrder => {
    console.log('Validating purchase order object:', obj)
    const isValid = (
      obj &&
      typeof obj === 'object' &&
      typeof obj.created_at === 'string' &&
      typeof obj.updated_at === 'string' &&
      typeof obj.identifier === 'string' &&
      typeof obj.invoice_no === 'string' &&
      typeof obj.line_items_count === 'number' &&
      typeof obj.buyer_identifier === 'string' &&
      typeof obj.buyer_name === 'string' &&
      typeof obj.vendor_name === 'string' &&
      typeof obj.vendor_identifier === 'string' &&
      typeof obj.event_identifier === 'string' &&
      typeof obj.event_reference === 'string' &&
      Array.isArray(obj.purchase_order_status) &&
      typeof obj.po_amount === 'string' &&
      typeof obj.project_identifier === 'string' &&
      typeof obj.proposal_identifier === 'string' &&
      typeof obj.rfx_number === 'string'
    )
    console.log('Purchase order validation result:', isValid)
    return isValid
  }

  const performSearch = async (query: string, iconType?: string) => {
    try {
      // Add to history
      addToHistory(query)
      
      // Set loading state using N States architecture
      useStateModifier(searchAPIState.value, 'loading', 'Thinking...')
      
      console.log('Searching for:', query, 'with icon type:', iconType)
      
      // Make API call using useNetFlux
      const response = await executeCall({
        apiRequest: {
          method: 'POST',
          endpoint: 'http://localhost:8000/api/v1/search/',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            query: query,
            user_id: 'user789',
            context: {}
          }
        },
        override: true,
        retries: 3,
        timeout: 10000,
        // cacheDuration: 30000,
        skipCache: true
      })
      
      // Store the raw API response
      apiResponse.value = response
      console.log('API Response received:', response)
      
      // Extract purchase requests from the API response
      const extractedPRs = extractPurchaseRequests(response)
      purchaseRequests.value = extractedPRs
      console.log('Purchase Requests extracted:', purchaseRequests.value)
      
      // Extract purchase orders from the API response
      const extractedPOs = extractPurchaseOrders(response)
      purchaseOrders.value = extractedPOs
      console.log('Purchase Orders extracted:', purchaseOrders.value)
      
      // Extract approvals from the API response
      const extractedApprovals = extractApprovals(response)
      approvals.value = extractedApprovals
      console.log('Approvals extracted:', approvals.value)
      
      // Extract events from the API response
      const extractedEvents = extractEvents(response)
      events.value = extractedEvents
      console.log('Events extracted:', events.value)
      
      // Update state to success using N States architecture
      const totalResults = extractedPRs.length + extractedPOs.length + extractedApprovals.length + extractedEvents.length
      if (totalResults > 0) {
        useStateModifier(
          searchAPIState.value, 
          'success', 
          `Found ${totalResults} result(s)`,
          { purchaseRequests: extractedPRs, purchaseOrders: extractedPOs, approvals: extractedApprovals, events: extractedEvents }
        )
      } else {
        useStateModifier(
          searchAPIState.value, 
          'success', 
          'No results found',
          []
        )
      }
      
      // For now, keep the mock results for searchResults
      const mockResults = [
        { id: 1, title: 'Search Result 1', description: 'Description for result 1', type: iconType || 'general' },
        { id: 2, title: 'Search Result 2', description: 'Description for result 2', type: iconType || 'general' }
      ]
      
      searchResults.value = mockResults
      return mockResults
      
    } catch (error: any) {
      console.error('Search API error:', error)
      
      // Update state to failed using N States architecture
      useStateModifier(
        searchAPIState.value, 
        'failed', 
        error.message || 'Search failed',
        null
      )
      
      searchResults.value = []
      apiResponse.value = null
      purchaseRequests.value = []
      return []
    }
  }

  return {
    // State
    isOpen: readonly(isOpen),
    searchQuery,
    selectedIcon,
    searchResults: readonly(searchResults),
    searchHistory: readonly(searchHistory),
    apiResponse: readonly(apiResponse),
    purchaseRequests: readonly(purchaseRequests),
    purchaseOrders: readonly(purchaseOrders),
    approvals: readonly(approvals),
    events: readonly(events),
    searchAPIState: readonly(searchAPIState),
    
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
    performSearch,
    extractPurchaseRequests,
    extractPurchaseOrders,
    extractApprovals,
    extractEvents
  }
})
