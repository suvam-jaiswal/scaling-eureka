<template>
  <div class="example-view">
    <h1>Basic Drag Example</h1>
    <p class="example-description">This example demonstrates a simple draggable element that can be moved around freely.</p>

    <div class="example-container">
      <div
        ref="dragElement"
        class="drag-element"
      >
        <span class="drag-handle">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-9 9"/><path d="m3 21 9-9"/></svg>
        </span>
        <span>Drag me!</span>
      </div>
    </div>

    <div class="code-tabs">
      <div class="tab-buttons">
        <button
          class="tab-button"
          :class="{ active: activeTab === 'template' }"
          @click="activeTab = 'template'"
        >
          Template
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'script' }"
          @click="activeTab = 'script'"
        >
          Script
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'style' }"
          @click="activeTab = 'style'"
        >
          Style
        </button>
      </div>
      <div class="tab-content">
        <pre v-show="activeTab === 'template'"><code v-html="highlightedTemplate"></code></pre>
        <pre v-show="activeTab === 'script'"><code v-html="highlightedScript"></code></pre>
        <pre v-show="activeTab === 'style'"><code v-html="highlightedStyle"></code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import interact from 'interactjs'
import Prism from 'prismjs'

const dragElement = ref<HTMLElement | null>(null)
const activeTab = ref('template')

// Template code
const templateCode = `<div ref="dragElement" class="drag-element">
  <span class="drag-handle">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-9 9"/><path d="m3 21 9-9"/></svg>
  </span>
  <span>Drag me!</span>
</div>`

// Script code
const scriptCode = `import { ref, onMounted, onBeforeUnmount } from 'vue'
import interact from 'interactjs'

const dragElement = ref<HTMLElement | null>(null)

onMounted(() => {
  if (dragElement.value !== null) {
    interact(dragElement.value).draggable({
      listeners: {
        move(event) {
          const target = event.target
          // Get the x,y position of the interaction
          const x = (parseFloat(target.getAttribute('data-x') ?? '0')) + event.dx
          const y = (parseFloat(target.getAttribute('data-y') ?? '0')) + event.dy
          
          // Apply transform
          target.style.transform = \`translate(\${x}px, \${y}px)\`
          
          // Update the position attributes
          target.setAttribute('data-x', String(x))
          target.setAttribute('data-y', String(y))
        }
      }
    })
  }
})

onBeforeUnmount(() => {
  if (dragElement.value !== null) {
    interact(dragElement.value).unset()
  }
})`

// Style code
const styleCode = `.drag-element {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  font-weight: 600;
  user-select: none;
  touch-action: none;
  cursor: move;
  margin: 2rem auto;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.drag-element:hover {
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.15);
}

.drag-handle {
  margin-bottom: 0.5rem;
  opacity: 0.8;
}

.example-description {
  max-width: 600px;
  margin: 0 auto 2rem auto;
  color: var(--text-light);
}`

// Syntax highlighting
const highlightedTemplate = Prism.highlight(templateCode, Prism.languages.markup, 'html')
const highlightedScript = Prism.highlight(scriptCode, Prism.languages.typescript, 'typescript')
const highlightedStyle = Prism.highlight(styleCode, Prism.languages.css, 'css')

onMounted(() => {
  if (dragElement.value !== null) {
    interact(dragElement.value).draggable({
      listeners: {
        move (event) {
          const target = event.target as HTMLElement
          // Get the x,y position of the interaction
          const x = (parseFloat(target.getAttribute('data-x') ?? '0')) + event.dx
          const y = (parseFloat(target.getAttribute('data-y') ?? '0')) + event.dy

          // Apply transform
          target.style.transform = `translate(${x}px, ${y}px)`

          // Update the position attributes
          target.setAttribute('data-x', String(x))
          target.setAttribute('data-y', String(y))
        }
      }
    })
  }
})

onBeforeUnmount(() => {
  if (dragElement.value !== null) {
    interact(dragElement.value).unset()
  }
})
</script>

<style scoped>
.example-view h1 {
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 700;
  color: var(--text-color);
}

.example-description {
  max-width: 600px;
  margin: 0 auto 2rem auto;
  color: var(--text-light);
  text-align: center;
}

.drag-element {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: var(--radius-lg);
  font-weight: 600;
  user-select: none;
  touch-action: none;
  cursor: move;
  margin: 2rem auto;
  box-shadow: var(--shadow-md);
  transition: box-shadow 0.3s ease;
}

.drag-element:hover {
  box-shadow: var(--shadow-lg);
}

.drag-handle {
  margin-bottom: 0.5rem;
  opacity: 0.8;
}

/* Fix tab visibility */
.tab-content pre {
  margin: 0;
  padding: 1rem;
  background-color: var(--code-bg);
  border-radius: 4px;
  overflow: auto;
  max-height: 400px;
}

.tab-buttons {
  display: flex;
  margin-bottom: 0.5rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  background-color: var(--bg-light);
  border: 1px solid var(--border-color);
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  margin-right: 0.25rem;
}

.tab-button.active {
  background-color: var(--code-bg);
  border-color: var(--border-color-active);
}
</style>