<template>
  <div class="app">
    <header class="app-header">
      <div class="container header-container">
        <h1>Interact.js</h1>
        <button class="mobile-nav-toggle" @click="toggleSidebar" aria-label="Toggle navigation">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line v-if="!isSidebarOpen" x1="3" y1="12" x2="21" y2="12"></line>
            <line v-if="!isSidebarOpen" x1="3" y1="6" x2="21" y2="6"></line>
            <line v-if="!isSidebarOpen" x1="3" y1="18" x2="21" y2="18"></line>
            <line v-if="isSidebarOpen" x1="18" y1="6" x2="6" y2="18"></line>
            <line v-if="isSidebarOpen" x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </header>
    <div class="layout-container" :class="{ 'sidebar-collapsed': !isSidebarOpen && !isMobile }">
      <aside class="sidebar" :class="{ 'mobile-hidden': !isSidebarOpen && isMobile, 'sidebar-collapsed': !isSidebarOpen && !isMobile }">
        <div class="sidebar-content">
          <button class="sidebar-toggle" @click="toggleSidebar" :title="isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path v-if="isSidebarOpen" d="m15 18-6-6 6-6"></path>
              <path v-else d="m9 18 6-6-6-6"></path>
            </svg>
          </button>
          <nav>
            <ul class="nav-list">
              <li>
                <router-link to="/" @click="closeSidebarOnMobile">
                  <span class="nav-icon" v-if="!isSidebarOpen && !isMobile">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  </span>
                  <span class="nav-text">Home</span>
                </router-link>
              </li>
              <!-- Dynamically generate docs links -->
              <li v-for="doc in docFiles" :key="doc.id">
                <router-link :to="`/docs/${doc.id}`" @click="closeSidebarOnMobile">
                  <span class="nav-icon" v-if="!isSidebarOpen && !isMobile">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </span>
                  <span class="nav-text">{{ doc.title }}</span>
                </router-link>
              </li>
              <!-- Loading state while fetching docs -->
              <li v-if="loadingDocs">
                <div class="nav-loading">
                  <span class="nav-text">Loading docs...</span>
                </div>
              </li>
              <!-- Error state if docs can't be loaded -->
              <li v-if="docsError">
                <div class="nav-error">
                  <span class="nav-text">Error loading docs</span>
                </div>
              </li>
            </ul>
          </nav>
          <h3>
            <span v-if="isSidebarOpen || isMobile">Examples</span>
            <span v-else class="nav-icon-only">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
            </span>
          </h3>
          <nav>
            <ul class="nav-list">
              <li>
                <router-link to="/examples/drag-basic" @click="closeSidebarOnMobile">
                  <span class="nav-icon" v-if="!isSidebarOpen && !isMobile">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>
                  </span>
                  <span class="nav-text">Basic Drag</span>
                </router-link>
              </li>
              <li>
                <router-link to="/examples/resize" @click="closeSidebarOnMobile">
                  <span class="nav-icon" v-if="!isSidebarOpen && !isMobile">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
                  </span>
                  <span class="nav-text">Resizable Element</span>
                </router-link>
              </li>
              <li>
                <router-link to="/examples/grid-snap" @click="closeSidebarOnMobile">
                  <span class="nav-icon" v-if="!isSidebarOpen && !isMobile">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M3 15h18"></path><path d="M9 3v18"></path><path d="M15 3v18"></path></svg>
                  </span>
                  <span class="nav-text">Grid Snapping</span>
                </router-link>
              </li>
              <li>
                <router-link to="/examples/drag-drop" @click="closeSidebarOnMobile">
                  <span class="nav-icon" v-if="!isSidebarOpen && !isMobile">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"></path><path d="M16 12a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1 1 1 0 0 0-1 1v1a1 1 0 0 1-1 1"></path></svg>
                  </span>
                  <span class="nav-text">Drag & Drop</span>
                </router-link>
              </li>
              <li>
                <router-link to="/examples/gesture" @click="closeSidebarOnMobile">
                  <span class="nav-icon" v-if="!isSidebarOpen && !isMobile">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9a4 4 0 0 0-2 7.5"></path><path d="M12 3v2"></path><path d="m6.6 18.4-1.4 1.4"></path><path d="M20 12h-2"></path><path d="M6.6 5.6 5.2 4.2"></path><path d="m19.4 5.6 1.4-1.4"></path><path d="M12 9a4 4 0 0 0-2 7.5"></path><path d="M12 3v2"></path><path d="m6.6 18.4-1.4 1.4"></path><path d="M20 12h-2"></path><path d="M6.6 5.6 5.2 4.2"></path><path d="m19.4 5.6 1.4-1.4"></path></svg>
                  </span>
                  <span class="nav-text">Multi-touch Gestures</span>
                </router-link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <main class="main-content">
        <div class="content">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getAllDocFiles } from './services/DocsService';
import type { DocFile } from './services/DocsService';

// Sidebar state
const isSidebarOpen = ref(window.innerWidth > 768);
const windowWidth = ref(window.innerWidth);

// Documentation files state
const docFiles = ref<DocFile[]>([]);
const loadingDocs = ref(true);
const docsError = ref(false);

const isMobile = computed(() => {
  return windowWidth.value <= 768;
});

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebarOnMobile = () => {
  if (isMobile.value) {
    isSidebarOpen.value = false;
  }
};

// Handle window resize events
const handleResize = () => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value > 768) {
    // Auto-expand on desktop
    isSidebarOpen.value = true;
  }
};

// Load documentation files
const loadDocFiles = async () => {
  loadingDocs.value = true;
  docsError.value = false;
  try {
    docFiles.value = await getAllDocFiles();
  } catch (error) {
    console.error('Error loading documentation files:', error);
    docsError.value = true;
  } finally {
    loadingDocs.value = false;
  }
};

onMounted(async () => {
  window.addEventListener('resize', handleResize);
  // Set initial values
  windowWidth.value = window.innerWidth;
  isSidebarOpen.value = windowWidth.value > 768;
  // Load documentation files
  await loadDocFiles();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-nav-toggle {
  display: none;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
}

.nav-loading, .nav-error {
  padding: var(--spacing-sm);
  color: var(--text-light);
  font-style: italic;
  display: flex;
  align-items: center;
}

.nav-error {
  color: #ff3b30;
}

@media (max-width: 768px) {
  .mobile-nav-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>