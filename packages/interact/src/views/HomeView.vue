<template>
  <div class="home">
    <section class="hero">
      <h1>Interact.js</h1>
      <p class="tagline">JavaScript library for creating <span class="highlight">interactive</span> and <span class="highlight">responsive</span> user interfaces</p>
    </section>

    <section class="features">
      <div class="feature-card">
        <div class="feature-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <h3>Simple API</h3>
        <p>Straightforward API that makes it easy to add drag, drop, and resize capabilities to your elements</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
        </div>
        <h3>Multi-touch</h3>
        <p>Full support for multi-touch gestures including pinch, zoom, and rotate on touch devices</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
        </div>
        <h3>Framework Agnostic</h3>
        <p>Works with any JavaScript framework or vanilla JS, making it flexible for any project</p>
      </div>
    </section>

    <section class="getting-started">
      <h2>Getting Started</h2>
      <p>
        Interact.js is a JavaScript library for drag and drop, resizing, and multi-touch gestures on modern browsers.
        This documentation will help you understand how to use Interact.js effectively in your projects.
      </p>
      <div class="cta-buttons">
        <router-link to="/docs/01-overview" class="btn primary">Read Documentation</router-link>
        <router-link to="/examples/drag-basic" class="btn secondary">View Examples</router-link>
      </div>
    </section>

    <section class="documentation">
      <h2>Documentation</h2>
      <div v-if="loadingDocs" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading documentation...</p>
      </div>
      <div v-else-if="docsError" class="error-container">
        <p>Error loading documentation. Please try again later.</p>
      </div>
      <div v-else class="doc-grid">
        <router-link 
          v-for="doc in docFiles" 
          :key="doc.id" 
          :to="`/docs/${doc.id}`" 
          class="doc-card"
        >
          <h3>{{ doc.title }}</h3>
          <p>{{ getDocDescription(doc.id) }}</p>
        </router-link>
      </div>
    </section>

    <section class="examples">
      <h2>Interactive Examples</h2>
      <div class="examples-grid">
        <router-link to="/examples/drag-basic" class="example-card">
          <div class="example-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l2 2-2 2"></path><path d="M9 5l2 2-2 2"></path><path d="M15 5l2 2-2 2"></path><path d="M19 9l2 2-2 2"></path><path d="M15 19l2 2-2 2"></path><path d="M9 19l2 2-2 2"></path><path d="M5 15l2 2-2 2"></path><path d="M19 15l2 2-2 2"></path></svg>
          </div>
          <h3>Basic Drag</h3>
          <p>Simple draggable elements</p>
        </router-link>
        <router-link to="/examples/resize" class="example-card">
          <div class="example-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8V5H8"></path><path d="M5 16v3h3"></path><path d="M19 8V5h-3"></path><path d="M19 16v3h-3"></path></svg>
          </div>
          <h3>Resizable Element</h3>
          <p>Elements that can be resized</p>
        </router-link>
        <router-link to="/examples/grid-snap" class="example-card">
          <div class="example-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3zM12 9v6M9 12h6M3 9h6M3 15h6M15 3v6M15 15v6"></path></svg>
          </div>
          <h3>Grid Snapping</h3>
          <p>Dragging with grid snapping functionality</p>
        </router-link>
        <router-link to="/examples/drag-drop" class="example-card">
          <div class="example-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"></path><path d="m12 12 4 10 1.7-4.3L22 16Z"></path></svg>
          </div>
          <h3>Drag & Drop</h3>
          <p>Complete drag and drop interfaces</p>
        </router-link>
        <router-link to="/examples/gesture" class="example-card">
          <div class="example-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 13a8 8 0 0 0 8-8 8.5 8.5 0 0 0-8.5-4.5A8.5 8.5 0 0 0 10.5 5a8 8 0 0 0 8 8Z"></path><path d="M1 19c4 0 7-2 9-5.5"></path><path d="M8 14c4 0 7-2 9-5.5"></path></svg>
          </div>
          <h3>Multi-touch Gestures</h3>
          <p>Pinch, zoom, and rotate gestures</p>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAllDocFiles } from '../services/DocsService';
import type { DocFile } from '../services/DocsService';

// Documentation files state
const docFiles = ref<DocFile[]>([]);
const loadingDocs = ref(true);
const docsError = ref(false);

// Descriptions for documentation files
const docDescriptions: Record<string, string> = {
  '01-overview': 'Introduction to Interact.js and its key features',
  '02-installation': 'How to install and set up Interact.js in your project',
  '03-usage': 'Core concepts and basic usage patterns',
  '04-api': 'Complete reference for the Interact.js API',
  '05-tutorials': 'Step-by-step tutorials for real-world scenarios',
  '06-best-practices': 'Tips and best practices for using Interact.js',
  '07-examples': 'Practical examples to help you get started quickly',
  '08-typescript-interfaces': 'TypeScript type definitions and interfaces',
  '09-advanced-features': 'Advanced features and techniques',
  '10-modifiers-system': 'Understanding the modifiers system',
  '11-complete-api-reference': 'Comprehensive API documentation'
};

// Function to get a description for a doc file
const getDocDescription = (id: string): string => {
  return docDescriptions[id] || 'Documentation for Interact.js';
};

// Load documentation files
const loadDocFiles = async () => {
  loadingDocs.value = true;
  docsError.value = false;
  try {
    docFiles.value = await getAllDocFiles();
    
    // Display the first 6 docs to match the original layout
    if (docFiles.value.length > 6) {
      docFiles.value = docFiles.value.slice(0, 6);
    }
  } catch (error) {
    console.error('Error loading documentation files:', error);
    docsError.value = true;
  } finally {
    loadingDocs.value = false;
  }
};

onMounted(async () => {
  await loadDocFiles();
});
</script>

<style scoped>
.home {
  padding-bottom: var(--spacing-xl);
}

.hero {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.hero h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

.tagline {
  font-size: 1.25rem;
  color: var(--text-light);
  max-width: 700px;
  margin: 0 auto var(--spacing-lg);
}

.highlight {
  color: var(--primary-color);
  font-weight: 600;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.feature-card {
  background-color: white;
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.feature-icon {
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.feature-card h3 {
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
}

.feature-card p {
  color: var(--text-light);
  font-size: 0.95rem;
}

.getting-started {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.getting-started h2 {
  margin-bottom: var(--spacing-md);
  font-weight: 700;
}

.getting-started p {
  max-width: 700px;
  margin: 0 auto var(--spacing-lg);
  color: var(--text-light);
}

.cta-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-top: var(--spacing-lg);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
}

.btn.primary {
  background-color: var(--primary-color);
  color: white;
}

.btn.primary:hover {
  background-color: #2a75ee;
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  text-decoration: none;
}

.btn.secondary {
  background-color: rgba(58, 134, 255, 0.1);
  color: var(--primary-color);
}

.btn.secondary:hover {
  background-color: rgba(58, 134, 255, 0.15);
  transform: translateY(-2px);
  text-decoration: none;
}

.documentation, .examples {
  margin-bottom: var(--spacing-xl);
}

.documentation h2, .examples h2 {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  font-weight: 700;
}

.doc-grid, .examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

.doc-card, .example-card {
  background-color: white;
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  color: var(--text-color);
  text-decoration: none;
  border: 1px solid var(--border-color);
  height: 100%;
}

.doc-card:hover, .example-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
  text-decoration: none;
}

.doc-card h3, .example-card h3 {
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--text-color);
}

.doc-card p, .example-card p {
  color: var(--text-light);
  font-size: 0.95rem;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-light);
  text-align: center;
  min-height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(58, 134, 255, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: var(--spacing-md);
}

.error-container {
  color: #ff3b30;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.example-icon {
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }
  
  .tagline {
    font-size: 1.125rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .features {
    grid-template-columns: 1fr;
  }
}
</style>