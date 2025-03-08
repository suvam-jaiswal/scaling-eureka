<template>
  <div class="app">
    <router-view />
  </div>
</template>

<style>
/* Global styles */
:root {
  --grid-gap: 16px;
  --transition-duration: 115ms;
}

* {
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  background-color: var(--surface-ground);
}
</style>