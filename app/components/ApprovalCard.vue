<template>
  <div class="approval-card">
    <div class="approval-header">
      <h3 class="approval-title">Approvals</h3>
    </div>
    
    <div class="approvals-list" :class="{ 'approvals-list--scrollable': showAllResults }">
      <div
        v-for="(approval, index) in displayedApprovals"
        :key="approval.approval_request_id"
        class="approval-item"
        @click="handleApprovalClick(approval)"
      >
        <div class="approval-content">
          <div class="approval-main-info">
            <div class="approval-event-title">{{ approval.event_title }}</div>
            <div class="approval-company">{{ approval.company_name }}</div>
            <div class="approval-details">
              <div class="approval-initiator font-bold">By: {{ approval.initiator_name }}</div>
            </div>
          </div>
          
          <div class="approval-details">
            <div class="approval-type">{{ approval.approval_type }}</div>
            <!-- <div class="approval-time">{{ approval.turn_around_time }}</div> -->
            <div class="approval-date">{{ approval.created_at }}</div>
          </div>
          
          <div class="approval-status">
            <span 
              class="status-badge"
              :class="getStatusClass(approval.status[0]?.type)"
            >
              {{ approval.status[0]?.display_value || 'Unknown' }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Show All / Show Less Button -->
    <div v-if="approvals.length > 3" class="show-all-container">
      <button 
        v-if="!showAllResults"
        class="show-all-button"
        @click="showAllResults = true"
      >
        Show All ({{ approvals.length }})
      </button>
      <button 
        v-else
        class="show-less-button"
        @click="showAllResults = false"
      >
        Show Less
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
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

interface Props {
  approvals: readonly Approval[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  approvalClick: [approval: Approval]
  showAll: []
}>()

const showAllResults = ref(false)

// Show only first 3 results initially
const displayedApprovals = computed(() => {
  return showAllResults.value ? props.approvals : props.approvals.slice(0, 3)
})

const handleApprovalClick = (approval: Approval): void => {
  emit('approvalClick', approval)
}

const getStatusClass = (statusType: string): string => {
  switch (statusType) {
    case 'pending':
      return 'status-pending'
    case 'success':
      return 'status-success'
    case 'error':
      return 'status-error'
    case 'info':
      return 'status-info'
    default:
      return 'status-default'
  }
}
</script>

<style scoped>
.approval-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.approval-header {
  padding: 16px 16px 0 16px;
  border-bottom: 1px solid #f3f4f6;
}

.approval-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.approvals-list {
  padding: 8px 0;
}

.approvals-list--scrollable {
  max-height: 300px;
  overflow-y: auto;
}

.approvals-list--scrollable::-webkit-scrollbar {
  width: 6px;
}

.approvals-list--scrollable::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.approvals-list--scrollable::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.approvals-list--scrollable::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.approval-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.approval-item:hover {
  background-color: #f9fafb;
}

.approval-item:last-child {
  border-bottom: none;
}

.approval-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.approval-main-info {
  flex: 1;
  min-width: 0;
  max-width: 45%;
}

.approval-event-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  line-height: 1.4;
}

.approval-company {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.approval-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #6b7280;
  min-width: 120px;
}

.approval-type {
  font-weight: 500;
  color: #374151;
}

.approval-initiator {
  color: #6b7280;
}

.approval-time {
  color: #059669;
  font-weight: 500;
}

.approval-date {
  color: #9ca3af;
}

.approval-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-success {
  background-color: #d1fae5;
  color: #065f46;
}

.status-error {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-info {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-default {
  background-color: #f3f4f6;
  color: #6b7280;
}

.show-all-container {
  padding: 12px 16px;
  border-top: 1px solid #f3f4f6;
  text-align: center;
}

.show-all-button,
.show-less-button {
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.show-all-button:hover,
.show-less-button:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.show-less-button {
  color: #6b7280;
}
</style>
