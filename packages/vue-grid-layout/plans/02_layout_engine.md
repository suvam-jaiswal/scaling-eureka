# Cloudscape Board - Layout Engine Deep Dive

This document details the underlying grid system, coordinate calculations, and the placement/collision resolution algorithm expected for the `vue-cloudscape-board` component, based on analysis of the Cloudscape Board behavior.

## 1. Grid System Parameters

The layout engine operates on a virtual grid defined by several parameters.

* **Columns:** Assumed to be a fixed **12-column grid**. This is standard in many grid systems and aligns with common design practices. We might consider making this configurable later, but starting with 12 simplifies initial implementation.
* **Row Height (`rowHeight`):** Defines the height of a single row unit in pixels. This is a crucial parameter for calculating the vertical size and position of items. This should likely be a prop or a configurable constant (e.g., default to `50px`).
* **Gap (`gap`):** Defines the space *between* grid items, both horizontally and vertically, in pixels. This should also be a prop or configurable constant (e.g., default to `10px`). Cloudscape appears to use a consistent gap.
* **Container Padding:** While Cloudscape doesn't explicitly expose a `containerPadding` prop like `react-grid-layout`, the visual layout implies some padding. We can either assume padding equal to the `gap` or introduce an internal padding value. For simplicity, assuming padding equals `gap` is a reasonable starting point.

## 2. Coordinate and Size Calculation (`calculateItemStyle`)

This function translates the abstract grid units (`columnOffset`, `rowOffset`, `columnSpan`, `rowSpan`) from an item's `definition` into concrete CSS pixel values (`top`, `left`, `width`, `height`).

* **Inputs:**
  * `itemDefinition`: The `{ columnOffset, rowOffset, columnSpan, rowSpan }` object.
  * `gridParams`: An object containing `{ columns, rowHeight, gap, containerWidth }`.
  * `isSingleColumn`: Boolean indicating if the responsive single-column layout is active.
* **Calculations (Multi-Column Mode):**
  * `containerWidth`: The current pixel width of the Board container (obtained via `ResizeObserver`).
  * `effectiveWidth`: `containerWidth - (gap * (columns - 1)) - (padding * 2)` (Width available for columns themselves). Let's assume `padding = gap`. So, `effectiveWidth = containerWidth - (gap * (columns + 1))`.
  * `columnWidth`: `effectiveWidth / columns`.
  * `itemWidth`: `(columnSpan * columnWidth) + ((columnSpan - 1) * gap)`.
  * `itemHeight`: `(rowSpan * rowHeight) + ((rowSpan - 1) * gap)`.
  * `itemLeft`: `(columnOffset * columnWidth) + ((columnOffset + 1) * gap)` (assuming padding = gap).
  * `itemTop`: `(rowOffset * rowHeight) + ((rowOffset + 1) * gap)` (assuming padding = gap).
* **Calculations (Single-Column Mode):**
  * `columns`: Effectively 1.
  * `columnOffset`: Always 0.
  * `columnSpan`: Effectively 1 (or the max columns, which is 1).
  * `itemWidth`: `containerWidth - (gap * 2)` (Full width minus padding).
  * `itemHeight`: `(rowSpan * rowHeight) + ((rowSpan - 1) * gap)` (Height calculation remains similar, based on original `rowSpan`).
  * `itemLeft`: `gap` (Positioned with left padding).
  * `itemTop`: Calculated based on the `y` position of the *previous* item in the visual stack + its height + `gap`. This requires iterating through items sorted by their single-column `y` position. The `rowOffset` from the original definition is less relevant here; vertical position depends on stacking order.
* **Output:** An object `{ top: string; left: string; width: string; height: string; }` containing CSS pixel values.

## 3. Placement and Collision Resolution (`resolveLayoutChanges`)

This is the core logic triggered after a drag or resize interaction determines a *potential* new position/size for an item. It ensures that the resulting layout is valid (no overlaps) by adjusting other items.

* **Algorithm:** Push/Swap Mechanism.
* **Inputs:**
  * `currentItems`: The current `Array<BoardItem>` representing the layout *before* the change is committed.
  * `changedItemId`: The `id` of the item that was dragged or resized.
  * `newItemDefinition`: The proposed new `{ columnOffset, rowOffset, columnSpan, rowSpan }` for the `changedItemId`.
* **Steps (Conceptual):**
    1. **Create Tentative Layout:** Start with `currentItems`. Update the definition of the `changedItemId` with `newItemDefinition`.
    2. **Detect Collisions:** Iterate through all pairs of items in the tentative layout. Check if any two items overlap based on their `columnOffset`, `rowOffset`, `columnSpan`, and `rowSpan`.
        * Overlap check: `(itemA.x < itemB.x + itemB.w) && (itemA.x + itemA.w > itemB.x) && (itemA.y < itemB.y + itemB.h) && (itemA.y + itemA.h > itemB.y)` (using grid units).
    3. **Resolve Collisions (Iterative Push/Swap):**
        * If a collision is detected between the `changedItem` and another `itemB`:
            * Determine the direction of movement (e.g., `changedItem` moved down-right).
            * Attempt to **push** `itemB` out of the way (e.g., move `itemB` down by `changedItem.rowSpan` or sideways by `changedItem.columnSpan`).
            * If pushing `itemB` causes *it* to collide with `itemC`, recursively attempt to push `itemC`.
            * If pushing is not possible (hits grid boundary or another immovable item), consider a **swap** if appropriate, although Cloudscape seems to favor pushing.
            * This needs a robust algorithm to handle chain reactions and avoid infinite loops. A common approach is to process collisions iteratively, moving items downwards or rightwards until no collisions remain with the `changedItem`. Then, potentially run a compaction step if desired (though Cloudscape's automatic compaction seems less aggressive than `react-grid-layout`'s).
        * Keep track of moved items to avoid redundant checks.
    4. **Boundary Checks:** Ensure no item is pushed outside the defined grid boundaries (e.g., `columnOffset < 0` or `columnOffset + columnSpan > columns`).
    5. **Final Layout:** Once all collisions involving the `changedItem` (and subsequent chain reactions) are resolved, the resulting `items` array is the new proposed layout.
* **Output:** A *new* `Array<BoardItem>` representing the resolved, valid layout.
* **Considerations:**
  * **Performance:** Collision detection and resolution can be computationally intensive, especially with many items. Optimization might be needed (e.g., spatial indexing if performance becomes an issue).
  * **Stability:** The algorithm should be deterministic and stable, producing a consistent result for the same input.
  * **Single-Column Mode:** The resolution logic might simplify in single-column mode, primarily involving adjusting the vertical stacking order (`rowOffset`) based on swaps.

## 4. Implementation Notes

* The layout engine logic should reside primarily within the `useGridLayout` composable.
* Reactive refs should be used for grid parameters (`rowHeight`, `gap`, `containerWidth`) so that calculations update automatically when they change.
* The `resolveLayoutChanges` function should operate on plain data structures and return a new array to ensure immutability, fitting well with the controlled component pattern.
