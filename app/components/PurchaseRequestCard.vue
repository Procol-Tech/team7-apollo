<template>
  <div class="purchase-request-card">
    <!-- Header -->
    <div class="card-header">
      <!-- <div class="header-icon">
        <img src="/icons/purchase-request.png" alt="Purchase Requests" class="w-4 h-4" />
      </div> -->
      <h3 class="header-title">PURCHASE REQUESTS</h3>
    </div>
    
    <!-- Purchase Requests List -->
    <div 
      class="purchase-requests-list"
      :class="{ 'purchase-requests-list--scrollable': showAllResults }"
    >
      <div
        v-for="(pr, index) in displayedPurchaseRequests"
        :key="pr.uuid"
        class="purchase-request-item"
        @click.stop="handlePurchaseRequestClick(pr)"
      >
        <div class="pr-content">
          <div class="pr-main-line">
            <span class="pr-number">{{ pr.data.prNo }}</span>
            <span class="pr-bullet">•</span>
            <span class="pr-title">{{ getTitle(pr) }}</span>
          </div>
          <div class="pr-details">
            <span class="pr-group">{{ pr.data.purchGrp }}</span>
            <span class="pr-separator">•</span>
            <span class="pr-date">{{ formatDate(pr.created_at) }}</span>
            <span class="pr-separator">•</span>
            <span class="pr-status" :class="getStatusClass(pr.status)">{{ pr.status }}</span>
          </div>
        </div>
      </div>
      
      <!-- Show All / Show Less Button -->
      <div v-if="purchaseRequests.length > 3" class="show-all-container">
        <button 
          v-if="!showAllResults"
          class="show-all-button" 
          @click.stop="handleShowAll"
        >
          Show All ({{ purchaseRequests.length }})
        </button>
        <button 
          v-else
          class="show-less-button" 
          @click.stop="showAllResults = false"
        >
          Show Less
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

interface Props {
  purchaseRequests: readonly PurchaseRequest[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  purchaseRequestClick: [purchaseRequest: PurchaseRequest]
  showAll: []
}>()

// State for showing all results
const showAllResults = ref(false)

// Show only first 3 results or all results based on state
const displayedPurchaseRequests = computed(() => {
  return showAllResults.value ? props.purchaseRequests : props.purchaseRequests.slice(0, 3)
})

// Helper function to get title from additional_pr_data
const getTitle = (pr: PurchaseRequest): string => {
  const companyData = pr.data.additional_pr_data?.find(item => 
    item.key_attribute === 'company_code'
  )
  return companyData?.data?.value?.toString() || 'No Title'
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Helper function to get status class
const getStatusClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'status-active'
    case 'pending':
      return 'status-pending'
    case 'completed':
      return 'status-completed'
    case 'cancelled':
      return 'status-cancelled'
    default:
      return 'status-default'
  }
}

// Handle purchase request click
const handlePurchaseRequestClick = (pr: PurchaseRequest): void => {
  console.log('Purchase Request clicked:', pr)
  emit('purchaseRequestClick', pr)
}

// Handle show all button click
const handleShowAll = (): void => {
  console.log('Show All clicked')
  showAllResults.value = true
  emit('showAll')
}
</script>

<style scoped>
.purchase-request-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.header-icon {
  flex-shrink: 0;
}

.header-title {
  font-size: 14px;
  font-weight: bold;
  color: #1f2937;
}

.purchase-requests-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.purchase-requests-list--scrollable {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}

/* Custom scrollbar styling */
.purchase-requests-list--scrollable::-webkit-scrollbar {
  width: 6px;
}

.purchase-requests-list--scrollable::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.purchase-requests-list--scrollable::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.purchase-requests-list--scrollable::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.purchase-request-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border: 1px solid transparent;
}

.purchase-request-item:hover {
  background-color: #f9fafb;
  border-color: #e5e7eb;
}

.pr-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.pr-main-line {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pr-number {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.pr-bullet {
  font-size: 14px;
  color: #6b7280;
}

.pr-title {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.pr-details {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.pr-group {
  color: #6b7280;
}

.pr-separator {
  color: #d1d5db;
}

.pr-date {
  color: #6b7280;
}

.pr-status {
  font-weight: 500;
  text-transform: capitalize;
}

.status-active {
  color: #059669;
}

.status-pending {
  color: #d97706;
}

.status-completed {
  color: #2563eb;
}

.status-cancelled {
  color: #dc2626;
}

.status-default {
  color: #6b7280;
}

.show-all-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.show-all-button {
  background: #f8fafc;
  color: #3b82f6;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.show-all-button:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #2563eb;
}

.show-less-button {
  background: #f8fafc;
  color: #6b7280;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.show-less-button:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #374151;
}
</style>
