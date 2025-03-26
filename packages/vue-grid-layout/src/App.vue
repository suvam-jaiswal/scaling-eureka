<script setup lang="ts">
import { ref } from 'vue';
import { Board } from './main'; // Import from our library entry point
import type { BoardItem, ItemsChangeDetail } from './types';

// Sample initial layout data
const initialItems: BoardItem[] = [
  { id: 'item-1', definition: { columnOffset: 0, rowOffset: 0, columnSpan: 4, rowSpan: 2 }, data: { title: 'Widget A' } },
  { id: 'item-2', definition: { columnOffset: 4, rowOffset: 0, columnSpan: 4, rowSpan: 4 }, data: { title: 'Widget B' } },
  { id: 'item-3', definition: { columnOffset: 8, rowOffset: 0, columnSpan: 4, rowSpan: 2 }, data: { title: 'Widget C' } },
  { id: 'item-4', definition: { columnOffset: 0, rowOffset: 2, columnSpan: 4, rowSpan: 2 }, data: { title: 'Widget D' } },
];

const boardItems = ref<BoardItem[]>(initialItems);

// Handler for the controlled component pattern
function handleItemsChange(event: ItemsChangeDetail) {
  console.log('Board items changed:', event.items);
  // In a real app, you might validate or process items before updating state
  boardItems.value = event.items;
}

function handleDismiss(detail: { itemId: string }) {
  console.log('Dismiss requested:', detail.itemId);
  boardItems.value = boardItems.value.filter(item => item.id !== detail.itemId);
}

function handleTriggerResize(detail: { itemId: string }) {
    console.log('Trigger resize requested:', detail.itemId);
    // Handle potential content resize logic if needed
}

</script>

<template>
  <h1>Vue Cloudscape Board Example</h1>
  <div class="board-container">
    <Board
      :items="boardItems"
      @items-change="handleItemsChange"
      @dismiss-item="handleDismiss"
      @trigger-resize="handleTriggerResize"
    >
      <template #item="{ item, utils }">
        <div class="widget-content">
          <h2>{{ item.data?.title || item.id }}</h2>
          <p>Content for {{ item.id }}</p>
          <p><small>Pos: ({{ item.definition.columnOffset }}, {{ item.definition.rowOffset }}) Size: {{ item.definition.columnSpan }}x{{ item.definition.rowSpan }}</small></p>
          <button @click="utils.dismiss" style="margin-top: 10px;">Dismiss</button>
        </div>
      </template>
      <template #empty>
        <p>Board is empty.</p>
      </template>
    </Board>
  </div>
</template>

<style>
/* Basic styling for the example */
body {
  font-family: sans-serif;
  padding: 20px;
}
.board-container {
  border: 1px solid #ccc;
  margin-top: 20px;
  height: 500px; /* Give the board container a defined height */
  position: relative; /* Needed for absolute positioning of items */
}
.widget-content {
  padding: 10px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-size: 0.9em;
}
.widget-content h2 {
    margin: 0 0 5px 0;
    font-size: 1.1em;
}
</style>
