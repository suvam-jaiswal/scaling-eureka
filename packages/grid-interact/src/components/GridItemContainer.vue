<template>
  <div 
    class="p-card p-grid-item-container"
    :style="containerStyle"
    role="gridcell"
    :aria-colindex="colStart"
    :aria-rowindex="rowStart"
    tabindex="-1"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  colSpan?: number;
  rowSpan?: number;
  colStart?: number;
  rowStart?: number;
}

const props = withDefaults(defineProps<Props>(), {
  colSpan: 1,
  rowSpan: 1,
  colStart: undefined,
  rowStart: undefined
});

const containerStyle = computed(() => {
  const style: Record<string, string> = {
    gridColumn: `span ${props.colSpan}`,
    gridRow: `span ${props.rowSpan}`
  };

  // If specific start position is defined
  if (props.colStart !== undefined) {
    style.gridColumn = `${props.colStart} / span ${props.colSpan}`;
  }

  if (props.rowStart !== undefined) {
    style.gridRow = `${props.rowStart} / span ${props.rowSpan}`;
  }

  return style;
});
</script>

<style>
.p-grid-item-container {
  min-height: 100px;
  overflow: hidden;
  position: relative;
  transition: transform 0.115s ease-in, box-shadow 0.115s ease-in;
  padding: 0 !important;
  margin: 0 !important;
  height: 100%;
  border: 1px solid var(--surface-border);
  box-shadow: var(--shadow-sm);
}

.p-grid-item-container:hover {
  box-shadow: var(--shadow-md);
  border-color: #b0c4de;
}

.p-grid-item-container:focus-within {
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}
</style>