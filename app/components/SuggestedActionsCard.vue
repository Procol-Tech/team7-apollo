<template>
  <div class="suggested-actions-card">
    <!-- Header -->
    <div class="card-header">
      <div class="header-icon">
        <img src="/icons/suggested-actions.png" alt="Suggested Actions" class="w-4 h-4" />
      </div>
      <h3 class="header-title">SUGGESTED ACTIONS</h3>
    </div>
    
    <!-- Actions List -->
    <div class="actions-list">
      <template v-for="(action, index) in actions" :key="index">
        <div
          class="action-item"
          :class="{ 
            'has-chevron': !completedActions.has(getUniqueActionId(action, index)),
            'expanded': expandedActionIndex === index && !completedActions.has(getUniqueActionId(action, index)),
            'completed': completedActions.has(getUniqueActionId(action, index))
          }"
          @click.stop="!completedActions.has(getUniqueActionId(action, index)) ? handleActionClick(action, index) : null"
        >
          <div class="action-content">
            <div class="action-main">
              <span class="action-id">{{ action.id }}</span>
              <span class="action-bullet">•</span>
              <span class="action-description">
                {{ completedActions.has(getUniqueActionId(action, index)) ? 'Extended time in RFP' : action.description }}
              </span>
            </div>
            <div v-if="completedActions.has(getUniqueActionId(action, index))" class="action-duration">| 30 mins</div>
          </div>
          
          <!-- Show chevron for normal actions -->
          <div v-if="!completedActions.has(getUniqueActionId(action, index))" class="action-chevron">
            <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
          </div>
          
          <!-- Show dismiss button for completed actions -->
          <div v-if="completedActions.has(getUniqueActionId(action, index))" class="action-dismiss">
            <button class="dismiss-button" @click.stop="handleDismissAction(getUniqueActionId(action, index))">
              <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
            </button>
          </div>
          
          <!-- Completed details - show below the main line for completed actions -->
          <div v-if="completedActions.has(getUniqueActionId(action, index))" class="completed-details">
            <span class="action-link">{{ action.actionLink || '10083-WELDING EQUIPMENT & ACCESSORIES | Raunak Arora' }}</span>
          </div>
        </div>
        
        <!-- Expanded Action - Only for non-completed actions -->
        <ExpandedAction
          v-if="expandedActionIndex === index && !completedActions.has(getUniqueActionId(action, index))"
          :action-id="getUniqueActionId(action, index)"
          :action-link="action.actionLink || '10083-WELDING EQUIPMENT & ACCESSORIES | Raunak Arora'"
          :duration-options="durationOptions"
          @close="handleCloseExpanded"
          @duration-change="handleDurationChange"
          @open-event="handleOpenEvent"
          @done="handleDone"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExpandedAction from './ExpandedAction.vue'

interface SuggestedAction {
  id: string
  description: string
  action?: string
  actionLink?: string
}

interface DurationOption {
  value: string
  label: string
}

interface Props {
  actions: SuggestedAction[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  actionClick: [action: SuggestedAction]
  durationChange: [actionId: string, duration: string]
  openEvent: [actionId: string, duration: string]
  done: [actionId: string, duration: string]
}>()

const expandedActionIndex = ref<number | null>(null)
const completedActions = ref<Set<string>>(new Set())

// Helper function to create unique action IDs
const getUniqueActionId = (action: SuggestedAction, index: number): string => {
  return `${action.id}-${index}-${action.action || action.description.replace(/\s+/g, '-').toLowerCase()}`
}

const durationOptions: DurationOption[] = [
  { value: '15min', label: '15 minutes' },
  { value: '30min', label: '30 minutes' },
  { value: '1hour', label: 'an hour' },
  { value: 'custom', label: 'Custom' },
  { value: 'fixed', label: 'Fixed time' }
]

const handleActionClick = (action: SuggestedAction, index: number): void => {
  console.log('Action clicked:', action, 'index:', index)
  
  // Toggle expanded state - only one can be open at a time
  if (expandedActionIndex.value === index) {
    console.log('Collapsing action')
    expandedActionIndex.value = null
  } else {
    console.log('Expanding action')
    expandedActionIndex.value = index
  }
}

const handleCloseExpanded = (): void => {
  expandedActionIndex.value = null
}

const handleDurationChange = (duration: string): void => {
  const action = props.actions[expandedActionIndex.value!]
  const uniqueId = getUniqueActionId(action, expandedActionIndex.value!)
  emit('durationChange', uniqueId, duration)
}

const handleOpenEvent = (actionId: string, duration: string): void => {
  console.log('Open Event clicked:', actionId, duration)
  emit('openEvent', actionId, duration)
}

const handleDone = (actionId: string, duration: string): void => {
  console.log('Done clicked:', actionId, duration)
  // Mark this specific action as completed
  completedActions.value.add(actionId)
  // Close the expanded action after done
  expandedActionIndex.value = null
  emit('done', actionId, duration)
}

const handleDismissAction = (actionId: string): void => {
  console.log('Dismissing action:', actionId)
  // Remove from completed actions to return to normal state
  completedActions.value.delete(actionId)
}
</script>

<style scoped>
.suggested-actions-card {
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

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.action-item:hover {
  background-color: #f9fafb;
}

.action-item.has-chevron {
  padding-right: 4px;
}

.action-item.expanded {
  background-color: #dbeafe;
}

.action-content {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.action-id {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.action-bullet {
  font-size: 14px;
  color: #6b7280;
}

.action-description {
  font-size: 14px;
  color: #6b7280;
}

.action-chevron {
  flex-shrink: 0;
  margin-left: 8px;
}

/* Completed Action Styles */
.action-item.completed {
  background-color: #f3f4f6;
  border-left: 3px solid #10b981;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}

.action-item.completed .action-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.action-main {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.action-duration {
  color: #6b7280;
  font-size: 14px;
  font-weight: 400;
  align-self: flex-start;
  margin-top: 2px;
}

.action-dismiss {
  display: flex;
  align-items: center;
}

.dismiss-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.15s ease;
}

.dismiss-button:hover {
  background-color: #e5e7eb;
  color: #374151;
}

.completed-details {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.completed-details .action-link {
  color: #6b7280;
  font-size: 13px;
  font-style: italic;
}
</style>
