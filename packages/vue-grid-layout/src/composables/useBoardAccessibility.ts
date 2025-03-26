import { ref, computed, type Ref } from 'vue';
import type { BoardI18nStrings } from '../types';

// Simple unique ID generator for ARIA attributes
let idCounter = 0;
const generateUniqueId = (prefix = 'vue-board-') => `${prefix}${idCounter++}`;

export function useBoardAccessibility(
  i18nStrings: Ref<BoardI18nStrings | undefined>
  // TODO: Accept refs for interaction state (isDragging, isResizing, etc.)
) {
  // --- State ---
  const liveRegionMessage = ref('');
  const boardId = generateUniqueId('board-');
  // Store generated IDs for descriptions, etc.
  const descriptionIds = {
    drag: generateUniqueId('desc-drag-'),
    resize: generateUniqueId('desc-resize-'),
    // Add more as needed
  };

  // --- Computeds / Helpers ---
  const getI18nString = <K extends keyof BoardI18nStrings>(
    key: K,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args?: any[]
  ): string => {
    const stringOrFn = i18nStrings.value?.[key];
    if (typeof stringOrFn === 'function') {
      // eslint-disable-next-line @typescript-eslint/ban-types
      return (stringOrFn as Function)(...(args || [])) || '';
    }
    return stringOrFn || ''; // Provide default empty string
  };

  // --- Functions ---
  function announce(message: string) {
    // Update the ref, which should be bound to an aria-live region in the template
    liveRegionMessage.value = message;
    // Consider clearing the message after a short delay if needed
  }

  function getDragHandleProps() {
    // TODO: Incorporate interaction state
    return {
      'aria-label': getI18nString('dragHandleAriaLabel'),
      'aria-describedby': descriptionIds.drag,
      'aria-grabbed': 'false', // Update based on state
      role: 'button',
      tabindex: 0,
    };
  }

  function getResizeHandleProps(direction: 'N' | 'S' | 'E' | 'W' | 'NW' | 'NE' | 'SW' | 'SE') {
    // TODO: Incorporate interaction state
    return {
      'aria-label': getI18nString('resizeHandleAriaLabel', [direction]),
      'aria-describedby': descriptionIds.resize,
      role: 'slider', // Or button, depending on implementation
      tabindex: 0,
      // Add aria-valuemin/max/now if using role="slider"
    };
  }

  function getItemProps(itemLabel: string | undefined) {
    return {
      role: 'region',
      'aria-label': itemLabel || 'Board item', // Fallback needed
      'aria-roledescription': getI18nString('itemAriaRoleDescription') || 'Board item',
    };
  }

  // --- Return ---
  return {
    boardId,
    descriptionIds,
    liveRegionMessage,
    announce,
    getI18nString, // Expose for direct use if needed
    getDragHandleProps,
    getResizeHandleProps,
    getItemProps,
    // Expose other needed functions/refs
  };
}
