<template>
  <div 
    class="p-grid"
    :class="{ 'p-grid--mobile': isMobile }"
    role="grid"
    aria-label="Interactive dashboard grid"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// Responsive breakpoints
const MOBILE_BREAKPOINT = 768; // in px

const isMobile = ref(false);

// Function to check if screen is mobile size
const checkMobile = () => {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
};

// Set up event listeners for responsive behavior
onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

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
</style>