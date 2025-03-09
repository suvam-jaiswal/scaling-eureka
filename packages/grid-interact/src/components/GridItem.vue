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
const dragOffset = ref({ x: 0, y: 0 });
const dragPosition = ref({ x: 0, y: 0 });

// Props for widget content
interface Props {
  id: string;
  position?: { row: number; col: number };
  size?: { cols: number; rows: number };
}

const props = withDefaults(defineProps<Props>(), {
  id: '',
  position: undefined,
  size: undefined
});

// Define emits for movement and resize events
const emit = defineEmits<{
  (e: 'move', id: string, position: { row: number, col: number }): void;
  (e: 'resize', id: string, size: { cols: number, rows: number }): void;
}>();

// Computed props
const getItemSize = computed(() => {
  if (props.size && props.position) {
    return `${props.size.cols}x${props.size.rows}`;
  }
  return '';
});

// Helper function to dispatch grid events
const dispatchGridEvent = (eventName: string, detail?: any) => {
  document.dispatchEvent(new CustomEvent(eventName, { detail }));
};

// Calculate cell position from screen coordinates
const calculateGridPosition = (x: number, y: number) => {
  if (!itemRef.value) return { col: 1, row: 1 };
  
  // Get the grid container
  const gridElement = itemRef.value.closest('.p-grid');
  if (!gridElement) return { col: 1, row: 1 };
  
  const gridRect = gridElement.getBoundingClientRect();
  
  // Get grid gap and padding
  const gridStyle = window.getComputedStyle(gridElement);
  const gridGap = parseFloat(gridStyle.gap) || 20; // Default 20px if not set
  const paddingLeft = parseFloat(gridStyle.paddingLeft) || 0;
  const paddingTop = parseFloat(gridStyle.paddingTop) || 0;
  
  // Determine number of columns based on grid width
  let numColumns = 4; // Default
  if (gridRect.width < 768) {
    numColumns = 1; // Mobile
  } else if (gridRect.width >= 1600) {
    numColumns = 6; // Large screens
  }
  
  // Calculate usable grid width (excluding padding)
  const usableWidth = gridRect.width - (paddingLeft * 2);
  const cellWidth = (usableWidth - (gridGap * (numColumns - 1))) / numColumns;
  
  // For row height, we'll use the average height of existing grid items as a guide
  const gridItems = gridElement.querySelectorAll('.p-grid-item-container');
  let avgRowHeight = 100; // Fallback
  
  if (gridItems.length > 0) {
    let totalHeight = 0;
    gridItems.forEach(item => {
      totalHeight += item.getBoundingClientRect().height;
    });
    avgRowHeight = totalHeight / gridItems.length;
  }
  
  // Adjust x and y to account for padding
  const adjustedX = x - gridRect.left - paddingLeft;
  const adjustedY = y - gridRect.top - paddingTop;
  
  // Calculate column - account for gaps
  let col = 1;
  let accumulatedWidth = 0;
  
  for (let i = 0; i < numColumns; i++) {
    const nextCellWidth = cellWidth + (i < numColumns - 1 ? gridGap : 0);
    if (adjustedX <= accumulatedWidth + nextCellWidth) {
      col = i + 1;
      break;
    }
    accumulatedWidth += nextCellWidth;
  }
  
  // Calculate row - using average height and gaps
  const rowHeight = avgRowHeight + gridGap;
  const row = Math.max(1, Math.floor(adjustedY / rowHeight) + 1);
  
  return { col, row };
};

// Initialize interact drag on the drag handle
onMounted(() => {
  if (dragHandleRef.value && itemRef.value) {
    interact(dragHandleRef.value)
      .draggable({
        inertia: false,
        modifiers: [
          // Restrict movement to stay within the grid bounds
          interact.modifiers.restrict({
            restriction: '.p-grid',
            elementRect: { left: 0, right: 1, top: 0, bottom: 1 },
            endOnly: true
          })
        ],
        autoScroll: true,
        cursorChecker: () => 'grabbing', // Force grabbing cursor during drag
        listeners: {
          start: event => {
            console.log('Drag started', {
              target: event.target,
              clientX: event.client.x,
              clientY: event.client.y
            });
            
            // Get container element
            const container = itemRef.value?.closest('.p-grid-item-container');
            
            // Reset drag offset
            dragOffset.value = { x: 0, y: 0 };
            
            // Mark as dragging
            isDragging.value = true;
            
            // Instead of absolute positioning, we'll use transform which is more reliable
            if (container) {
              // Just apply styles for dragging but leave positioning alone
              container.style.zIndex = '100';
              container.style.willChange = 'transform';
              
              // Reset drag offset - we'll use it for transform
              dragOffset.value = { x: 0, y: 0 };
              
              // Add dragging class for styling
              container.classList.add('grid-item-dragging');
            }
            
            // We'll calculate initial position dynamically based on current position
            const rect = itemRef.value?.getBoundingClientRect();
            if (rect) {
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              
              // Get initial grid position
              const initialGridPos = calculateGridPosition(centerX, centerY);
              dragPosition.value = initialGridPos;
              
              // Get item size
              const itemSize = {
                cols: props.size?.cols || 1,
                rows: props.size?.rows || 1
              };
              
              // Set up initial intersection with grid cells
              dispatchGridEvent('grid:intersection', {
                bounds: {
                  colStart: initialGridPos.col,
                  rowStart: initialGridPos.row,
                  colSpan: itemSize.cols,
                  rowSpan: itemSize.rows
                }
              });
            }
            
            // Dispatch custom event to show grid cells
            dispatchGridEvent('grid:dragstart');
          },
          move: event => {
            // Track total movement - using dx/dy offsets for precise movement with the mouse
            dragOffset.value.x += event.dx;
            dragOffset.value.y += event.dy;
            
            // Get the grid item parent for drag updates
            if (itemRef.value) {
              const parent = itemRef.value.parentElement;
              
              if (parent) {
                // Always use transform for performance
                parent.style.transform = `translate3d(${dragOffset.value.x}px, ${dragOffset.value.y}px, 0)`;
                
                // Ensure dragging styles are consistently applied
                parent.style.zIndex = '100';
                parent.style.pointerEvents = 'none'; 
                parent.style.boxShadow = 'var(--shadow-lg)';
                parent.style.transition = 'none';
                
                // Keep dragging class throughout movement
                if (!parent.classList.contains('grid-item-dragging')) {
                  parent.classList.add('grid-item-dragging');
                }
                
                // Force browser reflow/repaint for immediate visual update
                // This can help ensure the element "sticks" to the cursor with no lag
                void parent.offsetHeight;
              }
            }
            
            // Use element center point to determine grid position
            const rect = event.rect || itemRef.value?.getBoundingClientRect();
            if (!rect) return;
            
            // Calculate center point of the dragged element
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Calculate grid position based on center point
            const gridPos = calculateGridPosition(centerX, centerY);
            
            // Always update the position - this improves responsiveness and fixes cases
            // where the grid might not properly update at the start of drag
            {
              
              // Update position
              dragPosition.value = gridPos;
              
              // Get item size
              const itemSize = {
                cols: props.size?.cols || 1,
                rows: props.size?.rows || 1
              };
              
              // Use requestAnimationFrame for smoother cell highlights
              // This syncs with the browser's paint cycle
              requestAnimationFrame(() => {
                // Clear previous intersection 
                dispatchGridEvent('grid:intersection', { bounds: null });
                
                // Dispatch new intersection event to highlight cells
                dispatchGridEvent('grid:intersection', {
                  bounds: {
                    colStart: gridPos.col,
                    rowStart: gridPos.row,
                    colSpan: itemSize.cols,
                    rowSpan: itemSize.rows
                  }
                });
              });
              
              // Dispatch event for grid updates
              dispatchGridEvent('grid:dragmove');
            }
          },
          end: event => {
            console.log('Drag ended', {
              target: event.target,
              clientX: event.client.x,
              clientY: event.client.y
            });
            
            isDragging.value = false;
            
            // Reset positioning and styles on parent
            if (itemRef.value) {
              const parent = itemRef.value.parentElement;
              if (parent) {
                // Use transition for smooth repositioning
                parent.style.transition = 'all 0.2s ease-out';
                
                // Reset transform and other styles
                parent.style.transform = '';
                parent.style.zIndex = '';
                parent.style.pointerEvents = '';
                parent.style.boxShadow = '';
                parent.style.willChange = '';
                
                // Remove dragging class
                parent.classList.remove('grid-item-dragging');
                
                // Remove transition after it completes
                setTimeout(() => {
                  if (parent) parent.style.transition = '';
                }, 250);
              }
            }
            
            // Clear intersection highlights
            dispatchGridEvent('grid:intersection', { bounds: null });
            
            // Emit final position for the grid to update if we have valid coordinates
            if (dragPosition.value.col > 0 && dragPosition.value.row > 0) {
              emit('move', props.id, dragPosition.value);
            }
            
            // Reset drag data
            dragOffset.value = { x: 0, y: 0 };
            
            // Dispatch custom event to hide grid cells
            dispatchGridEvent('grid:dragend');
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
          start: event => {
            console.log('Resize started', {
              target: event.target,
              rect: event.rect
            });
            // Dispatch custom event to show grid cells
            dispatchGridEvent('grid:resizestart');
          },
          move: event => {
            console.log('Resize move', {
              rect: event.rect,
              deltaRect: event.deltaRect
            });
            
            // Dispatch additional event for grid cell updates during resize
            dispatchGridEvent('grid:resizemove');
          },
          end: event => {
            console.log('Resize ended', {
              target: event.target,
              rect: event.rect
            });
            // Dispatch custom event to hide grid cells
            dispatchGridEvent('grid:resizeend');
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
    
    <!-- Invisible overlay for drag handle to make it easier to grab -->
    <div class="p-grid-item__drag-area"></div>
  </div>
</template>

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
  z-index: 10; /* Higher than normal grid items but still allows for z-index layering */
  box-shadow: var(--shadow-lg);
  opacity: 0.95;
  border-color: var(--primary-color);
  cursor: grabbing;
  will-change: transform;
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
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: all 0.15s ease-out;
  /* Improve draggability */
  touch-action: none;
  user-select: none;
  -webkit-user-drag: none;
}

.p-grid-item__drag-handle:hover, 
.p-grid-item__drag-handle:focus {
  background-color: rgba(0, 0, 0, 0.08);
  color: var(--primary-color);
  border-color: var(--primary-color);
  transform: scale(1.05);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.p-grid-item__drag-handle:active {
  cursor: grabbing !important;
  background-color: rgba(0, 0, 0, 0.12);
  transform: scale(0.98);
  box-shadow: none;
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
  background-image: linear-gradient(
    135deg, 
    transparent 40%, 
    var(--surface-border) 40%, 
    var(--surface-border) 60%, 
    transparent 60%
  );
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
  background-image: linear-gradient(
    135deg, 
    transparent 40%, 
    var(--primary-color) 40%, 
    var(--primary-color) 60%, 
    transparent 60%
  );
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

/* Drag area overlay to help with dragging */
.p-grid-item__drag-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px; /* Just cover the header area */
  cursor: grab;
  z-index: -1; /* Behind everything but still interactive */
  opacity: 0;
  background-color: transparent;
  pointer-events: none; /* Disabled by default */
}

/* Only enable the drag overlay when the handle is being hovered */
.p-grid-item__drag-handle:hover ~ .p-grid-item__drag-area,
.p-grid-item__drag-handle:focus ~ .p-grid-item__drag-area {
  pointer-events: auto;
}
</style>