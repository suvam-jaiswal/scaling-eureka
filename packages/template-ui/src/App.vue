<template>
  <header>
    <nav>
      <router-link to="/">
        Home
      </router-link>
    </nav>
  </header>

  <main>
    <router-view />
  </main>
</template>

<script setup lang="ts">
// App component setup
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

#app {
  width: 100%;
  height: 100vh;
}

header {
  background-color: #f5f5f5;
  padding: 1rem;
}

nav {
  display: flex;
  gap: 1rem;
}

main {
  padding: 1rem;
}
</style>