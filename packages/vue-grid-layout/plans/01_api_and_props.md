# Cloudscape Board - API and Props Deep Dive

This document details the Application Programming Interface (API) of the AWS Cloudscape Board component, focusing on its props, the structure of the data it expects, the events it emits, and its rendering mechanism.

## 1. `<Board>` Component Props

The primary interface for configuring and interacting with the board.

* **`items`**: `Array<BoardItem>` (Required)
  * **Description:** An array representing the complete state of the board, including each item's content identifier, data, and layout definition. The order of items in this array might influence initial placement or resolution in edge cases, but the primary layout is driven by the `definition` object within each item.
  * **Structure:** See Section 2 below.
  * **Pattern:** This prop makes the Board a **controlled component**. The application state is the single source of truth for the layout.

* **`renderItem`**: `(item: BoardItem, utils: RenderUtils) => VNode | JSX.Element` (Required - *Vue equivalent will likely be a scoped slot*)
  * **Description:** A function (or scoped slot in Vue) responsible for rendering the actual content of each board item.
  * **Arguments:**
    * `item`: The `BoardItem` object from the `items` array corresponding to the item being rendered.
    * `utils`: An object containing utility functions the rendered content can call:
      * `dismiss: () => void`: Signals that the user wants to remove this item. Triggers the `@dismiss-item` event on the Board.
      * `triggerResize: () => void`: Signals that the item's content may have changed height, potentially requiring the Board to recalculate layout or row spans. Triggers the `@trigger-resize` event.
  * **Vue Adaptation:** This will be implemented as a scoped slot named `#item`. Example: `<template #item="{ item, utils }"> ... render content using item.data ... <button @click="utils.dismiss()">Remove</button> </template>`.

* **`onItemsChange`**: `(event: { items: Array<BoardItem> }) => void` (Required - *Vue equivalent: `@items-change` event*)
  * **Description:** The core event callback triggered after a user interaction (drag or resize) successfully completes and results in a new layout arrangement.
  * **Payload:** An object containing the `items` property, which is a *new array* representing the proposed complete layout state after the interaction.
  * **Responsibility:** The application **must** listen for this event and update its own state, passing the new `items` array back into the Board's `items` prop to visually reflect the change. Failure to do so will result in the board reverting to the previous state visually.

* **`empty`**: `VNode | JSX.Element | string` (Optional - *Vue equivalent: `#empty` slot*)
  * **Description:** Content to display when the `items` array is empty or null.
  * **Vue Adaptation:** This will be implemented as a regular slot named `#empty`. Example: `<template #empty>No items to display.</template>`.

* **`i18nStrings`**: `BoardI18nStrings` (Optional)
  * **Description:** An object providing localized strings for ARIA labels, status announcements, and control descriptions used internally by the Board and its items. See `plans/05_accessibility.md` for the detailed structure of `BoardI18nStrings`.
  * **Purpose:** Enhances accessibility and allows for internationalization.

## 2. `BoardItem` Data Structure (Element of the `items` Prop Array)

Defines a single item within the board.

* **`id`**: `string` (Required)
  * **Description:** A unique identifier for this specific item instance. Used internally for tracking and associating rendered elements with data. Must be stable across renders and updates.

* **`definition`**: `BoardItemDefinition` (Required)
  * **Description:** Defines the item's placement and dimensions on the grid.
  * **Structure:**
    * `columnOffset`: `number` (Required) - The 0-based index of the column where the item starts.
    * `rowOffset`: `number` (Required) - The 0-based index of the row where the item starts.
    * `columnSpan`: `number` (Required) - The number of grid columns the item occupies. Must be >= 1.
    * `rowSpan`: `number` (Required) - The number of grid rows the item occupies. Must be >= 1.

* **`data`**: `any` (Optional)
  * **Description:** Arbitrary data associated with this board item. This data is passed to the `renderItem` function (or `#item` slot) and is intended to be used for rendering the item's specific content (e.g., chart data, text content, configuration).

## 3. Events Emitted by `<Board>` (Vue `@event` syntax)

* **`@items-change`**: `{ items: Array<BoardItem> }`
  * **Trigger:** After successful completion of a drag or resize interaction.
  * **Purpose:** Informs the application of the new layout state. Application MUST update the `items` prop.

* **`@dismiss-item`**: `{ itemId: string }`
  * **Trigger:** When the `dismiss` function provided to the `#item` slot is called from within an item's rendered content.
  * **Purpose:** Signals the application that the user initiated a removal request for the specified item. The application is responsible for filtering this item out of its state and updating the `items` prop.

* **`@trigger-resize`**: `{ itemId: string }`
  * **Trigger:** When the `triggerResize` function provided to the `#item` slot is called.
  * **Purpose:** Informs the Board and potentially the application that an item's content height might have changed asynchronously. The Board might use this to recalculate internal dimensions. The application *might* use this to adjust the `rowSpan` for the item if content height dictates required rows.

## 4. Summary of Controlled Component Pattern

1. Application maintains the `items` array in its state.
2. Application passes `items` state into the `<Board :items="appStateItems">` prop.
3. User interacts (drags/resizes) an item within `<Board>`.
4. `<Board>` calculates the resulting new layout.
5. `<Board>` emits `@items-change` with the new `items` array.
6. Application listens: `<Board @items-change="handleLayoutUpdate">`.
7. `handleLayoutUpdate` method updates the application's `appStateItems` with the received `items` array.
8. Vue's reactivity triggers a re-render of `<Board>` with the updated `items` prop, visually confirming the change.

This pattern ensures the application state remains the single source of truth for the board layout.
