<script setup lang="ts">
import { computed } from 'vue'; // Removed PropType
import type { BoardItem, BoardI18nStrings } from '../types';
// Import composables if needed directly, or use provide/inject from Board.vue
// import { useBoardAccessibility } from '../composables/useBoardAccessibility';

// --- Props ---
interface Props {
  item: BoardItem;
  style: Record<string, string | number>; // Calculated styles from Board.vue
  isDragging: boolean;
  isResizing: boolean;
  i18nStrings?: BoardI18nStrings;
  a11yProps?: Record<string, string | undefined>; // Made optional
}
const props = defineProps<Props>();

// --- Emits ---
// Emit events for pointerdown on specific handles to be caught by Board.vue
// Use kebab-case for emitted event names
const emit = defineEmits<{
  (e: 'pointerdown-drag', event: PointerEvent): void; // Reverted event name
  (e: 'pointerdown-resize', direction: string, event: PointerEvent): void; // Reverted event name
  // Internal events for utils, handled by Board.vue listening to slot content interaction
  // (e: 'dismiss'): void; // Not emitted directly by BoardItem
  // (e: 'trigger-resize'): void; // Not emitted directly by BoardItem
}>();

// --- Composables (Example if needed directly) ---
// const { getDragHandleProps, getResizeHandleProps } = useBoardAccessibility(...)

// --- Computed ---
const itemClasses = computed(() => ({
  'vue-board__item': true,
  'vue-board__item--dragging': props.isDragging,
  'vue-board__item--resizing': props.isResizing,
}));

// --- Event Handlers ---
function onPointerDownDrag(event: PointerEvent) {
  // Prevent triggering on interactive elements within the handle if necessary
  emit('pointerdown-drag', event); // Emit with kebab-case
}

function onPointerDownResizeSE(event: PointerEvent) {
  emit('pointerdown-resize', 'se', event); // Emit with kebab-case
}
// Add handlers for other resize directions if implemented

</script>

<template>
  <div :class="itemClasses" :style="style"> <!-- Removed v-bind="a11yProps || {}" -->
    <!-- Optional Header -->
    <div class="vue-board__item-header">
      <!-- Drag Handle Example -->
      <button
        type="button"
        class="vue-board__drag-handle"
        @pointerdown.prevent="onPointerDownDrag"
        v-bind="{ /* TODO: Get drag handle ARIA props from a11y composable */ }"
      >
        <!-- Drag icon (e.g., SVG) -->
        &#x2630; <!-- Example: Trigram for Heaven -->
      </button>
      <!-- Slot for header content? -->
    </div>

    <!-- Main Content Area -->
    <div class="vue-board__item-content">
      <slot></slot> <!-- Renders content passed from Board.vue #item slot -->
    </div>

    <!-- Optional Footer -->
    <!-- <div class="vue-board__item-footer"> ... </div> -->

    <!-- Resize Handles -->
    <button
      type="button"
      class="vue-board__resize-handle vue-board__resize-handle--se"
      @pointerdown.prevent="onPointerDownResizeSE"
      aria-label="Resize SE"

    >
      <!-- Handle visual indicator -->
    </button>
    <!-- Add other resize handles (sw, ne, nw) if needed -->

  </div>
</template>

<style scoped>
/* Import base styles if needed, or rely on Board.vue import */
/* @import '../styles/variables.css'; */
/* @import '../styles/board.css'; */

.vue-board__item {
  /* Styles already defined in board.css */
  /* Add any item-specific layout/styles here */
  display: flex;
  flex-direction: column;
}

.vue-board__item-header {
  /* Example header styling */
  padding: 4px 8px;
  background-color: #f0f0f0; /* Example */
  border-bottom: 1px solid var(--vue-board-item-border-color, #e0e0e0);
  flex-shrink: 0;
  /* Ensure drag handle is easily clickable */
}

.vue-board__item-content {
  padding: var(--vue-board-gap, 10px);
  flex-grow: 1;
  overflow: auto; /* Allow content scrolling if needed */
}

/* Scoped styles for resize handles if not fully covered by global board.css */
.vue-board__resize-handle {
  /* Styles defined in board.css */
  /* Add specific overrides if needed */
}
</style>
