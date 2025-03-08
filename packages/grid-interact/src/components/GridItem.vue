<template>
  <div 
    ref="itemRef"
    class="p-grid-item"
    :class="{ 'p-grid-item--dragging': isDragging }"
    tabindex="-1"
  >
    <div class="p-grid-item__header">
      <button 
        ref="dragHandleRef" 
        class="p-grid-item__drag-handle"
        tabindex="0"
        aria-label="Drag to move widget"
        title="Drag to move widget"
        @keydown.space.prevent="handleDragKeyDown"
        @keydown.enter.prevent="handleDragKeyDown"
      >
        <i class="pi pi-arrows-alt"></i>
      </button>
      <div class="p-grid-item__title">
        <slot name="header">
          Widget
        </slot>
      </div>
      <div class="p-grid-item__actions">
        <button 
          class="p-button p-button-text p-button-rounded p-button-sm"
          aria-label="Widget settings"
          title="Widget settings"
          tabindex="0"
        >
          <i class="pi pi-cog"></i>
        </button>
      </div>
    </div>
    <hr class="p-divider m-0" />
    <div
      class="p-grid-item__content"
      tabindex="-1"
    >
      <slot>
        <div class="p-grid-item__placeholder">
          <i
            class="pi pi-box mb-2"
            style="font-size: 1.5rem"
          ></i>
          <span>Widget Content</span>
        </div>
      </slot>
    </div>
    <button 
      ref="resizeHandleRef" 
      class="p-grid-item__resize-handle"
      tabindex="0"
      aria-label="Resize widget"
      title="Resize widget"
      @keydown.space.prevent="handleResizeKeyDown"
      @keydown.enter.prevent="handleResizeKeyDown"
    ></button>
    
    <!-- Badge to show position and size -->
    <div class="p-grid-item__badge">
      {{ getItemSize }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import interact from 'interactjs';

// Enable debug mode for interact
interact.debug(true);

// Component state
const itemRef = ref<HTMLElement | null>(null);
const dragHandleRef = ref<HTMLElement | null>(null);
const resizeHandleRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);

// Props for widget content
interface Props {
  position?: { row: number; col: number };
  size?: { cols: number; rows: number };
}

const props = withDefaults(defineProps<Props>(), {
  position: undefined,
  size: undefined
});

// Define emits - will be used when we implement actual movement
defineEmits<{
  (e: 'move', position: { x: number, y: number }): void;
  (e: 'resize', size: { width: number, height: number }): void;
}>();

// Computed props
const getItemSize = computed(() => {
  if (props.size && props.position) {
    return `${props.size.cols}x${props.size.rows}`;
  }
  return '';
});

// Initialize interact drag on the drag handle
onMounted(() => {
  if (dragHandleRef.value && itemRef.value) {
    interact(dragHandleRef.value)
      .draggable({
        inertia: false,
        modifiers: [],
        autoScroll: true,
        listeners: {
          start: (event) => {
            console.log('Drag started', {
              target: event.target,
              clientX: event.client.x,
              clientY: event.client.y
            });
            isDragging.value = true;
          },
          move: (event) => {
            console.log('Drag move', {
              dx: event.dx,
              dy: event.dy,
              clientX: event.client.x,
              clientY: event.client.y
            });
          },
          end: (event) => {
            console.log('Drag ended', {
              target: event.target,
              clientX: event.client.x,
              clientY: event.client.y
            });
            isDragging.value = false;
          }
        }
      });
  }

  if (resizeHandleRef.value && itemRef.value) {
    // Make the item resizable, but restrict to only using the handle
    interact(itemRef.value)
      .resizable({
        // Enable resizing on bottom right corner
        edges: { bottom: true, right: true },
        
        // VERY IMPORTANT: Only allow resizing when starting from the handle
        allowFrom: '.p-grid-item__resize-handle',
        
        inertia: false,
        modifiers: [],
        listeners: {
          start: (event) => {
            console.log('Resize started', {
              target: event.target,
              rect: event.rect
            });
          },
          move: (event) => {
            console.log('Resize move', {
              rect: event.rect,
              deltaRect: event.deltaRect
            });
          },
          end: (event) => {
            console.log('Resize ended', {
              target: event.target,
              rect: event.rect
            });
          }
        }
      });
  }
});

// Clean up interact instances
onUnmounted(() => {
  if (dragHandleRef.value) {
    interact(dragHandleRef.value).unset();
  }
  if (itemRef.value) {
    interact(itemRef.value).unset();
  }
});

// Keyboard handlers
const handleDragKeyDown = (event: KeyboardEvent) => {
  console.log('Drag handle key down:', event.key);
};

const handleResizeKeyDown = (event: KeyboardEvent) => {
  console.log('Resize handle key down:', event.key);
};

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
  outline: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.p-grid-item:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
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
  border-bottom: 1px solid var(--surface-border);
}

.p-grid-item__drag-handle {
  margin-right: 0.5rem;
  color: var(--text-color-secondary);
  cursor: grab;
  background-color: rgba(0, 0, 0, 0.03);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.p-grid-item__drag-handle:hover, 
.p-grid-item__drag-handle:focus {
  background-color: rgba(0, 0, 0, 0.06);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.p-grid-item__drag-handle:active {
  cursor: grabbing;
  background-color: rgba(0, 0, 0, 0.08);
}

.p-grid-item__drag-handle:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.p-grid-item__title {
  flex: 1;
  font-weight: 600;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-color);
  cursor: default;
  user-select: none;
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
  outline: none;
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
  user-select: none;
}

.p-grid-item__resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background-image: linear-gradient(135deg, transparent 40%, var(--surface-border) 40%, var(--surface-border) 60%, transparent 60%);
  background-size: 14px 14px;
  background-repeat: no-repeat;
  background-position: right bottom;
  cursor: se-resize;
  z-index: 10;
  opacity: 0.8;
  padding: 0;
  border: none;
  background-color: transparent;
  transition: opacity 0.2s;
}

.p-grid-item__resize-handle:hover,
.p-grid-item__resize-handle:focus {
  opacity: 1;
  background-image: linear-gradient(135deg, transparent 40%, var(--primary-color) 40%, var(--primary-color) 60%, transparent 60%);
}

.p-grid-item__resize-handle:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.p-grid-item__badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-color-secondary);
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  user-select: none;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.p-grid-item:hover .p-grid-item__badge {
  opacity: 0.7;
}

.p-divider {
  border: 0;
  border-top: 1px solid var(--surface-border);
  margin: 0;
}
</style>