<template>
  <div class="example-view">
    <h1>Resizable Element Example</h1>
    <p>This example demonstrates an element that can be resized by dragging its edges and corners.</p>

    <div class="example-container">
      <div
        ref="resizeElement"
        class="resize-element"
      >
        <div class="resize-content">
          Resize me by grabbing the edges or corners
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

const resizeElement = ref<HTMLElement | null>(null)
const activeTab = ref('template')

// Template code
const templateCode = `<div ref="resizeElement" class="resize-element">
  <div class="resize-content">
    Resize me by grabbing the edges or corners
  </div>
</div>`

// Script code
const scriptCode = `import { ref, onMounted, onBeforeUnmount } from 'vue'
import interact from 'interactjs'

const resizeElement = ref<HTMLElement | null>(null)

onMounted(() => {
  if (resizeElement.value !== null) {
    interact(resizeElement.value).resizable({
      // Resize from all edges and corners
      edges: { left: true, right: true, bottom: true, top: true },
      
      listeners: {
        move(event) {
          const target = event.target as HTMLElement
          
          // Update element width/height
          let width = parseFloat(getComputedStyle(target).width)
          let height = parseFloat(getComputedStyle(target).height)
          
          // Add the delta values from the interaction
          width += event.deltaRect.width
          height += event.deltaRect.height
          
          // Apply the new width and height
          Object.assign(target.style, {
            width: \`\${width}px\`,
            height: \`\${height}px\`
          })
          
          // If we're resizing from top or left edges, we need to update position
          const x = (parseFloat(target.getAttribute('data-x') ?? '0')) + event.deltaRect.left
          const y = (parseFloat(target.getAttribute('data-y') ?? '0')) + event.deltaRect.top
          
          target.style.transform = \`translate(\${x}px, \${y}px)\`
          
          target.setAttribute('data-x', String(x))
          target.setAttribute('data-y', String(y))
        }
      },
      
      // Set min/max dimensions
      modifiers: [
        interact.modifiers.restrictSize({
          min: { width: 100, height: 100 },
        })
      ]
    })
  }
})

onBeforeUnmount(() => {
  if (resizeElement.value !== null) {
    interact(resizeElement.value).unset()
  }
})`

// Style code
const styleCode = `.resize-element {
  width: 200px;
  height: 200px;
  background-color: #f0f8ff;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  position: relative;
  touch-action: none;
  user-select: none;
  overflow: hidden;
  resize: both;
}

.resize-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
  text-align: center;
}`

// Syntax highlighting
const highlightedTemplate = Prism.highlight(templateCode, Prism.languages.markup, 'html')
const highlightedScript = Prism.highlight(scriptCode, Prism.languages.typescript, 'typescript')
const highlightedStyle = Prism.highlight(styleCode, Prism.languages.css, 'css')

onMounted(() => {
  if (resizeElement.value !== null) {
    interact(resizeElement.value).resizable({
      // Resize from all edges and corners
      edges: { left: true, right: true, bottom: true, top: true },

      listeners: {
        move (event) {
          const target = event.target as HTMLElement

          // Update element width/height
          let width = parseFloat(getComputedStyle(target).width)
          let height = parseFloat(getComputedStyle(target).height)

          // Add the delta values from the interaction
          width += event.deltaRect.width
          height += event.deltaRect.height

          // Apply the new width and height
          Object.assign(target.style, {
            width: `${width}px`,
            height: `${height}px`
          })

          // If we're resizing from top or left edges, we need to update position
          const x = (parseFloat(target.getAttribute('data-x') ?? '0')) + event.deltaRect.left
          const y = (parseFloat(target.getAttribute('data-y') ?? '0')) + event.deltaRect.top

          target.style.transform = `translate(${x}px, ${y}px)`

          target.setAttribute('data-x', String(x))
          target.setAttribute('data-y', String(y))
        }
      },

      // Set min/max dimensions
      modifiers: [
        interact.modifiers.restrictSize({
          min: { width: 100, height: 100 }
        })
      ]
    })
  }
})

onBeforeUnmount(() => {
  if (resizeElement.value !== null) {
    interact(resizeElement.value).unset()
  }
})
</script>

<style scoped>
.resize-element {
  width: 200px;
  height: 200px;
  background-color: #f0f8ff;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  position: relative;
  touch-action: none;
  user-select: none;
  overflow: hidden;
}

.resize-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
  text-align: center;
}
</style>
