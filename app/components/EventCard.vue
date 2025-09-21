<template>
  <div class="event-card">
    <!-- Header -->
    <div class="card-header">
      <h3 class="header-title">EVENTS</h3>
    </div>
    
    <!-- Events List -->
    <div 
      class="events-list"
      :class="{ 'events-list--scrollable': showAllResults }"
    >
      <div
        v-for="(event, index) in displayedEvents"
        :key="event.uuid"
        class="event-item"
        @click.stop="handleEventClick(event)"
      >
        <div class="event-content">
          <div class="event-main-line">
            <span class="event-title">{{ event.title }}</span>
            <span class="event-bullet">•</span>
            <span class="event-ref">{{ event.ref_uuid }}</span>
          </div>
          <div class="event-details">
            <span class="event-company">{{ event.company.name }}</span>
            <span class="event-separator">•</span>
            <span class="event-user">{{ event.user.name }}</span>
            <span class="event-separator">•</span>
            <span class="event-items">{{ event.line_item_count }} items</span>
          </div>
          <div class="event-stage-info" v-if="event.stages.length > 0">
            <span class="event-stage-title">{{ event.stages[0].title }}</span>
            <span class="event-separator">•</span>
            <span class="event-stage-status" :class="getStageStatusClass(event.stages[0].stage_indicator.key)">
              {{ event.stages[0].stage_indicator.display_value }}
            </span>
            <span class="event-separator">•</span>
            <span class="event-timeline">{{ event.stages[0].timeline.display_value }}</span>
          </div>
        </div>
      </div>
      
      <!-- Show All / Show Less Button -->
      <div v-if="events.length > 3" class="show-all-container">
        <button 
          v-if="!showAllResults"
          class="show-all-button" 
          @click.stop="handleShowAll"
        >
          Show All ({{ events.length }})
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
  events: readonly Event[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  eventClick: [event: Event]
  showAll: []
}>()

const showAllResults = ref(false)

// Show only first 3 results initially
const displayedEvents = computed(() => {
  return showAllResults.value ? props.events : props.events.slice(0, 3)
})

const handleEventClick = (event: Event): void => {
  emit('eventClick', event)
}

const handleShowAll = (): void => {
  emit('showAll')
}

const getStageStatusClass = (statusKey: string): string => {
  switch (statusKey) {
    case 'active':
      return 'status-active'
    case 'expired':
      return 'status-expired'
    case 'completed':
      return 'status-completed'
    case 'pending':
      return 'status-pending'
    default:
      return 'status-default'
  }
}
</script>

<style scoped>
.event-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 16px 0 16px;
  border-bottom: 1px solid #f3f4f6;
}

.header-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 12px 0;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.events-list {
  padding: 8px 0;
}

.events-list--scrollable {
  max-height: 300px;
  overflow-y: auto;
}

.events-list--scrollable::-webkit-scrollbar {
  width: 6px;
}

.events-list--scrollable::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.events-list--scrollable::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.events-list--scrollable::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.event-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.event-item:hover {
  background-color: #f9fafb;
}

.event-item:last-child {
  border-bottom: none;
}

.event-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-main-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  line-height: 1.4;
}

.event-title {
  color: #374151;
  font-weight: 600;
}

.event-bullet {
  color: #9ca3af;
  font-weight: 400;
}

.event-ref {
  color: #3b82f6;
  font-weight: 500;
}

.event-details {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.event-company {
  color: #374151;
  font-weight: 500;
}

.event-separator {
  color: #9ca3af;
}

.event-user {
  color: #6b7280;
}

.event-items {
  color: #059669;
  font-weight: 500;
}

.event-stage-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}

.event-stage-title {
  color: #374151;
  font-weight: 500;
}

.event-stage-status {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-expired {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-completed {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-default {
  background-color: #f3f4f6;
  color: #6b7280;
}

.event-timeline {
  color: #dc2626;
  font-weight: 500;
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
