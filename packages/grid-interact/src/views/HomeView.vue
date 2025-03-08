<template>
  <div class="home">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <header class="home-header">
      <div class="container-full">
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
    </header>
    
    <main id="main-content" class="home-content">
      <div class="container-full">
        <div class="dashboard">
          <Grid>
            <GridItemContainer 
              v-for="item in gridItems"
              :key="item.id"
              :colSpan="item.colSpan"
              :rowSpan="item.rowSpan"
              :colStart="item.colStart"
              :rowStart="item.rowStart"
            >
              <GridItem
                :position="{ row: item.rowStart, col: item.colStart }"
                :size="{ cols: item.colSpan, rows: item.rowSpan }"
              >
                <template #header>{{ item.content }}</template>
                <div class="item-content">
                  <template v-if="item.content === 'Weather Widget'">
                    <div class="weather-widget">
                      <i class="pi pi-cloud text-primary" style="font-size: 2rem;"></i>
                      <div class="weather-info">
                        <div class="temperature">72°F</div>
                        <div class="location">San Francisco, CA</div>
                      </div>
                    </div>
                  </template>
                  
                  <template v-else-if="item.content === 'Quick Tasks'">
                    <ul class="task-list">
                      <li><i class="pi pi-check-circle mr-2"></i> Complete task 1</li>
                      <li><i class="pi pi-check-circle mr-2"></i> Review PR</li>
                      <li><i class="pi pi-check-circle mr-2"></i> Meeting at 2pm</li>
                    </ul>
                  </template>
                  
                  <template v-else>
                    <div class="widget-content">
                      <div class="mb-2">{{ item.content }} Content</div>
                      <div class="text-sm text-color-secondary">
                        {{ item.colSpan }}x{{ item.rowSpan }} grid units
                      </div>
                      <div class="text-sm text-color-secondary">
                        Position: ({{ item.colStart }}, {{ item.rowStart }})
                      </div>
                    </div>
                  </template>
                </div>
              </GridItem>
            </GridItemContainer>
          </Grid>
        </div>
      </div>
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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container-full {
  width: 100%;
  padding: 0 16px;
}

.home-header {
  background-color: white;
  border-bottom: 1px solid var(--surface-border);
  padding: 16px 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.home-content {
  flex: 1;
  padding: 24px 0 40px 0;
}

.dashboard {
  position: relative;
}

.item-content {
  font-size: 14px;
}

/* Widget styles */
.weather-widget {
  display: flex;
  align-items: center;
  padding: 0.5rem;
}

.weather-info {
  margin-left: 1rem;
}

.temperature {
  font-size: 1.5rem;
  font-weight: bold;
}

.location {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.task-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.task-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.task-list li:last-child {
  border-bottom: none;
}

.widget-content {
  padding: 0.5rem;
}

/* Accessibility - Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary-color);
  color: white;
  padding: 8px;
  z-index: 2000;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 0;
}

@media (max-width: 768px) {
  .home-header {
    padding: 12px 0;
  }
  
  .home-content {
    padding: 16px 0 24px 0;
  }
}
</style>