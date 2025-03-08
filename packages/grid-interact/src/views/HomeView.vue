<template>
  <div class="home">
    <h1>Interactive Grid</h1>
    <p>A Vue 3 + TypeScript + InteractJS demo</p>
    
    <div class="grid-container">
      <GridItem 
        v-for="(item, index) in gridItems" 
        :key="index" 
        :item="item"
        @update="updateGridItem" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import GridItem from '@/components/GridItem.vue'
import { useGridStore, type GridItem as GridItemType } from '@/stores/grid'

const gridStore = useGridStore()
const gridItems = gridStore.items

function updateGridItem(id: number, updates: Partial<Omit<GridItemType, 'id'>>) {
  gridStore.updateItem(id, updates)
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.grid-container {
  position: relative;
  min-height: 500px;
  border: 1px solid #eee;
  margin-top: 2rem;
}
</style>