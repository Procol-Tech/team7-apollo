<template>
  <div class="autocomplete-dropdown" @click.stop>
    <!-- Purchase Requests Card -->
    <PurchaseRequestCard
      v-if="intent === 'purchase_request'"
      :purchase-requests="purchaseRequests"
      @purchase-request-click="handlePurchaseRequestClick"
      @show-all="handleShowAll"
    />
    
    <!-- Purchase Orders Card -->
    <PurchaseOrderCard
      v-else-if="intent === 'purchase_order'"
      :purchase-orders="purchaseOrders"
      @purchase-order-click="handlePurchaseOrderClick"
      @show-all="handleShowAll"
    />
    
    <!-- Approvals Card -->
    <ApprovalCard
      v-else-if="intent === 'approval'"
      :approvals="approvals"
      @approval-click="handleApprovalClick"
      @show-all="handleShowAll"
    />
    
    <!-- Events Card -->
    <EventCard
      v-else-if="intent === 'event'"
      :events="events"
      @event-click="handleEventClick"
      @show-all="handleShowAll"
    />
  </div>
</template>

<script setup lang="ts">
import PurchaseRequestCard from './PurchaseRequestCard.vue'
import PurchaseOrderCard from './PurchaseOrderCard.vue'
import ApprovalCard from './ApprovalCard.vue'
import EventCard from './EventCard.vue'

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

interface Props {
  purchaseRequests: readonly PurchaseRequest[]
  purchaseOrders: readonly PurchaseOrder[]
  approvals: readonly Approval[]
  events: readonly Event[]
  intent: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  purchaseRequestClick: [purchaseRequest: PurchaseRequest]
  purchaseOrderClick: [purchaseOrder: PurchaseOrder]
  approvalClick: [approval: Approval]
  eventClick: [event: Event]
  showAll: []
}>()

const handlePurchaseRequestClick = (purchaseRequest: PurchaseRequest): void => {
  emit('purchaseRequestClick', purchaseRequest)
}

const handlePurchaseOrderClick = (purchaseOrder: PurchaseOrder): void => {
  emit('purchaseOrderClick', purchaseOrder)
}

const handleApprovalClick = (approval: Approval): void => {
  emit('approvalClick', approval)
}

const handleEventClick = (event: Event): void => {
  emit('eventClick', event)
}

const handleShowAll = (): void => {
  emit('showAll')
}
</script>

<style scoped>


.separator {
  border-top: 1px solid #e5e7eb;
  margin: 16px 0;
}
</style>
