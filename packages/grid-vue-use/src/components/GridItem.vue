<template>
  <div 
    ref="itemRef"
    class="grid-item"
    :style="{
      width: `${item.width}px`,
      height: `${item.height}px`,
      transform: `translate(${item.x}px, ${item.y}px)`
    }"
  >
    <div class="grid-item-content">
      {{ item.content }}
    </div>
    <div class="resize-handle"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineProps, defineEmits } from 'vue'
import interact from 'interactjs'

interface GridItemData {
  id: number
  width: number
  height: number
  x: number
  y: number
  content: string
}

interface InteractEvent {
  target: HTMLElement
  dx: number
  dy: number
  rect: {
    width: number
    height: number
  }
  deltaRect: {
    left: number
    top: number
  }
}

const props = defineProps<{
  item: GridItemData
}>()

const emit = defineEmits<{
  (e: 'update', id: number, updates: Partial<Omit<GridItemData, 'id'>>): void
}>()

const itemRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!itemRef.value) return

  // Make the element draggable
  interact(itemRef.value)
    .draggable({
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true
        })
      ],
      autoScroll: true,
      listeners: {
        move: dragMoveListener
      }
    })
    .resizable({
      // Resize from all edges and corners
      edges: { left: false, right: true, bottom: true, top: false },
      
      listeners: {
        move: resizeMoveListener
      },
      modifiers: [
        // Minimum size
        interact.modifiers.restrictSize({
          min: { width: 100, height: 100 }
        })
      ],
      inertia: true
    })
})

function dragMoveListener(event: InteractEvent) {
  const target = event.target
  
  // Keep the dragged position in the data-x/data-y attributes
  const x = (parseFloat(target.getAttribute('data-x') || '0') || props.item.x) + event.dx
  const y = (parseFloat(target.getAttribute('data-y') || '0') || props.item.y) + event.dy

  // Update the element's position via emitting an event
  emit('update', props.item.id, { x, y })
  
  // Update the element's style
  target.style.transform = `translate(${x}px, ${y}px)`

  // Update the position attributes
  target.setAttribute('data-x', x.toString())
  target.setAttribute('data-y', y.toString())
}

function resizeMoveListener(event: InteractEvent) {
  const target = event.target
  let x = (parseFloat(target.getAttribute('data-x') || '0') || props.item.x)
  let y = (parseFloat(target.getAttribute('data-y') || '0') || props.item.y)

  // Translate when resizing from top or left edges
  x += event.deltaRect.left
  y += event.deltaRect.top

  // Update the element's dimensions via emitting an event
  emit('update', props.item.id, { 
    width: event.rect.width,
    height: event.rect.height,
    x,
    y
  })

  // Update the element's style
  target.style.width = `${event.rect.width}px`
  target.style.height = `${event.rect.height}px`
  target.style.transform = `translate(${x}px, ${y}px)`

  // Update the position attributes
  target.setAttribute('data-x', x.toString())
  target.setAttribute('data-y', y.toString())
}
</script>

<style scoped>
.grid-item {
  position: absolute;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  touch-action: none;
  user-select: none;
}

.grid-item-content {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.1);
  cursor: nwse-resize;
  border-top-left-radius: 10px;
}
</style>