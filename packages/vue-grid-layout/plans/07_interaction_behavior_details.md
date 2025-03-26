# Cloudscape Board - Interaction Behavior Details Deep Dive

This document details the specific visual feedback and behaviors expected during user interactions (drag, resize) within the `vue-cloudscape-board` component, aiming for a user experience similar to Cloudscape.

## 1. Drag Interaction Feedback

* **Initiation (Pointer Down on Handle):**
  * Change cursor to `grabbing`.
  * Apply a visual style to the drag handle (e.g., slightly darker background).
* **Active Drag:**
  * **Item Style:** Apply a class (e.g., `vue-board__item--dragging`) to the `BoardItem.vue` root element. This class should:
    * Increase `z-index` significantly so the dragged item appears above all others.
    * Optionally apply a subtle box-shadow to give a "lifted" effect.
    * Optionally apply a slight opacity reduction (e.g., `opacity: 0.9;`) to hint at the underlying grid.
  * **Movement:** The item's position should update smoothly following the pointer using CSS `transform: translate()`.
  * **Ghost/Placeholder (Optional but Recommended):**
    * Render a placeholder element at the grid position where the item *would* drop if released.
    * This placeholder should have the same grid dimensions (`columnSpan`, `rowSpan`) as the dragged item.
    * Style the placeholder clearly but unobtrusively (e.g., dashed border, semi-transparent background).
    * The placeholder's position needs to be calculated based on the current pointer position mapped to grid cells and potentially considering the push/swap logic preview. This can be complex.
  * **Grid Cell Highlighting:**
    * Render a background layer representing the grid cells.
    * During active drag, highlight the grid cells that the item *would occupy* if dropped at the current pointer position (e.g., with a distinct background color like light blue).
    * Optionally, highlight all *other* grid cells with a different background (e.g., light gray) to emphasize the grid structure.
    * This requires mapping the pointer position to grid cells and determining the item's potential footprint.
  * **Push/Swap Animation:** When the drag causes other items to shift (as determined by `resolveLayoutChanges` preview or during commit), these items should ideally animate smoothly to their new positions using CSS transitions on `transform` or `top`/`left`.
* **Termination (Pointer Up):**
  * Remove the `--dragging` class and associated styles.
  * Reset cursor to `grab` (or default).
  * Remove any ghost/placeholder element.
  * The item should snap to its final calculated grid position (the update comes from the parent updating the `items` prop based on the `@items-change` event). Ensure CSS transitions are applied for this final placement if desired.

## 2. Resize Interaction Feedback

* **Hover/Focus on Item:**
  * Resize handles (e.g., bottom-right corner) should become visible or more prominent.
* **Hover/Focus on Resize Handle:**
  * Change cursor to the appropriate resize direction (e.g., `se-resize`).
  * Apply a visual style to the handle (e.g., darker color, slightly larger).
* **Initiation (Pointer Down on Handle):**
  * Apply an active style to the resize handle.
* **Active Resize:**
  * **Item Style:** Apply a class (e.g., `vue-board__item--resizing`).
  * **Movement:** The item's boundaries (width, height, potentially top/left depending on resize direction) should update smoothly following the pointer.
  * **Grid Cell Highlighting:**
    * Similar to dragging, highlight the grid cells the item *would occupy* with its current tentative size/position (e.g., light blue).
    * Optionally highlight other cells differently (e.g., light gray).
  * **Push/Swap Animation:** Similar to dragging, if resizing pushes other items, they should animate smoothly to their new positions.
* **Termination (Pointer Up):**
  * Remove the `--resizing` class.
  * Resize handles return to their default state (visible on item hover/focus or hidden).
  * Reset cursor.
  * The item snaps to its final calculated size and position based on the updated `items` prop. Apply CSS transitions if desired.

## 3. Keyboard Interaction Feedback

* **Focus Indication:** Standard browser focus outlines should be clearly visible on drag handles and resize handles when they receive focus (`Tab`). Ensure sufficient contrast.
* **Active Drag/Resize Mode (Keyboard):**
  * Apply a distinct visual style (e.g., a persistent border or background change) to the item or handle that is currently being manipulated via the keyboard.
  * This provides persistent feedback since there's no continuous pointer movement.
* **Movement/Resize Steps:** Each arrow key press should result in the item visually snapping to the new grid position/size immediately (as the `@items-change` event is emitted and the prop updates). CSS transitions can smooth this step-by-step movement.
* **ARIA Live Announcements:** Crucial for non-visual feedback (see `plans/05_accessibility.md`).

## 4. Implementation Notes

* Use dynamic CSS classes bound to reactive state variables (`isDragging`, `isResizing`, `isKeyboardDragging`, etc.) within `BoardItem.vue`.
* Define CSS transitions on `transform`, `top`, `left`, `width`, `height` properties for the `BoardItem` container to enable smooth animations when items are pushed or snap to their final position.
* Implementing a smooth ghost/placeholder during drag requires careful calculation and DOM manipulation or conditional rendering.
* Ensure interaction styles (hover, focus, active) for handles are clearly defined in the CSS.
