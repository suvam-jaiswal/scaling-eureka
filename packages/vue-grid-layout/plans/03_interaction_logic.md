# Cloudscape Board - Interaction Logic Deep Dive

This document outlines the implementation details for handling user interactions within the `vue-cloudscape-board` component, including dragging, resizing, and keyboard navigation. This logic will primarily reside in the `useBoardInteractions` composable.

## 1. Core Principles

* **Controlled Component:** All interactions result in calculating a potential new layout, which is then emitted via `@items-change`. The visual update only occurs when the parent application updates the `items` prop.
* **Visual Feedback:** Provide clear visual cues during interactions (e.g., item opacity change, placeholder/ghost element, highlighted resize handles).
* **Accessibility:** Ensure all interactions are achievable via keyboard and are properly announced by screen readers (details in `plans/05_accessibility.md`).

## 2. Technology Choice

* **Recommendation:** Utilize VueUse's `useDraggable` for handling mouse and touch dragging, potentially combined with custom logic for grid snapping and collision feedback during the drag. For resizing, a similar approach using pointer events or a dedicated resize library/composable might be needed.
* **Alternative:** Build custom Vue directives using Pointer Events directly for maximum control over drag and resize behavior. This increases complexity but avoids external dependencies.
* **Initial Approach:** Start with VueUse `useDraggable` for dragging and potentially custom directives for resizing to balance development speed and control.

## 3. Drag Interaction (`useBoardInteractions`)

* **Initiation:**
  * Attach listeners (via `useDraggable` or directive) to the designated drag handle element within `BoardItem.vue`.
  * On interaction start (`pointerdown`/`touchstart`):
    * Record the initial pointer position and the item's starting grid position (`columnOffset`, `rowOffset`).
    * Set an internal reactive state flag `isDragging = true` and store the `draggingItemId`.
    * Optionally apply a CSS class for visual feedback (e.g., increased z-index, slight opacity).
    * Prevent default text selection/browser drag behavior.
* **Movement:**
  * On pointer move:
    * Calculate the delta change in pointer position.
    * Update the visual position of the dragged item (e.g., using CSS `transform: translate()`). This is a temporary visual effect.
    * Calculate the *current grid cell* the pointer is over.
    * **Optional (Advanced):** Show a ghost/placeholder element at the potential drop location in the grid. This might involve temporarily running a simplified collision check to see where the item *would* fit if dropped.
* **Termination:**
  * On interaction end (`pointerup`/`touchend`):
    * Calculate the final target grid cell (`columnOffset`, `rowOffset`) based on the drop position.
    * Create the `newItemDefinition` based on the target cell and the item's original `columnSpan`/`rowSpan`.
    * Call the `resolveLayoutChanges` function (from `useGridLayout`) with the `currentItems`, `draggingItemId`, and `newItemDefinition`.
    * Emit the `@items-change` event with the *result* returned by `resolveLayoutChanges`.
    * Reset internal state: `isDragging = false`, `draggingItemId = null`.
    * Remove temporary visual styles.

## 4. Resize Interaction (`useBoardInteractions`)

* **Initiation:**
  * Attach listeners (via directive or pointer events) to resize handle elements within `BoardItem.vue`. Each handle corresponds to a direction (e.g., 'se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w').
  * On interaction start (`pointerdown`/`touchstart`):
    * Record initial pointer position, item's starting grid definition (`columnOffset`, `rowOffset`, `columnSpan`, `rowSpan`), and the resize direction.
    * Set internal state `isResizing = true`, store `resizingItemId` and `resizeDirection`.
    * Prevent default behaviors.
* **Movement:**
  * On pointer move:
    * Calculate the delta change in pointer position.
    * Determine the change in grid units (`deltaCols`, `deltaRows`) based on the pointer delta, `columnWidth`, `rowHeight`, and `resizeDirection`.
    * Calculate the *tentative* new `columnOffset`, `rowOffset`, `columnSpan`, `rowSpan`. Respect minimum/maximum dimensions if implemented. Prevent resizing beyond grid boundaries.
    * Update the visual size/position of the resizing item temporarily (e.g., update `width`, `height`, potentially `top`/`left` via CSS).
* **Termination:**
  * On interaction end (`pointerup`/`touchend`):
    * Calculate the final target grid definition (`columnOffset`, `rowOffset`, `columnSpan`, `rowSpan`) based on the resize operation.
    * Create the `newItemDefinition`.
    * Call `resolveLayoutChanges` with `currentItems`, `resizingItemId`, and `newItemDefinition`.
    * Emit `@items-change` with the result.
    * Reset internal state: `isResizing = false`, `resizingItemId = null`.

## 5. Keyboard Interaction (`useBoardInteractions` / `BoardItem.vue`)

* **Focus Management:** Ensure drag handles and resize handles are focusable (e.g., using `tabindex="0"`). Focus should be managed logically when moving between items or handles.
* **Event Listeners:** Attach `@keydown` listeners, likely on the `BoardItem.vue` container or delegated from `Board.vue`.
* **Drag via Keyboard:**
  * When drag handle has focus:
    * `Enter` or `Space`: Initiate drag mode for the item. Set internal state `isKeyboardDragging = true`. Provide visual feedback. Announce via ARIA live region.
    * `Arrow Keys` (while dragging): Calculate the next grid cell in the specified direction. Create a `newItemDefinition`. Call `resolveLayoutChanges`. Emit `@items-change`. *Crucially, each arrow key press should trigger a full resolve/emit cycle to update the parent state immediately.*
    * `Escape` (while dragging): Cancel drag mode. Revert to the state before dragging started (might require storing original position). Reset state. Announce cancellation.
    * `Enter` or `Space` (while dragging): Commit the current position. Reset state. Announce commit.
* **Resize via Keyboard:**
  * When resize handle has focus:
    * `Enter` or `Space`: Initiate resize mode. Set internal state `isKeyboardResizing = true`. Provide visual feedback. Announce.
    * `Arrow Keys` (while resizing, potentially with Shift modifier): Calculate the change in `columnSpan`/`rowSpan` based on arrow direction and handle type. Create `newItemDefinition`. Call `resolveLayoutChanges`. Emit `@items-change` immediately.
    * `Escape` (while resizing): Cancel resize mode. Revert. Reset state. Announce.
    * `Enter` or `Space` (while resizing): Commit the current size. Reset state. Announce.
* **State Management:** Keyboard interactions modify the layout incrementally, requiring immediate calls to `resolveLayoutChanges` and emission of `@items-change` on each step (e.g., each arrow key press) to keep the parent state updated.

## 6. Implementation Notes

* The `useBoardInteractions` composable should encapsulate the core logic for drag/resize event handling, state tracking (isDragging, isResizing), and calculating target definitions.
* It will need access to grid parameters (`columnWidth`, `rowHeight`, `gap`, `columns`) from `useGridLayout`.
* It will invoke `resolveLayoutChanges` from `useGridLayout`.
* It will trigger the necessary event emissions (`@items-change`).
* Keyboard logic might be partially handled within `BoardItem.vue` to manage focus and initial event capture, potentially calling methods provided by `useBoardInteractions`.
* Thorough testing is needed for edge cases, boundary conditions, and different interaction combinations.
