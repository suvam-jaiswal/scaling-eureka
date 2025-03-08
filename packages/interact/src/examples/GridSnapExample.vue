<template>
  <div class="example-view">
    <h1>Grid Snapping Example</h1>
    <p>This example demonstrates dragging elements that snap to a grid.</p>

    <div class="example-container">
      <div
        ref="gridContainer"
        class="grid-container"
      >
        <div
          v-for="n in 2"
          :key="n"
          :ref="el => { gridItems[n-1] = el }"
          class="grid-item"
        >
          Item {{ n }}
        </div>
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
        <pre v-if="activeTab === 'template'"><code v-html="highlightedTemplate"></code></pre>
        <pre v-if="activeTab === 'script'"><code v-html="highlightedScript"></code></pre>
        <pre v-if="activeTab === 'style'"><code v-html="highlightedStyle"></code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import interact from 'interactjs'
import Prism from 'prismjs'

const gridContainer = ref<HTMLElement | null>(null)
const gridItems = ref<Array<HTMLElement | null>>([])
const activeTab = ref('template')

// Template code
const templateCode = `<div class="grid-container" ref="gridContainer">
  <div v-for="n in 2" :key="n" :ref="el => { gridItems[n-1] = el }" class="grid-item">
    Item {{ n }}
  </div>
</div>`

// Script code
const scriptCode = `import { ref, onMounted, onBeforeUnmount } from 'vue'
import interact from 'interactjs'

const gridContainer = ref<HTMLElement | null>(null)
const gridItems = ref<(HTMLElement | null)[]>([])

// Grid cell size in pixels
const GRID_SIZE = 50

onMounted(() => {
  // Initialize grid items with different positions
  if (gridItems.value[0] !== null) {
    gridItems.value[0].style.transform = 'translate(0px, 0px)'
  }
  
  if (gridItems.value[1] !== null) {
    gridItems.value[1].style.transform = \`translate(\${GRID_SIZE * 3}px, \${GRID_SIZE}px)\`
  }
  
  // Make items draggable with grid snapping
  gridItems.value.forEach((item) => {
    if (item !== null) {
      interact(item).draggable({
        modifiers: [
          // Snap to the grid
          interact.modifiers.snap({
            targets: [
              interact.snappers.grid({ x: GRID_SIZE, y: GRID_SIZE })
            ],
            range: Infinity, // Always snap, no matter how far
            relativePoints: [{ x: 0, y: 0 }]
          }),
          
          // Restrict to container
          interact.modifiers.restrict({
            restriction: gridContainer.value ?? 'parent',
            elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
            endOnly: true
          })
        ],
        
        listeners: {
          move(event) {
            const target = event.target as HTMLElement
            
            // Get current position or default to 0,0
            const x = (parseFloat(target.getAttribute('data-x') ?? '0')) + event.dx
            const y = (parseFloat(target.getAttribute('data-y') ?? '0')) + event.dy
            
            // Update the element's position
            target.style.transform = \`translate(\${x}px, \${y}px)\`
            
            // Store the position
            target.setAttribute('data-x', String(x))
            target.setAttribute('data-y', String(y))
          }
        }
      })
    }
  })
})

onBeforeUnmount(() => {
  // Clean up interactions
  gridItems.value.forEach(item => {
    if (item !== null) {
      interact(item).unset()
    }
  })
})`

// Style code
const styleCode = `.grid-container {
  position: relative;
  width: 400px;
  height: 400px;
  background-color: #f5f5f5;
  background-image: 
    linear-gradient(to right, #ddd 1px, transparent 1px),
    linear-gradient(to bottom, #ddd 1px, transparent 1px);
  background-size: 50px 50px;
  border: 1px solid #ccc;
  margin: 20px auto;
}

.grid-item {
  position: absolute;
  width: 100px;
  height: 100px;
  padding: 10px;
  background-color: var(--secondary-color);
  color: white;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  touch-action: none;
  user-select: none;
  cursor: move;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}`

// Syntax highlighting
const highlightedTemplate = Prism.highlight(templateCode, Prism.languages.markup, 'html')
const highlightedScript = Prism.highlight(scriptCode, Prism.languages.typescript, 'typescript')
const highlightedStyle = Prism.highlight(styleCode, Prism.languages.css, 'css')

// Grid cell size in pixels
const GRID_SIZE = 50

onMounted(() => {
  // Initialize grid items with different positions
  if (gridItems.value[0] !== null) {
    gridItems.value[0].style.transform = 'translate(0px, 0px)'
  }

  if (gridItems.value[1] !== null) {
    gridItems.value[1].style.transform = `translate(${GRID_SIZE * 3}px, ${GRID_SIZE}px)`
  }

  // Make items draggable with grid snapping
  gridItems.value.forEach((item) => {
    if (item !== null) {
      interact(item).draggable({
        modifiers: [
          // Snap to the grid
          interact.modifiers.snap({
            targets: [
              interact.snappers.grid({ x: GRID_SIZE, y: GRID_SIZE })
            ],
            range: Infinity, // Always snap, no matter how far
            relativePoints: [{ x: 0, y: 0 }]
          }),

          // Restrict to container
          interact.modifiers.restrict({
            restriction: gridContainer.value ?? 'parent',
            elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
            endOnly: true
          })
        ],

        listeners: {
          move (event) {
            const target = event.target as HTMLElement

            // Get current position or default to 0,0
            const x = (parseFloat(target.getAttribute('data-x') ?? '0')) + event.dx
            const y = (parseFloat(target.getAttribute('data-y') ?? '0')) + event.dy

            // Update the element's position
            target.style.transform = `translate(${x}px, ${y}px)`

            // Store the position
            target.setAttribute('data-x', String(x))
            target.setAttribute('data-y', String(y))
          }
        }
      })
    }
  })
})

onBeforeUnmount(() => {
  // Clean up interactions
  gridItems.value.forEach(item => {
    if (item !== null) {
      interact(item).unset()
    }
  })
})
</script>

<style scoped>
.grid-container {
  position: relative;
  width: 400px;
  height: 400px;
  background-color: #f5f5f5;
  background-image:
    linear-gradient(to right, #ddd 1px, transparent 1px),
    linear-gradient(to bottom, #ddd 1px, transparent 1px);
  background-size: 50px 50px;
  border: 1px solid #ccc;
  margin: 20px auto;
}

.grid-item {
  position: absolute;
  width: 100px;
  height: 100px;
  padding: 10px;
  background-color: var(--secondary-color);
  color: white;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  touch-action: none;
  user-select: none;
  cursor: move;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
</style>
