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
            'has-chevron': true,
            'expanded': expandedActionIndex === index
          }"
          @click.stop="handleActionClick(action, index)"
        >
          <div class="action-content">
            <span class="action-id">{{ action.id }}</span>
            <span class="action-bullet">•</span>
            <span class="action-description">{{ action.description }}</span>
          </div>
          <div class="action-chevron">
            <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
          </div>
        </div>
        
        <!-- Expanded Action -->
        <ExpandedAction
          v-if="expandedActionIndex === index"
          :action-id="action.id"
          :action-link="action.actionLink || '10083-WELDING EQUIPMENT & ACCESSORIES | Raunak Arora'"
          :duration-options="durationOptions"
          @close="handleCloseExpanded"
          @duration-change="handleDurationChange"
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
}>()

const expandedActionIndex = ref<number | null>(null)

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
  emit('durationChange', action.id, duration)
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
</style>
