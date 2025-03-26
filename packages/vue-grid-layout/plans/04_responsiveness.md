# Cloudscape Board - Responsiveness Deep Dive

This document outlines the responsive design strategy for the `vue-cloudscape-board` component, aiming to replicate the behavior observed in the AWS Cloudscape Board component.

## 1. Core Behavior

* **Primary Goal:** Ensure usability and readability on a wide range of screen sizes, from large desktops to small mobile devices.
* **Observed Cloudscape Behavior:** The most prominent responsive change is the transition to a **single-column layout** below a certain container width threshold. In this mode, items stack vertically, preserving their relative order as much as possible.

## 2. Mechanism (`useBoardResponsiveness` Composable)

* **Container Width Monitoring:**
  * Utilize the `ResizeObserver` API on the root element of the `Board.vue` component. This efficiently detects changes in the component's own width, independent of window resizing.
  * Store the current container width in a reactive ref (e.g., `containerWidth`).
* **Breakpoint Definition:**
  * Define a breakpoint threshold (e.g., `singleColumnBreakpoint = 768` pixels). This value might need refinement based on testing and visual comparison with Cloudscape. It could potentially become a configurable prop in the future.
* **Reactive State:**
  * Maintain a reactive computed property or ref, `isSingleColumn`, based on the `containerWidth` and the `singleColumnBreakpoint`.
  * `const isSingleColumn = computed(() => containerWidth.value < singleColumnBreakpoint);`

## 3. Impact on Layout Engine (`useGridLayout`)

The `isSingleColumn` state directly influences the layout calculations:

* **`calculateItemStyle` Function:**
  * **Input:** This function must accept `isSingleColumn` as an argument or access it from the shared composable scope.
  * **Conditional Logic:**
    * **If `!isSingleColumn` (Multi-Column):** Perform calculations as described in `plans/02_layout_engine.md` (Section 2, Multi-Column Mode), using the standard 12 columns (or configured columns).
    * **If `isSingleColumn` (Single-Column):**
      * Ignore `itemDefinition.columnOffset` (effectively always 0).
      * Ignore `itemDefinition.columnSpan` (effectively always 1).
      * Calculate `itemWidth` based on `containerWidth` minus horizontal gaps/padding.
      * Calculate `itemHeight` based on `itemDefinition.rowSpan` and `rowHeight` (height usually remains based on original intent).
      * Calculate `itemLeft` based on container padding/gap.
      * **Crucially, calculate `itemTop` based on vertical stacking.** This requires knowing the position and height of the item visually preceding it in the single-column flow. The layout engine needs to determine this order (e.g., sort items by original `rowOffset` then `columnOffset`) and calculate cumulative top offsets. `itemTop = previousItem.top + previousItem.height + gap`.

* **`resolveLayoutChanges` Function:**
  * The collision/placement logic might need adjustments for single-column mode.
  * Dragging in single-column mode primarily involves changing the vertical stacking order. Collisions are simpler – dragging an item might push items below it further down.
  * Resizing (vertically) in single-column mode might also push subsequent items down. Horizontal resizing is generally not applicable or meaningful in this mode.

## 4. Impact on Interactions (`useBoardInteractions`)

* **Drag:** When `isSingleColumn` is true, drag interactions should primarily constrain movement vertically. Horizontal position is fixed. The drop logic determines the new vertical stacking order.
* **Resize:** When `isSingleColumn` is true, horizontal resize handles should likely be disabled or hidden. Vertical resizing remains possible and affects the item's `rowSpan` and calculated `height`, potentially pushing items below it.
* **Keyboard:** Keyboard navigation for moving items should primarily use Up/Down arrows to change the stacking order when `isSingleColumn` is true. Left/Right arrows might be disabled or have no effect. Resizing via keyboard would similarly focus on vertical adjustments.

## 5. Visual Styling

* CSS might need adjustments based on `isSingleColumn`. For example, applying specific styles or classes to the board container or items when in single-column mode.
* Ensure smooth transitions if possible, although Cloudscape's transition appears to be a direct reflow rather than an animation.

## 6. Implementation Notes

* The `useBoardResponsiveness` composable should encapsulate the `ResizeObserver` logic and expose the reactive `containerWidth` and `isSingleColumn` states.
* `useGridLayout` and `useBoardInteractions` will consume the `isSingleColumn` state to adapt their behavior.
* Careful calculation of `itemTop` in single-column mode is critical, requiring knowledge of the stacking order and dimensions of preceding items. This might involve pre-calculating the single-column layout whenever `items` or `isSingleColumn` changes.
