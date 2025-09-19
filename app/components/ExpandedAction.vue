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
}>()

const selectedDuration = ref('')

const handleDurationChange = (): void => {
  emit('durationChange', selectedDuration.value)
}

const handleClose = (): void => {
  emit('close')
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
</style>
