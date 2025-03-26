# Cloudscape Board - Accessibility (A11y) Deep Dive

This document outlines the accessibility requirements for the `vue-cloudscape-board` component, ensuring it meets high standards similar to AWS Cloudscape, focusing on ARIA attributes, keyboard navigation, and internationalization. Logic related to this will primarily be managed by the `useBoardAccessibility` composable and implemented within `Board.vue` and `BoardItem.vue`.

## 1. Core Principles

* **Keyboard Operability:** All interactions (moving, resizing, dismissing items) must be fully achievable using only the keyboard.
* **Screen Reader Support:** Provide clear context and feedback to screen reader users about the board structure, item positions, interaction states, and outcomes using ARIA attributes and live regions.
* **Focus Management:** Logical and predictable focus movement is crucial for keyboard navigation.
* **Internationalization:** Allow customization of all user-facing strings and ARIA labels via the `i18nStrings` prop.

## 2. ARIA Attributes

* **Board Container (`Board.vue` root element):**
  * `role="application"` (or potentially `role="group"` depending on context, `application` might be better if keyboard interaction is complex).
  * `aria-label`: Provided by `i18nStrings.boardLabel`. Describes the purpose of the board.
  * `aria-roledescription="Board"`: Provides a human-readable type.
  * Consider `aria-describedby` pointing to hidden instructions for keyboard usage.
* **Board Item (`BoardItem.vue` root element):**
  * `role="region"`: Defines each item as a landmark region.
  * `aria-label`: Should ideally include the item's header text or a meaningful name derived from `item.data`.
  * `aria-roledescription`: Provided by `i18nStrings.itemAriaRoleDescription` (e.g., "Board item").
  * `aria-labelledby`: If the item has a visible header element, point to its ID.
* **Drag Handle (within `BoardItem.vue`):**
  * Typically a `<button>` or element with `role="button"`.
  * `tabindex="0"`: Make it focusable.
  * `aria-label`: Provided by `i18nStrings.dragHandleAriaLabel`.
  * `aria-describedby`: Point to hidden instructions for drag operations (e.g., "Press Space or Enter to start dragging, use arrow keys to move, Space or Enter to commit, Escape to cancel."). The content of this description comes from `i18nStrings.dragHandleAriaDescription`.
  * `aria-grabbed`: Set to `"true"` when the item is actively being dragged (keyboard or mouse), `"false"` otherwise.
* **Resize Handles (within `BoardItem.vue`):**
  * Typically `<button>` or elements with `role="slider"` (as resizing is like adjusting size on a range).
  * `tabindex="0"`: Make them focusable.
  * `aria-label`: Provided by `i18nStrings.resizeHandleAriaLabel(direction)`, e.g., "Resize bottom-right".
  * `aria-describedby`: Point to hidden instructions for resize operations. Content from `i18nStrings.resizeHandleAriaDescription`.
  * If using `role="slider"`:
    * `aria-orientation`: "horizontal", "vertical", or undefined.
    * `aria-valuemin`, `aria-valuemax`, `aria-valuenow`: Represent the current size and range in grid units (e.g., `columnSpan`).
* **Live Region (`aria-live`):**
  * A dedicated, visually hidden element with `aria-live="assertive"` and `aria-atomic="true"` is needed to announce status changes to screen readers.
  * Announcements triggered by:
    * Drag/Resize Start: Use `i18nStrings.liveAnnouncementDndStarted`.
    * Item Reordered (Keyboard): Use `i18nStrings.liveAnnouncementDndItemReordered` providing new position.
    * Item Resized (Keyboard): Use `i18nStrings.liveAnnouncementDndItemResized` providing new size.
    * Drag/Resize Commit: Use `i18nStrings.liveAnnouncementDndCommit`.
    * Drag/Resize Cancel: Use `i18nStrings.liveAnnouncementDndDiscarded`.
    * Item Removed (via Dismiss): Use `i18nStrings.liveAnnouncementItemRemoved`.

## 3. Keyboard Navigation & Interaction

* **Focus Order:** Use `Tab` and `Shift+Tab` to move focus between focusable elements (drag handles, resize handles, interactive elements *within* item content). The order should be logical, typically moving through items row by row or column by column.
* **Drag Operation:**
    1. Focus the drag handle (`Tab`).
    2. Press `Space` or `Enter` to activate drag mode. (Announce start, set `aria-grabbed="true"`).
    3. Use `Arrow Keys` to move the item one grid unit in the desired direction. Each key press:
        * Calculates the new position.
        * Calls `resolveLayoutChanges`.
        * Emits `@items-change`.
        * Updates visual position.
        * Announces the new position via live region (`liveAnnouncementDndItemReordered`).
    4. Press `Space` or `Enter` to commit the drag. (Announce commit, set `aria-grabbed="false"`).
    5. Press `Escape` to cancel the drag. (Announce discard, revert position visually, set `aria-grabbed="false"`).
* **Resize Operation:**
    1. Focus the desired resize handle (`Tab`).
    2. Press `Space` or `Enter` to activate resize mode. (Announce start).
    3. Use `Arrow Keys` (potentially with `Shift` modifier, e.g., Shift+Right increases width) to change the size by one grid unit. Each key press:
        * Calculates the new size/position.
        * Calls `resolveLayoutChanges`.
        * Emits `@items-change`.
        * Updates visual size/position.
        * Announces the new size via live region (`liveAnnouncementDndItemResized`). Update `aria-valuenow` if using `role="slider"`.
    4. Press `Space` or `Enter` to commit the resize. (Announce commit).
    5. Press `Escape` to cancel the resize. (Announce discard, revert size/position).
* **Dismissing Items:** If an item contains a dismiss button rendered via the `#item` slot, ensure it's focusable and triggers the `utils.dismiss()` call when activated (`Enter`/`Space`).

## 4. `BoardI18nStrings` Interface Structure (Example)

```typescript
export interface BoardI18nStrings {
  boardLabel?: string;
  liveAnnouncementDndStarted?: (operationType: 'resize' | 'drag') => string;
  liveAnnouncementDndItemReordered?: (
    position: { x: number; y: number }, // 1-based grid coords
    totalItems: number
  ) => string;
  liveAnnouncementDndItemResized?: (
    size: { width: number; height: number } // columnSpan/rowSpan
  ) => string;
  liveAnnouncementDndCommit?: (operationType: 'resize' | 'drag') => string;
  liveAnnouncementDndDiscarded?: (operationType: 'resize' | 'drag') => string;
  liveAnnouncementItemRemoved?: (itemHeader: string | undefined) => string;

  itemAriaRoleDescription?: string;
  dragHandleAriaLabel?: string;
  dragHandleAriaDescription?: string;
  resizeHandleAriaLabel?: (direction: 'N' | 'S' | 'E' | 'W' | 'NW' | 'NE' | 'SW' | 'SE') => string;
  resizeHandleAriaDescription?: string;
}
```

*Defaults should be provided for all strings in English.*

## 5. Implementation Notes

* The `useBoardAccessibility` composable can manage the live region announcements and potentially provide helper functions for generating ARIA labels based on `i18nStrings`.
* `BoardItem.vue` will be responsible for rendering elements with the correct ARIA attributes based on props and interaction state.
* Keyboard event handling logic in `useBoardInteractions` or `BoardItem.vue` needs to carefully manage focus, state changes, and trigger ARIA announcements.
* Generating and managing unique IDs for `aria-describedby` might require a utility function or a simple counter.
