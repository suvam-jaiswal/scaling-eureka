# Cloudscape Board - Design and Styling Deep Dive

This document outlines the visual design goals and CSS styling strategy for the `vue-cloudscape-board` component, aiming to align with the aesthetic and principles of the AWS Cloudscape Design System.

## 1. Visual Goals

* **Consistency with Cloudscape:** The primary goal is to visually resemble the Cloudscape Board component as closely as possible in terms of layout, spacing, typography, borders, colors, and interactive element appearance.
* **Clarity:** The grid structure, item boundaries, and interactive elements (drag/resize handles) should be clearly discernible.
* **Efficiency:** The design should support efficient scanning and interaction within the dashboard context. Avoid unnecessary visual clutter.
* **Responsiveness:** Visuals must adapt cleanly to the single-column layout on smaller screens.

## 2. Core Visual Elements & Styling

* **Board Container:**
  * Likely has subtle padding (matching the `gap`).
  * Background color should match the standard Cloudscape container/page background.
* **Board Items (`BoardItem.vue`):**
  * **Container:** Typically card-like appearance with defined borders (e.g., `1px solid #e0e0e0`), background color (e.g., `#ffffff`), and subtle box-shadow (when interacting?). Rounded corners (e.g., `4px`).
  * **Spacing:** Positioned absolutely based on layout engine calculations, with gutters defined by the `gap` parameter.
  * **Header/Footer (if implemented):** Follow Cloudscape patterns for card headers/footers (padding, typography, potential separators).
* **Drag Handle:**
  * Usually an icon (e.g., drag indicator dots/lines) placed prominently, often in the item header.
  * Clear visual affordance (looks draggable).
  * Should have distinct `:hover` and `:focus` states (e.g., background change, outline).
  * Cursor should change to `grab` or `grabbing` on hover/drag.
* **Resize Handles:**
  * Subtle visual indicators, often small squares or directional arrows, placed at corners or edges (commonly bottom-right).
  * May only appear on hover/focus of the `BoardItem` or during a resize operation to reduce visual noise.
  * Clear `:hover` and `:focus` states.
  * Cursor should change to the appropriate resize direction (e.g., `nwse-resize`, `nesw-resize`, `ew-resize`, `ns-resize`).
* **Typography:** Use Cloudscape's standard font stack, sizes, and weights for any text within the component itself (e.g., labels, instructions). Item content typography is determined by the consumer via the `#item` slot.
* **Spacing Unit:** Base internal padding and potentially `gap`/`rowHeight` defaults on Cloudscape's spacing tokens (often multiples of 4px or 8px).

## 3. CSS Strategy

* **Scoped CSS / CSS Modules:** Use Vue's `<style scoped>` or CSS Modules (`<style module>`) for component-specific styles to prevent conflicts. Prefer Scoped CSS for simplicity unless complex class composition is needed.
* **CSS Variables (Custom Properties):**
  * Define key themeable aspects as CSS variables with sensible defaults matching Cloudscape. This allows consumers to customize the appearance.
  * Examples:
    * `--vue-board-gap`: Default `10px`.
    * `--vue-board-item-bg`: Default `#ffffff`.
    * `--vue-board-item-border-color`: Default `#e0e0e0`.
    * `--vue-board-item-border-radius`: Default `4px`.
    * `--vue-board-handle-color`: Default color for handles.
    * `--vue-board-handle-hover-bg`: Background for handle hover.
  * These variables should be defined on the root element of `Board.vue`.
* **Class Naming:** Use a consistent naming convention (e.g., BEM-like `vue-board__item`, `vue-board__item--dragging`, `vue-board__drag-handle`).
* **Minimalism:** Keep component styles focused on layout, positioning, and core interactive elements. Avoid overly opinionated styling of the *content* area, which is the consumer's responsibility.

## 4. Theming

* By using CSS variables for key visual properties, the component supports basic theming. Consumers can override these variables in their own CSS to match their specific application theme (e.g., dark mode).
* Ensure default styles provide sufficient contrast and meet accessibility guidelines.

## 5. Implementation Notes

* Create base style files (`src/styles/variables.css`, `src/styles/board.css`) to define CSS variables and core layout styles.
* Import necessary styles into `Board.vue` and `BoardItem.vue`.
* Apply dynamic classes based on interaction state (e.g., `isDragging`, `isResizing`) to modify appearance.
