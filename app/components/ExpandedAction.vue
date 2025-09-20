<template>
  <div class="expanded-action">
    <!-- Header with close button -->
    <div class="expanded-header">
      <div class="expanded-content">
        <div class="action-link" @click.stop>
          {{ actionLink }}
        </div>
        <div class="duration-label">Select Duration</div>
        
        <!-- Radio button options -->
        <div class="radio-options">
          <label v-for="option in durationOptions" :key="option.value" class="radio-option" @click.stop>
            <input
              type="radio"
              :name="`duration-${actionId}`"
              :value="option.value"
              v-model="selectedDuration"
              @change="handleDurationChange"
              @click.stop
            />
            <span class="radio-label">{{ option.label }}</span>
          </label>
        </div>
        
        <!-- Action Buttons - Only show when duration is selected -->
        <div v-if="selectedDuration" class="action-buttons">
          <!-- Custom duration input - only show when Custom is selected -->
          <div v-if="selectedDuration === 'custom'" class="custom-duration-input">
            <label class="duration-label">
              Enter event duration <span class="required-asterisk">*</span>:
            </label>
            <div class="duration-input-container">
              <input
                v-model="customDurationValue"
                type="number"
                class="duration-number-input"
                placeholder="60"
                @click.stop
              />
              <select
                v-model="customDurationUnit"
                class="duration-unit-select"
                @click.stop
              >
                <option value="minutes">Min(s)</option>
                <option value="hours">Hour(s)</option>
                <option value="days">Days(s)</option>
              </select>
            </div>
          </div>
          
          <div class="buttons-container">
            <button class="open-event-button" @click.stop="handleOpenEvent">
              Open Event
            </button>
            <button class="done-button" @click.stop="handleDone">
              Done
            </button>
          </div>
        </div>
      </div>
      
      <!-- Close button -->
      <button class="close-button" @click.stop="handleClose">
        <UIcon name="i-heroicons-x-mark" class="close-icon" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DurationOption {
  value: string
  label: string
}

interface Props {
  actionId: string
  actionLink: string
  durationOptions: DurationOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  durationChange: [duration: string]
  openEvent: [actionId: string, duration: string]
  done: [actionId: string, duration: string]
}>()

const selectedDuration = ref('')
const customDurationValue = ref(60)
const customDurationUnit = ref('minutes')

const handleDurationChange = (): void => {
  emit('durationChange', selectedDuration.value)
}

const handleClose = (): void => {
  emit('close')
}

const handleOpenEvent = (): void => {
  const duration = selectedDuration.value === 'custom' 
    ? `${customDurationValue.value} ${customDurationUnit.value}`
    : selectedDuration.value
  emit('openEvent', props.actionId, duration)
}

const handleDone = (): void => {
  const duration = selectedDuration.value === 'custom' 
    ? `${customDurationValue.value} ${customDurationUnit.value}`
    : selectedDuration.value
  emit('done', props.actionId, duration)
}
</script>

<style scoped>
.expanded-action {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-top: 8px;
  overflow: hidden;
}

.expanded-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
}

.expanded-content {
  flex: 1;
}

.action-link {
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  cursor: pointer;
  text-decoration: underline;
}

.action-link:hover {
  color: #2563eb;
}

.duration-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.radio-options {
  display: flex;
  flex-direction: row;
  gap: 6px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-option input[type="radio"] {
  margin: 0;
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
}

.radio-label {
  font-size: 14px;
  color: #374151;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.15s ease;
  margin-left: 12px;
}

.close-button:hover {
  background-color: #f3f4f6;
}

.close-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  margin-top: 16px;
}

.custom-duration-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.custom-duration-input .duration-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.required-asterisk {
  color: #ef4444;
}

.duration-input-container {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
  background: white;
}

.duration-number-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 4px 8px;
  font-size: 14px;
  color: #374151;
  background: transparent;
}

.duration-number-input::placeholder {
  color: #9ca3af;
}

.duration-unit-select {
  border: none;
  outline: none;
  padding: 4px 8px;
  font-size: 14px;
  color: #374151;
  background: transparent;
  border-left: 1px solid #d1d5db;
  cursor: pointer;
}

.buttons-container {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.open-event-button {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.open-event-button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.done-button {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.done-button:hover {
  background: #2563eb;
  border-color: #2563eb;
}
</style>
