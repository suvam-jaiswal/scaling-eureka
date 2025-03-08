import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface GridItem {
  id: number
  width: number
  height: number
  x: number
  y: number
  content: string
}

export const useGridStore = defineStore('grid', () => {
  const items = ref<GridItem[]>([
    { id: 1, width: 200, height: 200, x: 0, y: 0, content: 'Item 1' },
    { id: 2, width: 200, height: 200, x: 220, y: 0, content: 'Item 2' },
    { id: 3, width: 200, height: 200, x: 440, y: 0, content: 'Item 3' }
  ])

  const addItem = (item: Omit<GridItem, 'id'>) => {
    const id = Math.max(0, ...items.value.map(item => item.id)) + 1
    items.value.push({ ...item, id })
  }

  const updateItem = (id: number, updates: Partial<Omit<GridItem, 'id'>>) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updates }
    }
  }

  const removeItem = (id: number) => {
    items.value = items.value.filter(item => item.id !== id)
  }

  return {
    items,
    addItem,
    updateItem,
    removeItem
  }
})