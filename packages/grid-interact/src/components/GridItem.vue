<template>
  <div 
    class="p-grid-item"
    :class="{ 'p-grid-item--dragging': isDragging }"
    ref="itemRef"
  >
    <div class="p-grid-item__header">
      <div class="p-grid-item__drag-handle" ref="dragHandleRef">
        <i class="pi pi-bars"></i>
      </div>
      <div class="p-grid-item__title">
        <slot name="header">Widget</slot>
      </div>
      <div class="p-grid-item__actions">
        <button 
          class="p-button p-button-text p-button-rounded p-button-sm"
          aria-label="Settings"
        >
          <i class="pi pi-cog"></i>
        </button>
      </div>
    </div>
    <hr class="p-divider m-0" />
    <div class="p-grid-item__content">
      <slot>
        <div class="p-grid-item__placeholder">
          <i class="pi pi-box mb-2" style="font-size: 1.5rem"></i>
          <span>Widget Content</span>
        </div>
      </slot>
    </div>
    <div class="p-grid-item__resize-handle" ref="resizeHandleRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Component state
const itemRef = ref<HTMLElement | null>(null);
const dragHandleRef = ref<HTMLElement | null>(null);
const resizeHandleRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);

// Define emits
const emit = defineEmits<{
  (e: 'move', position: { x: number, y: number }): void;
  (e: 'resize', size: { width: number, height: number }): void;
}>();

// Props and logic will be extended once we add interactjs
</script>

<style>
.p-grid-item {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--surface-card);
  border-radius: var(--border-radius);
  overflow: hidden;
  border: 1px solid var(--surface-border);
}

.p-grid-item--dragging {
  z-index: 100;
  box-shadow: var(--shadow-lg);
  opacity: 0.95;
  border-color: var(--primary-color);
}

.p-grid-item__header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--surface-section);
  cursor: move;
  border-bottom: 1px solid var(--surface-border);
}

.p-grid-item__drag-handle {
  margin-right: 0.5rem;
  color: var(--text-color-secondary);
  cursor: grab;
  background-color: rgba(0, 0, 0, 0.03);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.p-grid-item__drag-handle:hover {
  background-color: rgba(0, 0, 0, 0.06);
}

.p-grid-item__drag-handle:active {
  cursor: grabbing;
  background-color: rgba(0, 0, 0, 0.08);
}

.p-grid-item__title {
  flex: 1;
  font-weight: 600;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-color);
}

.p-grid-item__actions {
  display: flex;
  align-items: center;
}

.p-grid-item__content {
  flex: 1;
  padding: 1rem;
  overflow: auto;
  background-color: white;
}

.p-grid-item__placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
  text-align: center;
  padding: 2rem;
  border: 1px dashed #ddd;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.01);
}

.p-grid-item__resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background-image: linear-gradient(135deg, transparent 40%, var(--surface-border) 40%, var(--surface-border) 60%, transparent 60%);
  background-size: 14px 14px;
  background-repeat: no-repeat;
  background-position: right bottom;
  cursor: se-resize;
  z-index: 10;
  opacity: 0.8;
}

.p-grid-item__resize-handle:hover {
  opacity: 1;
  background-image: linear-gradient(135deg, transparent 40%, var(--primary-color) 40%, var(--primary-color) 60%, transparent 60%);
}

.p-divider {
  border: 0;
  border-top: 1px solid var(--surface-border);
  margin: 0;
}
</style>