<template>
  <div class="home">
    <div class="p-card mb-3 p-3">
      <div class="flex justify-content-between align-items-center">
        <div class="font-bold text-xl">Interactive Grid Dashboard</div>
        <button 
          class="p-button p-button-secondary p-button-sm"
          @click="resetDashboard"
        >
          <i class="pi pi-refresh mr-1"></i>
          Reset Layout
        </button>
      </div>
    </div>
    
    <main class="dashboard">
      <div class="p-card mb-3 p-3">
        <div class="flex align-items-center mb-3">
          <i class="pi pi-info-circle mr-2 text-primary"></i>
          <span>Drag and drop grid items to rearrange them. Use the resize handle in the bottom right corner to resize items.</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <div class="p-tag p-tag-info">Responsive Layout</div>
          <div class="p-tag p-tag-success">Drag & Drop</div>
          <div class="p-tag p-tag-warning">Resizable Widgets</div>
          <div class="p-tag p-tag-info">Local Storage</div>
        </div>
      </div>
      
      <Grid>
        <GridItemContainer 
          v-for="item in gridItems"
          :key="item.id"
          :colSpan="item.colSpan"
          :rowSpan="item.rowSpan"
          :colStart="item.colStart"
          :rowStart="item.rowStart"
        >
          <GridItem>
            <template #header>{{ item.content }}</template>
            <div class="item-content">
              <p>{{ item.content }} widget content</p>
              <div class="p-tag p-tag-info mb-2">
                {{ item.colSpan }}x{{ item.rowSpan }} grid cells
              </div>
              <div class="flex align-items-center text-sm text-color-secondary">
                <i class="pi pi-map-marker mr-1"></i>
                <span>Position: ({{ item.colStart }}, {{ item.rowStart }})</span>
              </div>
            </div>
          </GridItem>
        </GridItemContainer>
      </Grid>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useGridStore } from '../stores/grid';
import Grid from '../components/Grid.vue';
import GridItemContainer from '../components/GridItemContainer.vue';
import GridItem from '../components/GridItem.vue';
import { storeToRefs } from 'pinia';

// Initialize grid store
const gridStore = useGridStore();
const { items: gridItems } = storeToRefs(gridStore);

// Reset dashboard to default layout
const resetDashboard = () => {
  gridStore.resetLayout();
  console.log('Dashboard layout has been reset to default');
};
</script>

<style>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard {
  position: relative;
}

.item-content {
  font-size: 14px;
}
</style>