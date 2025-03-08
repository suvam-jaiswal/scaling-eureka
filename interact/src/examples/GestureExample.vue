<template>
  <div class="example-view">
    <h1>Multi-touch Gestures Example</h1>
    <p>This example demonstrates pinch, zoom, and rotate gestures with Interact.js.</p>
    <p><strong>Note:</strong> This example requires a multi-touch device (like a tablet or phone) or a trackpad/touchscreen that supports multi-touch gestures.</p>

    <div class="example-container">
      <div class="gesture-container">
        <div
          ref="gestureElement"
          class="gesture-element"
        >
          <img
            src="https://via.placeholder.com/200"
            alt="Touch to pinch/rotate"
          >
          <div class="gesture-instructions">
            <div>Touch with two fingers to:</div>
            <div>• Pinch to scale</div>
            <div>• Rotate with two fingers</div>
          </div>
        </div>
      </div>

      <div class="gesture-info">
        <div><strong>Scale:</strong> {{ scaleInfo.toFixed(2) }}x</div>
        <div><strong>Rotation:</strong> {{ rotationInfo.toFixed(2) }}°</div>
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

const gestureElement = ref<HTMLElement | null>(null)
const activeTab = ref('template')
const scaleInfo = ref(1)
const rotationInfo = ref(0)

// Template code
const templateCode = `<div class="gesture-container">
  <div ref="gestureElement" class="gesture-element">
    <img src="https://via.placeholder.com/200" alt="Touch to pinch/rotate">
    <div class="gesture-instructions">
      <div>Touch with two fingers to:</div>
      <div>• Pinch to scale</div>
      <div>• Rotate with two fingers</div>
    </div>
  </div>
</div>

<div class="gesture-info">
  <div><strong>Scale:</strong> {{ scaleInfo.toFixed(2) }}x</div>
  <div><strong>Rotation:</strong> {{ rotationInfo.toFixed(2) }}°</div>
</div>`

// Script code
const scriptCode = `import { ref, onMounted, onBeforeUnmount } from 'vue'
import interact from 'interactjs'

const gestureElement = ref<HTMLElement | null>(null)
const scaleInfo = ref(1)     // Current scale level
const rotationInfo = ref(0)  // Current rotation in degrees

onMounted(() => {
  if (gestureElement.value !== null) {
    interact(gestureElement.value).gesturable({
      listeners: {
        start(event) {
          const target = event.target as HTMLElement
          // Get initial state or use current values
          const currentAngle = parseFloat(target.getAttribute('data-angle') ?? '0')
          const currentScale = parseFloat(target.getAttribute('data-scale') ?? '1')
          
          // Store values as starting point for this gesture
          target.setAttribute('data-start-angle', String(currentAngle))
          target.setAttribute('data-start-scale', String(currentScale))
        },
        
        move(event) {
          const target = event.target as HTMLElement
          // Get starting values for this gesture session
          const startAngle = parseFloat(target.getAttribute('data-start-angle') ?? '0')
          const startScale = parseFloat(target.getAttribute('data-start-scale') ?? '1')
          
          // Calculate new values based on the gesture
          // event.angle gives the angle of the gesture in degrees
          // event.scale gives the ratio of the distance between pointers
          const newScale = startScale * event.scale
          const newAngle = startAngle + event.angle
          
          // Update the element's transform
          target.style.transform = 
            \`rotate(\${newAngle}deg) scale(\${newScale})\`
          
          // Store the values for next move or end
          target.setAttribute('data-angle', String(newAngle))
          target.setAttribute('data-scale', String(newScale))
          
          // Update the UI with the current values
          scaleInfo.value = newScale
          rotationInfo.value = newAngle
        }
      }
    })
    
    // Make the element draggable as well for a complete interaction
    interact(gestureElement.value).draggable({
      listeners: {
        move(event) {
          const target = event.target as HTMLElement
          const x = (parseFloat(target.getAttribute('data-x') ?? '0')) + event.dx
          const y = (parseFloat(target.getAttribute('data-y') ?? '0')) + event.dy
          
          // Update element's position
          target.style.transform = \`translate(\${x}px, \${y}px) \` + 
                                  \`rotate(\${rotationInfo.value}deg) \` + 
                                  \`scale(\${scaleInfo.value})\`
          
          target.setAttribute('data-x', String(x))
          target.setAttribute('data-y', String(y))
        }
      }
    })
  }
})

onBeforeUnmount(() => {
  if (gestureElement.value !== null) {
    interact(gestureElement.value).unset()
  }
})`

// Style code
const styleCode = `.gesture-container {
  position: relative;
  width: 300px;
  height: 300px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.gesture-element {
  width: 200px;
  height: 200px;
  background-color: white;
  border-radius: 8px;
  touch-action: none;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.gesture-element img {
  max-width: 100%;
  border-radius: 4px;
  margin-bottom: 10px;
}

.gesture-instructions {
  font-size: 0.9rem;
  text-align: center;
  color: #666;
}

.gesture-info {
  margin-top: 20px;
  padding: 10px;
  background-color: #e9f5ff;
  border-radius: 4px;
  display: flex;
  justify-content: space-around;
  font-size: 0.9rem;
}`

// Syntax highlighting
const highlightedTemplate = Prism.highlight(templateCode, Prism.languages.markup, 'html')
const highlightedScript = Prism.highlight(scriptCode, Prism.languages.typescript, 'typescript')
const highlightedStyle = Prism.highlight(styleCode, Prism.languages.css, 'css')

onMounted(() => {
  if (gestureElement.value !== null) {
    interact(gestureElement.value).gesturable({
      listeners: {
        start (event) {
          const target = event.target as HTMLElement
          // Get initial state or use current values
          const currentAngle = parseFloat(target.getAttribute('data-angle') ?? '0')
          const currentScale = parseFloat(target.getAttribute('data-scale') ?? '1')

          // Store values as starting point for this gesture
          target.setAttribute('data-start-angle', String(currentAngle))
          target.setAttribute('data-start-scale', String(currentScale))
        },

        move (event) {
          const target = event.target as HTMLElement
          // Get starting values for this gesture session
          const startAngle = parseFloat(target.getAttribute('data-start-angle') ?? '0')
          const startScale = parseFloat(target.getAttribute('data-start-scale') ?? '1')

          // Calculate new values based on the gesture
          // event.angle gives the angle of the gesture in degrees
          // event.scale gives the ratio of the distance between pointers
          const newScale = startScale * event.scale
          const newAngle = startAngle + event.angle

          // Update the element's transform
          target.style.transform =
            `rotate(${newAngle}deg) scale(${newScale})`

          // Store the values for next move or end
          target.setAttribute('data-angle', String(newAngle))
          target.setAttribute('data-scale', String(newScale))

          // Update the UI with the current values
          scaleInfo.value = newScale
          rotationInfo.value = newAngle
        }
      }
    })

    // Make the element draggable as well for a complete interaction
    interact(gestureElement.value).draggable({
      listeners: {
        move (event) {
          const target = event.target as HTMLElement
          const x = (parseFloat(target.getAttribute('data-x') ?? '0')) + event.dx
          const y = (parseFloat(target.getAttribute('data-y') ?? '0')) + event.dy

          // Update element's position
          target.style.transform = `translate(${x}px, ${y}px) ` +
                                  `rotate(${rotationInfo.value}deg) ` +
                                  `scale(${scaleInfo.value})`

          target.setAttribute('data-x', String(x))
          target.setAttribute('data-y', String(y))
        }
      }
    })
  }
})

onBeforeUnmount(() => {
  if (gestureElement.value !== null) {
    interact(gestureElement.value).unset()
  }
})
</script>

<style scoped>
.gesture-container {
  position: relative;
  width: 300px;
  height: 300px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.gesture-element {
  width: 200px;
  height: 200px;
  background-color: white;
  border-radius: 8px;
  touch-action: none;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.gesture-element img {
  max-width: 100%;
  border-radius: 4px;
  margin-bottom: 10px;
}

.gesture-instructions {
  font-size: 0.9rem;
  text-align: center;
  color: #666;
}

.gesture-info {
  margin-top: 20px;
  padding: 10px;
  background-color: #e9f5ff;
  border-radius: 4px;
  display: flex;
  justify-content: space-around;
  font-size: 0.9rem;
}
</style>
