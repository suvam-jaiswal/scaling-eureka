<template>
  <div class="example-view">
    <h1>Drag and Drop Example</h1>
    <p>This example demonstrates how to create drag and drop functionality between containers.</p>

    <div class="example-container">
      <div class="dropzones">
        <div
          ref="sourceZoneElement"
          class="dropzone source-zone"
          data-id="source"
        >
          <h3>Source</h3>
          <div
            v-for="item in sourceItems"
            :key="item.id"
            :ref="el => { sourceItemElements[item.id] = el }"
            class="drag-item"
            :data-id="item.id"
          >
            {{ item.text }}
          </div>
        </div>

        <div
          ref="targetZoneElement"
          class="dropzone target-zone"
          data-id="target"
        >
          <h3>Target</h3>
          <div
            v-for="item in targetItems"
            :key="item.id"
            :ref="el => { targetItemElements[item.id] = el }"
            class="drag-item"
            :data-id="item.id"
          >
            {{ item.text }}
          </div>
        </div>
      </div>

      <div class="controls">
        <button @click="resetItems">
          Reset Items
        </button>
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
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import interact from 'interactjs'
import Prism from 'prismjs'

// Define item interface
interface Item {
  id: string
  text: string
}

// Define initial items
const initialSourceItems: Item[] = [
  { id: 'item1', text: 'Item 1' },
  { id: 'item2', text: 'Item 2' },
  { id: 'item3', text: 'Item 3' },
  { id: 'item4', text: 'Item 4' }
]

const initialTargetItems: Item[] = []

// Reactive state
const sourceItems = ref<Item[]>([...initialSourceItems])
const targetItems = ref<Item[]>([...initialTargetItems])
const sourceItemElements = reactive<Record<string, HTMLElement | null>>({})
const targetItemElements = reactive<Record<string, HTMLElement | null>>({})
const sourceZoneElement = ref<HTMLElement | null>(null)
const targetZoneElement = ref<HTMLElement | null>(null)
const activeTab = ref('template')

// Function to reset items to initial state
const resetItems = (): void => {
  sourceItems.value = [...initialSourceItems]
  targetItems.value = [...initialTargetItems]
}

// Move an item from one array to another
const moveItem = (itemId: string, from: Item[], to: Item[]): void => {
  const itemIndex = from.findIndex(item => item.id === itemId)
  if (itemIndex !== -1) {
    const [item] = from.splice(itemIndex, 1)
    to.push(item)
  }
}

// Template code
const templateCode = `<div class="dropzones">
  <div 
    ref="sourceZoneElement" 
    class="dropzone source-zone"
    data-id="source"
  >
    <h3>Source</h3>
    <div
      v-for="item in sourceItems"
      :key="item.id"
      :ref="el => sourceItemElements[item.id] = el"
      class="drag-item"
      :data-id="item.id"
    >
      {{ item.text }}
    </div>
  </div>

  <div
    ref="targetZoneElement"
    class="dropzone target-zone"
    data-id="target"
  >
    <h3>Target</h3>
    <div
      v-for="item in targetItems"
      :key="item.id"
      :ref="el => targetItemElements[item.id] = el"
      class="drag-item"
      :data-id="item.id"
    >
      {{ item.text }}
    </div>
  </div>
</div>

<div class="controls">
  <button @click="resetItems">Reset Items</button>
</div>`

// Script code
const scriptCode = `import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import interact from 'interactjs'

// Define item interface
interface Item {
  id: string;
  text: string;
}

// Define initial items
const initialSourceItems: Item[] = [
  { id: 'item1', text: 'Item 1' },
  { id: 'item2', text: 'Item 2' },
  { id: 'item3', text: 'Item 3' },
  { id: 'item4', text: 'Item 4' }
]

const initialTargetItems: Item[] = []

// Reactive state
const sourceItems = ref<Item[]>([...initialSourceItems])
const targetItems = ref<Item[]>([...initialTargetItems])
const sourceItemElements = reactive<Record<string, HTMLElement | null>>({})
const targetItemElements = reactive<Record<string, HTMLElement | null>>({})
const sourceZoneElement = ref<HTMLElement | null>(null)
const targetZoneElement = ref<HTMLElement | null>(null)

// Function to reset items to initial state
const resetItems = (): void => {
  sourceItems.value = [...initialSourceItems]
  targetItems.value = [...initialTargetItems]
}

// Move an item from one array to another
const moveItem = (itemId: string, from: Item[], to: Item[]): void => {
  const itemIndex = from.findIndex(item => item.id === itemId)
  if (itemIndex !== -1) {
    const [item] = from.splice(itemIndex, 1)
    to.push(item)
  }
}

// Initialize draggable
const initDraggable = (element: HTMLElement | null) => {
  if (element !== null) {
    interact(element).draggable({
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true
        })
      ],
      listeners: {
        move(event) {
          const target = event.target as HTMLElement
          // Get current position
          const x = (parseFloat(target.getAttribute('data-x') ?? '0')) + event.dx
          const y = (parseFloat(target.getAttribute('data-y') ?? '0')) + event.dy
          
          // Update element position
          target.style.transform = \`translate(\${x}px, \${y}px)\`
          
          // Store position
          target.setAttribute('data-x', String(x))
          target.setAttribute('data-y', String(y))
          
          // Add dragging class
          target.classList.add('dragging')
        },
        end(event) {
          const target = event.target as HTMLElement
          target.classList.remove('dragging')
        }
      }
    })
  }
}

// Watch for changes to lists and initialize new items
watch(sourceItems, () => {
  setTimeout(() => {
    Object.values(sourceItemElements).forEach(initDraggable)
  }, 0)
}, { deep: true })

watch(targetItems, () => {
  setTimeout(() => {
    Object.values(targetItemElements).forEach(initDraggable)
  }, 0)
}, { deep: true })

onMounted(() => {
  // Using setTimeout to ensure elements are fully rendered
  setTimeout(() => {
    // Initialize draggable items
    Object.values(sourceItemElements).forEach(initDraggable)
    Object.values(targetItemElements).forEach(initDraggable)
    
    // Make target zone droppable
    if (targetZoneElement.value) {
      interact(targetZoneElement.value).dropzone({
        accept: '.drag-item',
        overlap: 0.5,
        ondropactivate(event) {
          const target = event.target as HTMLElement
          target.classList.add('drop-active')
        },
        ondragenter(event) {
          const dropzone = event.target as HTMLElement
          const draggable = event.relatedTarget as HTMLElement
          
          dropzone.classList.add('drop-target')
          draggable.classList.add('can-drop')
        },
        ondragleave(event) {
          const target = event.target as HTMLElement
          const relatedTarget = event.relatedTarget as HTMLElement
          
          target.classList.remove('drop-target')
          relatedTarget.classList.remove('can-drop')
        },
        ondrop(event) {
          const draggable = event.relatedTarget as HTMLElement
          const dropzone = event.target as HTMLElement
          
          // Get the IDs of the elements
          const itemId = draggable.getAttribute('data-id') ?? draggable.id
          const zoneId = dropzone.getAttribute('data-id') ?? dropzone.id
          
          // Handle drops
          if (zoneId === 'target') {
            moveItem(itemId, sourceItems.value, targetItems.value)
          }
          
          // Clear transform to allow Vue to position it naturally
          draggable.style.transform = ''
          draggable.removeAttribute('data-x')
          draggable.removeAttribute('data-y')
        },
        ondropdeactivate(event) {
          const target = event.target as HTMLElement
          const relatedTarget = event.relatedTarget as HTMLElement
          
          target.classList.remove('drop-active')
          target.classList.remove('drop-target')
          relatedTarget.classList.remove('can-drop')
        }
      })
    }
    
    // Make source zone droppable too (for moving items back)
    if (sourceZoneElement.value) {
      interact(sourceZoneElement.value).dropzone({
        accept: '.drag-item',
        overlap: 0.5,
        ondropactivate(event) {
          const target = event.target as HTMLElement
          target.classList.add('drop-active')
        },
        ondragenter(event) {
          const target = event.target as HTMLElement
          const relatedTarget = event.relatedTarget as HTMLElement
          
          target.classList.add('drop-target')
          relatedTarget.classList.add('can-drop')
        },
        ondragleave(event) {
          const target = event.target as HTMLElement
          const relatedTarget = event.relatedTarget as HTMLElement
          
          target.classList.remove('drop-target')
          relatedTarget.classList.remove('can-drop')
        },
        ondrop(event) {
          const draggable = event.relatedTarget as HTMLElement
          
          // Get the IDs of the elements
          const itemId = draggable.getAttribute('data-id') ?? draggable.id
          
          // Handle drops
          moveItem(itemId, targetItems.value, sourceItems.value)
          
          // Clear transform to allow Vue to position it naturally
          draggable.style.transform = ''
          draggable.removeAttribute('data-x')
          draggable.removeAttribute('data-y')
        },
        ondropdeactivate(event) {
          const target = event.target as HTMLElement
          const relatedTarget = event.relatedTarget as HTMLElement
          
          target.classList.remove('drop-active')
          target.classList.remove('drop-target')
          relatedTarget.classList.remove('can-drop')
        }
      })
    }
  }, 100)
})`

// Style code
const styleCode = `.dropzones {
  display: flex;
  gap: 1.5rem;
}

.dropzone {
  flex: 1;
  min-height: 300px;
  padding: 1rem;
  border-radius: 4px;
  border: 2px dashed var(--border-color);
  background-color: var(--bg-light);
}

.source-zone {
  background-color: rgba(232, 249, 253, 0.5);
}

.target-zone {
  background-color: rgba(232, 253, 237, 0.5);
}

.drag-item {
  width: 100px;
  height: 60px;
  margin: 0.5rem;
  padding: 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  cursor: move;
  user-select: none;
  touch-action: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  position: relative;
  z-index: 1;
  transition: background-color 0.2s;
}

.drag-item.dragging {
  z-index: 2;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.drag-item.can-drop {
  background-color: var(--success-color);
}

.dropzone.drop-active {
  border-color: var(--border-color-active);
}

.dropzone.drop-target {
  background-color: var(--bg-hover);
  border-color: var(--primary-color);
}

.controls {
  margin-top: 1.5rem;
  text-align: center;
}

.controls button {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:hover {
  background-color: var(--primary-color-dark);
}`

// Syntax highlighting
const highlightedTemplate = Prism.highlight(templateCode, Prism.languages.markup, 'html')
const highlightedScript = Prism.highlight(scriptCode, Prism.languages.typescript, 'typescript')
const highlightedStyle = Prism.highlight(styleCode, Prism.languages.css, 'css')

// Initialize draggable
const initDraggable = (element: HTMLElement | null) => {
  if (element !== null) {
    interact(element).draggable({
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true
        })
      ],
      listeners: {
        move(event) {
          const target = event.target as HTMLElement
          // Get current position
          const x = (parseFloat(target.getAttribute('data-x') ?? '0')) + event.dx
          const y = (parseFloat(target.getAttribute('data-y') ?? '0')) + event.dy
          
          // Update element position
          target.style.transform = `translate(${x}px, ${y}px)`
          
          // Store position
          target.setAttribute('data-x', String(x))
          target.setAttribute('data-y', String(y))
          
          // Add dragging class
          target.classList.add('dragging')
        },
        end(event) {
          const target = event.target as HTMLElement
          target.classList.remove('dragging')
        }
      }
    })
  }
}

// Watch for changes to lists and initialize new items
watch(sourceItems, () => {
  setTimeout(() => {
    Object.values(sourceItemElements).forEach(initDraggable)
  }, 0)
}, { deep: true })

watch(targetItems, () => {
  setTimeout(() => {
    Object.values(targetItemElements).forEach(initDraggable)
  }, 0)
}, { deep: true })

onMounted(() => {
  // Using setTimeout to ensure elements are fully rendered
  setTimeout(() => {
    // Initialize draggable items
    Object.values(sourceItemElements).forEach(initDraggable)
    Object.values(targetItemElements).forEach(initDraggable)
    
    // Make target zone droppable
    if (targetZoneElement.value) {
      interact(targetZoneElement.value).dropzone({
        accept: '.drag-item',
        overlap: 0.5,
        ondropactivate(event) {
          const target = event.target as HTMLElement
          target.classList.add('drop-active')
        },
        ondragenter(event) {
          const dropzone = event.target as HTMLElement
          const draggable = event.relatedTarget as HTMLElement
          
          dropzone.classList.add('drop-target')
          draggable.classList.add('can-drop')
        },
        ondragleave(event) {
          const target = event.target as HTMLElement
          const relatedTarget = event.relatedTarget as HTMLElement
          
          target.classList.remove('drop-target')
          relatedTarget.classList.remove('can-drop')
        },
        ondrop(event) {
          const draggable = event.relatedTarget as HTMLElement
          const dropzone = event.target as HTMLElement
          
          // Get the IDs of the elements
          const itemId = draggable.getAttribute('data-id') ?? draggable.id
          const zoneId = dropzone.getAttribute('data-id') ?? dropzone.id
          
          // Handle drops
          if (zoneId === 'target') {
            moveItem(itemId, sourceItems.value, targetItems.value)
          }
          
          // Clear transform to allow Vue to position it naturally
          draggable.style.transform = ''
          draggable.removeAttribute('data-x')
          draggable.removeAttribute('data-y')
        },
        ondropdeactivate(event) {
          const target = event.target as HTMLElement
          const relatedTarget = event.relatedTarget as HTMLElement
          
          target.classList.remove('drop-active')
          target.classList.remove('drop-target')
          relatedTarget.classList.remove('can-drop')
        }
      })
    }
    
    // Make source zone droppable too (for moving items back)
    if (sourceZoneElement.value) {
      interact(sourceZoneElement.value).dropzone({
        accept: '.drag-item',
        overlap: 0.5,
        ondropactivate(event) {
          const target = event.target as HTMLElement
          target.classList.add('drop-active')
        },
        ondragenter(event) {
          const target = event.target as HTMLElement
          const relatedTarget = event.relatedTarget as HTMLElement
          
          target.classList.add('drop-target')
          relatedTarget.classList.add('can-drop')
        },
        ondragleave(event) {
          const target = event.target as HTMLElement
          const relatedTarget = event.relatedTarget as HTMLElement
          
          target.classList.remove('drop-target')
          relatedTarget.classList.remove('can-drop')
        },
        ondrop(event) {
          const draggable = event.relatedTarget as HTMLElement
          
          // Get the IDs of the elements
          const itemId = draggable.getAttribute('data-id') ?? draggable.id
          
          // Handle drops
          moveItem(itemId, targetItems.value, sourceItems.value)
          
          // Clear transform to allow Vue to position it naturally
          draggable.style.transform = ''
          draggable.removeAttribute('data-x')
          draggable.removeAttribute('data-y')
        },
        ondropdeactivate(event) {
          const target = event.target as HTMLElement
          const relatedTarget = event.relatedTarget as HTMLElement
          
          target.classList.remove('drop-active')
          target.classList.remove('drop-target')
          relatedTarget.classList.remove('can-drop')
        }
      })
    }
  }, 100)
})

onBeforeUnmount(() => {
  // Cleanup interact instances
  const cleanupElement = (element: HTMLElement | null) => {
    if (element !== null) {
      try {
        interact(element).unset()
      } catch (e) {
        console.warn('Error cleaning up interact instance:', e)
      }
    }
  }

  // Clean up all elements
  Object.values(sourceItemElements).forEach(cleanupElement)
  Object.values(targetItemElements).forEach(cleanupElement)
  
  // Clean up dropzones
  cleanupElement(sourceZoneElement.value)
  cleanupElement(targetZoneElement.value)
})
</script>

<style scoped>
.dropzones {
  display: flex;
  gap: 1.5rem;
}

.dropzone {
  flex: 1;
  min-height: 300px;
  padding: 1rem;
  border-radius: 4px;
  border: 2px dashed var(--border-color);
  background-color: var(--bg-light);
}

.source-zone {
  background-color: rgba(232, 249, 253, 0.5);
}

.target-zone {
  background-color: rgba(232, 253, 237, 0.5);
}

.drag-item {
  width: 100px;
  height: 60px;
  margin: 0.5rem;
  padding: 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  cursor: move;
  user-select: none;
  touch-action: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  position: relative;
  z-index: 1;
  transition: background-color 0.2s;
}

.drag-item.dragging {
  z-index: 2;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.drag-item.can-drop {
  background-color: var(--success-color);
}

.dropzone.drop-active {
  border-color: var(--border-color-active);
}

.dropzone.drop-target {
  background-color: var(--bg-hover);
  border-color: var(--primary-color);
}

.controls {
  margin-top: 1.5rem;
  text-align: center;
}

.controls button {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:hover {
  background-color: var(--primary-color-dark);
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