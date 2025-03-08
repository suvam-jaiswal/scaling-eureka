import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface GridItemData {
  id: string;
  colSpan: number;
  rowSpan: number;
  colStart: number;
  rowStart: number;
  content: string;
}

// Default grid layout
const defaultItems: GridItemData[] = [
  {
    id: '1',
    colSpan: 2,
    rowSpan: 1,
    colStart: 1,
    rowStart: 1,
    content: 'Weather Widget'
  },
  {
    id: '2',
    colSpan: 1,
    rowSpan: 1,
    colStart: 3,
    rowStart: 1,
    content: 'Quick Tasks'
  },
  {
    id: '3',
    colSpan: 1,
    rowSpan: 1,
    colStart: 4,
    rowStart: 1,
    content: 'Notifications'
  },
  {
    id: '4',
    colSpan: 2,
    rowSpan: 2,
    colStart: 1,
    rowStart: 2,
    content: 'Analytics Chart'
  },
  {
    id: '5',
    colSpan: 2,
    rowSpan: 1,
    colStart: 3,
    rowStart: 2,
    content: 'Recent Activity'
  },
  {
    id: '6',
    colSpan: 1,
    rowSpan: 1,
    colStart: 3,
    rowStart: 3,
    content: 'Calendar'
  },
  {
    id: '7',
    colSpan: 1,
    rowSpan: 1,
    colStart: 4,
    rowStart: 3,
    content: 'Messages'
  },
  {
    id: '8',
    colSpan: 4,
    rowSpan: 1,
    colStart: 1,
    rowStart: 4,
    content: 'System Status'
  },
  {
    id: '9',
    colSpan: 2,
    rowSpan: 1,
    colStart: 1,
    rowStart: 5,
    content: 'Recent Documents'
  },
  {
    id: '10',
    colSpan: 2,
    rowSpan: 1,
    colStart: 3,
    rowStart: 5,
    content: 'Resources'
  },
  {
    id: '11',
    colSpan: 1,
    rowSpan: 2,
    colStart: 1,
    rowStart: 6,
    content: 'Team Members'
  },
  {
    id: '12',
    colSpan: 3,
    rowSpan: 1,
    colStart: 2,
    rowStart: 6,
    content: 'Project Timeline'
  },
  {
    id: '13',
    colSpan: 1,
    rowSpan: 1,
    colStart: 2,
    rowStart: 7,
    content: 'Notes'
  },
  {
    id: '14',
    colSpan: 2,
    rowSpan: 1,
    colStart: 3,
    rowStart: 7,
    content: 'Performance Metrics'
  }
];

export const useGridStore = defineStore('grid', () => {
  // State
  const items = ref<GridItemData[]>([...defaultItems]);
  
  // Lifecycle hook to load stored layout
  loadLayout();

  // Actions
  function addItem(item: GridItemData) {
    items.value.push(item);
    saveLayout();
  }

  function updateItem(id: string, updatedData: Partial<GridItemData>) {
    const index = items.value.findIndex(item => item.id === id);
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updatedData };
      saveLayout();
    }
  }

  function removeItem(id: string) {
    items.value = items.value.filter(item => item.id !== id);
    saveLayout();
  }

  function moveItem(id: string, colStart: number, rowStart: number) {
    const index = items.value.findIndex(item => item.id === id);
    if (index !== -1) {
      items.value[index].colStart = colStart;
      items.value[index].rowStart = rowStart;
      saveLayout();
    }
  }

  function resizeItem(id: string, colSpan: number, rowSpan: number) {
    const index = items.value.findIndex(item => item.id === id);
    if (index !== -1) {
      items.value[index].colSpan = colSpan;
      items.value[index].rowSpan = rowSpan;
      saveLayout();
    }
  }

  // Load layout from localStorage on initialization
  function loadLayout() {
    const savedLayout = localStorage.getItem('grid-layout');
    if (savedLayout) {
      try {
        items.value = JSON.parse(savedLayout);
        return true;
      } catch (error) {
        console.error('Failed to load layout from localStorage:', error);
        return false;
      }
    }
    return false;
  }

  // Save layout to localStorage
  function saveLayout() {
    try {
      localStorage.setItem('grid-layout', JSON.stringify(items.value));
      return true;
    } catch (error) {
      console.error('Failed to save layout to localStorage:', error);
      return false;
    }
  }

  // Reset to default layout
  function resetLayout() {
    items.value = [...defaultItems];
    saveLayout();
  }

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    moveItem,
    resizeItem,
    resetLayout
  };
});