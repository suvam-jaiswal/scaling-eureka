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

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.app {
  min-height: 100vh;
  background-color: var(--surface-ground);
  display: flex;
  flex-direction: column;
}
</style>