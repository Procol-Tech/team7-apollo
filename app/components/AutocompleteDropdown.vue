<template>
  <div class="autocomplete-dropdown" @click.stop>
    <!-- Suggested Actions Card -->
    <SuggestedActionsCard
      :actions="suggestedActions"
      @action-click="handleActionClick"
      @duration-change="handleDurationChange"
    />
    
    <!-- Separator -->
    <div class="separator"></div>
    
    <!-- Related Documents Card -->
    <RelatedDocumentsCard
      :documents="relatedDocuments"
      @document-click="handleDocumentClick"
    />
  </div>
</template>

<script setup lang="ts">
import SuggestedActionsCard from './SuggestedActionsCard.vue'
import RelatedDocumentsCard from './RelatedDocumentsCard.vue'

interface SuggestedAction {
  id: string
  description: string
  hasChevron?: boolean
  action?: string
}

interface RelatedDocument {
  id: string
  filename: string
  url?: string
  type?: string
}

interface Props {
  suggestedActions: SuggestedAction[]
  relatedDocuments: RelatedDocument[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  actionClick: [action: SuggestedAction]
  documentClick: [document: RelatedDocument]
  durationChange: [actionId: string, duration: string]
}>()

const handleActionClick = (action: SuggestedAction): void => {
  emit('actionClick', action)
}

const handleDocumentClick = (document: RelatedDocument): void => {
  emit('documentClick', document)
}

const handleDurationChange = (actionId: string, duration: string): void => {
  emit('durationChange', actionId, duration)
}
</script>

<style scoped>


.separator {
  border-top: 1px solid #e5e7eb;
  margin: 16px 0;
}
</style>
