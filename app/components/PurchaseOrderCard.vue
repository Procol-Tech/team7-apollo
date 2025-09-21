<template>
  <div class="purchase-order-card">
    <!-- Header -->
    <div class="card-header">
      <!-- <div class="header-icon">
        <img src="/icons/purchase-order.png" alt="Purchase Orders" class="w-4 h-4" />
      </div> -->
      <h3 class="header-title">PURCHASE ORDERS</h3>
    </div>
    
    <!-- Purchase Orders List -->
    <div 
      class="purchase-orders-list"
      :class="{ 'purchase-orders-list--scrollable': showAllResults }"
    >
      <div
        v-for="(po, index) in displayedPurchaseOrders"
        :key="po.identifier"
        class="purchase-order-item"
        @click.stop="handlePurchaseOrderClick(po)"
      >
        <div class="po-content">
          <div class="po-main-line">
            <span class="po-invoice">{{ po.invoice_no }}</span>
            <span class="po-bullet">•</span>
            <span class="po-buyer">{{ po.buyer_name }}</span>
          </div>
          <div class="po-details">
            <span class="po-vendor">{{ po.vendor_name }}</span>
            <span class="po-separator">•</span>
            <span class="po-event">{{ po.event_reference }}</span>
            <span class="po-separator">•</span>
            <span class="po-date">{{ formatDate(po.created_at) }}</span>
          </div>
          <div class="po-status">
            <span class="po-status-badge" :class="getStatusClass(po.purchase_order_status)">
              {{ getStatusDisplay(po.purchase_order_status) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Show All / Show Less Button -->
      <div v-if="purchaseOrders.length > 3" class="show-all-container">
        <button 
          v-if="!showAllResults"
          class="show-all-button" 
          @click.stop="handleShowAll"
        >
          Show All ({{ purchaseOrders.length }})
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
interface PurchaseOrder {
  readonly created_at: string
  readonly updated_at: string
  readonly identifier: string
  readonly invoice_no: string
  readonly line_items_count: number
  readonly buyer_identifier: string
  readonly buyer_name: string
  readonly vendor_name: string
  readonly vendor_identifier: string
  readonly vendor_code: string
  readonly city: string
  readonly event_identifier: string
  readonly event_reference: string
  readonly time_cycle: string | null
  readonly po_number: string | null
  readonly pr_identifier: readonly string[]
  readonly pr_number: readonly string[]
  readonly purchase_order_status: readonly {
    readonly key: string
    readonly type: string
    readonly display_value: string
    readonly order: number
  }[]
  readonly po_error_messages: string | null
  readonly po_amount: string
  readonly project_identifier: string
  readonly proposal_identifier: string
  readonly rfx_number: string
}

interface Props {
  purchaseOrders: readonly PurchaseOrder[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  purchaseOrderClick: [purchaseOrder: PurchaseOrder]
  showAll: []
}>()

// State for showing all results
const showAllResults = ref(false)

// Show only first 3 results or all results based on state
const displayedPurchaseOrders = computed(() => {
  return showAllResults.value ? props.purchaseOrders : props.purchaseOrders.slice(0, 3)
})

// Helper function to format date
const formatDate = (dateString: string): string => {
  // The date is already formatted as "07:31 PM, 18 Sep 2025"
  return dateString
}

// Helper function to get status display value
const getStatusDisplay = (statusArray: PurchaseOrder['purchase_order_status']): string => {
  if (statusArray && statusArray.length > 0) {
    return statusArray[0].display_value
  }
  return 'Unknown Status'
}

// Helper function to get status class
const getStatusClass = (statusArray: PurchaseOrder['purchase_order_status']): string => {
  if (!statusArray || statusArray.length === 0) {
    return 'status-unknown'
  }
  
  const status = statusArray[0]
  switch (status.type) {
    case 'info':
      return 'status-info'
    case 'success':
      return 'status-success'
    case 'warning':
      return 'status-warning'
    case 'error':
      return 'status-error'
    default:
      return 'status-unknown'
  }
}

// Handle purchase order click
const handlePurchaseOrderClick = (po: PurchaseOrder): void => {
  console.log('Purchase Order clicked:', po)
  emit('purchaseOrderClick', po)
}

// Handle show all button click
const handleShowAll = (): void => {
  console.log('Show All clicked')
  showAllResults.value = true
  emit('showAll')
}
</script>

<style scoped>
.purchase-order-card {
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

.purchase-orders-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.purchase-orders-list--scrollable {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}

/* Custom scrollbar styling */
.purchase-orders-list--scrollable::-webkit-scrollbar {
  width: 6px;
}

.purchase-orders-list--scrollable::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.purchase-orders-list--scrollable::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.purchase-orders-list--scrollable::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.purchase-order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border: 1px solid transparent;
}

.purchase-order-item:hover {
  background-color: #f9fafb;
  border-color: #e5e7eb;
}

.po-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.po-main-line {
  display: flex;
  align-items: center;
  gap: 4px;
}

.po-invoice {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.po-bullet {
  font-size: 14px;
  color: #6b7280;
}

.po-buyer {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.po-details {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.po-vendor {
  color: #6b7280;
}

.po-separator {
  color: #d1d5db;
}

.po-event {
  color: #6b7280;
}

.po-date {
  color: #6b7280;
}

.po-status {
  margin-top: 4px;
}

.po-status-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-info {
  background: #dbeafe;
  color: #1e40af;
}

.status-success {
  background: #dcfce7;
  color: #166534;
}

.status-warning {
  background: #fef3c7;
  color: #92400e;
}

.status-error {
  background: #fee2e2;
  color: #991b1b;
}

.status-unknown {
  background: #f3f4f6;
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
