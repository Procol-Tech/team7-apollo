<template>
  <div class="related-documents-card">
    <!-- Header -->
    <div class="card-header">
      <div class="header-icon">
        <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-red-500" />
      </div>
      <h3 class="header-title">RELATED DOCUMENTS</h3>
    </div>
    
    <!-- Documents List -->
    <div class="documents-list">
      <div
        v-for="(document, index) in documents"
        :key="index"
        class="document-item"
        @click.stop="handleDocumentClick(document)"
      >
        <div class="document-content">
          <span class="document-id">{{ document.id }}</span>
          <span class="document-separator">|</span>
          <span class="document-filename">{{ document.filename }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RelatedDocument {
  id: string
  filename: string
  url?: string
  type?: string
}

interface Props {
  documents: RelatedDocument[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  documentClick: [document: RelatedDocument]
}>()

const handleDocumentClick = (document: RelatedDocument): void => {
  emit('documentClick', document)
}
</script>

<style scoped>
.related-documents-card {
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

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.document-item {
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.document-item:hover {
  background-color: #f9fafb;
}

.document-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.document-id {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.document-separator {
  font-size: 14px;
  color: #9ca3af;
}

.document-filename {
  font-size: 14px;
  color: #6b7280;
}
</style>
