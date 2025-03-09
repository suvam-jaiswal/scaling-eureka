<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Responsive breakpoints
const MOBILE_BREAKPOINT = 768; // in px
const LARGE_SCREEN_BREAKPOINT = 1600; // in px

const isMobile = ref(false);
const isDraggingOrResizing = ref(false);
const gridRef = ref<HTMLElement | null>(null);

// Grid dimensions based on screen size
const gridColumns = computed(() => {
  if (isMobile.value) return 1;
  if (window.innerWidth >= LARGE_SCREEN_BREAKPOINT) return 6;
  return 4;
});

const gridRows = ref(20); // Arbitrary number of rows to cover potential layout

// Track which cells are currently intersecting with a dragged item
const intersectingCells = ref<Set<string>>(new Set());

// Create grid cells for visualization
const gridCells = computed(() => {
  const cells = [];
  
  // Build a map of occupied cells
  const occupiedCells = new Map();
  
  // Get all grid items from the slot
  if (gridRef.value) {
    const gridItemContainers = gridRef.value.querySelectorAll('.p-grid-item-container');
    
    gridItemContainers.forEach(container => {
      // Get grid position from style or dataset
      const colStart = parseInt(container.style.gridColumnStart) || parseInt(container.getAttribute('aria-colindex'));
      const rowStart = parseInt(container.style.gridRowStart) || parseInt(container.getAttribute('aria-rowindex'));
      
      // Get spans - we need to parse from the gridColumn/gridRow style which is like "2 / span 3"
      const colSpanMatch = container.style.gridColumn?.match(/span\s+(\d+)/) || ['', '1'];
      const rowSpanMatch = container.style.gridRow?.match(/span\s+(\d+)/) || ['', '1'];
      
      const colSpan = parseInt(colSpanMatch[1]) || 1;
      const rowSpan = parseInt(rowSpanMatch[1]) || 1;
      
      // Mark all cells covered by this item as occupied
      if (colStart && rowStart) {
        for (let r = rowStart; r < rowStart + rowSpan; r++) {
          for (let c = colStart; c < colStart + colSpan; c++) {
            occupiedCells.set(`${r}-${c}`, true);
          }
        }
      }
    });
  }
  
  // Create all cells
  for (let row = 1; row <= gridRows.value; row++) {
    for (let col = 1; col <= gridColumns.value; col++) {
      cells.push({ 
        id: `cell-${row}-${col}`, 
        row, 
        col,
        isOccupied: occupiedCells.has(`${row}-${col}`)
      });
    }
  }
  
  return cells;
});

// Function to check if screen is mobile size
const checkMobile = () => {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
};

// Setup custom event listeners for drag/resize state
const handleDragStart = () => {
  isDraggingOrResizing.value = true;
};

const handleDragEnd = () => {
  isDraggingOrResizing.value = false;
};

const handleResizeStart = () => {
  isDraggingOrResizing.value = true;
};

const handleResizeEnd = () => {
  isDraggingOrResizing.value = false;
};

// Force grid cells to update
const updateGridCells = () => {
  // Force reactivity refresh for gridCells computed property
  gridRows.value = gridRows.value + 0; // Trigger reactivity without changing the value
};

// Method to calculate which cells intersect with a dragged element
const updateIntersectingCells = (itemBounds: {
  colStart: number;
  rowStart: number;
  colSpan: number;
  rowSpan: number;
} | null) => {
  // Clear previous intersections
  intersectingCells.value.clear();
  
  // If no bounds provided (typically when drag ends), just clear
  if (!itemBounds) return;
  
  const { colStart, rowStart, colSpan, rowSpan } = itemBounds;
  
  // Add cells that intersect with the dragged item
  for (let row = rowStart; row < rowStart + rowSpan; row++) {
    for (let col = colStart; col < colStart + colSpan; col++) {
      const cellId = `cell-${row}-${col}`;
      intersectingCells.value.add(cellId);
    }
  }
  
  // Force update for better reactivity
  intersectingCells.value = new Set(intersectingCells.value);
};

// Method to clear intersecting cells
const clearIntersectingCells = () => {
  intersectingCells.value.clear();
};

// Set up MutationObserver to watch for changes in grid items
let observer: MutationObserver | null = null;

// Set up event listeners for responsive behavior
onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  // Add custom event listeners for drag/resize state
  document.addEventListener('grid:dragstart', handleDragStart);
  document.addEventListener('grid:dragend', e => {
    handleDragEnd();
    clearIntersectingCells();
  });
  document.addEventListener('grid:dragmove', updateGridCells);
  document.addEventListener('grid:resizestart', handleResizeStart);
  document.addEventListener('grid:resizeend', e => {
    handleResizeEnd();
    clearIntersectingCells();
  });
  document.addEventListener('grid:resizemove', updateGridCells);
  
  // Listen for cell intersection events
  document.addEventListener('grid:intersection', (e: CustomEvent) => {
    if (e.detail && e.detail.bounds) {
      updateIntersectingCells(e.detail.bounds);
    }
  });
  
  // Set up MutationObserver to watch for changes in grid layout
  if (gridRef.value) {
    observer = new MutationObserver(mutations => {
      // Only update if attributes or child nodes have changed
      const shouldUpdate = mutations.some(mutation => 
        mutation.type === 'attributes' || 
        mutation.type === 'childList'
      );
      
      if (shouldUpdate) {
        updateGridCells();
      }
    });
    
    // Watch for changes in the grid and its children
    observer.observe(gridRef.value, { 
      attributes: true, 
      childList: true, 
      subtree: true,
      attributeFilter: ['style', 'class', 'aria-colindex', 'aria-rowindex'] 
    });
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  
  // Remove custom event listeners
  document.removeEventListener('grid:dragstart', handleDragStart);
  document.removeEventListener('grid:dragend', handleDragEnd);
  document.removeEventListener('grid:dragmove', updateGridCells);
  document.removeEventListener('grid:resizestart', handleResizeStart);
  document.removeEventListener('grid:resizeend', handleResizeEnd);
  document.removeEventListener('grid:resizemove', updateGridCells);
  document.removeEventListener('grid:intersection', (e: CustomEvent) => {});
  
  // Disconnect observer
  if (observer) {
    observer.disconnect();
  }
});
</script>

<template>
  <div 
    class="p-grid"
    :class="{ 'p-grid--mobile': isMobile }"
    role="grid"
    aria-label="Interactive dashboard grid"
    ref="gridRef"
  >
    <!-- Grid cells visualization -->
    <div 
      v-for="cell in gridCells" 
      :key="cell.id" 
      class="p-grid-cell"
      :class="{ 
        'p-grid-cell--visible': isDraggingOrResizing,
        'p-grid-cell--intersecting': intersectingCells.has(cell.id)
      }"
      :style="{ 
        gridColumn: `${cell.col} / span 1`, 
        gridRow: `${cell.row} / span 1` 
      }"
    ></div>
    
    <slot></slot>
  </div>
</template>

<style>
.p-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  width: 100%;
  position: relative;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: var(--border-radius);
  border: 1px solid var(--surface-border);
}

/* Responsive styles */
.p-grid--mobile {
  grid-template-columns: 1fr;
}

/* On larger screens, potentially go up to 6 columns */
@media (min-width: 1600px) {
  .p-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* Grid cell visualization */
.p-grid-cell {
  border: 1px dashed rgba(180, 180, 220, 0.5);
  background-color: rgba(220, 220, 240, 0.15);
  border-radius: 4px;
  opacity: 0;
  transition: all 0.15s ease-in-out;
  z-index: 0;
  pointer-events: none;
  min-height: 100px;
}

.p-grid-cell--visible {
  opacity: 0.8;
}

/* Styling for cells intersecting with dragged item */
.p-grid-cell--intersecting {
  border-color: rgba(50, 100, 255, 0.8) !important;
  background-color: rgba(100, 150, 255, 0.4) !important;
  opacity: 1 !important;
  z-index: 1; /* Above other cells but below grid items */
  transition: all 0.05s ease-out !important; /* Faster transition for responsive feel */
  box-shadow: inset 0 0 0 1px rgba(80, 140, 255, 0.5) !important;
}
</style>