# Comprehensive Plan for `vue-cloudscape-board` (Consolidated)

This document outlines the consolidated plan for creating the `vue-cloudscape-board` library. It summarizes the key decisions and architecture, referencing detailed deep-dive documents within the `/plans` directory for specifics.

**Supporting Documents:**

* `01_api_and_props.md`: Details on props, events, slots, and the controlled component pattern.
* `02_layout_engine.md`: Grid system, coordinate calculation, push/swap collision algorithm.
* `03_interaction_logic.md`: Drag, resize, and keyboard interaction mechanics.
* `04_responsiveness.md`: Single-column layout adaptation.
* `05_accessibility.md`: ARIA attributes, keyboard navigation, live regions, i18nStrings.
* `06_design_and_styling.md`: Visual goals, CSS strategy, theming via CSS variables.
* `07_interaction_behavior_details.md`: Visual feedback during interactions (ghosts, highlights).
* `08_design_philosophy.md`: Guiding principles (Clarity, Efficiency, Consistency, Responsiveness, Accessibility).
* `09_architecture_diagrams.md`: Visual diagrams of component structure, data flow, and internal architecture.

## 1. Project Goal (Ref: `08_design_philosophy.md`)

Create a Vue 3 component library (`vue-cloudscape-board`) replicating the core functionality, API, interaction model, visual design, and accessibility features of the AWS Cloudscape Board component, adhering to its design philosophy. Built with Vue 3, TypeScript, and Vite.

## 2. Core Components (Ref: `09_architecture_diagrams.md`)

* `Board.vue`: The main container component, orchestrating layout and interactions.
* `BoardItem.vue`: Internal component rendered via `v-for`, responsible for displaying individual item content (via slot) and handling item-specific interactions/styling.

## 3. `Board.vue` - Props (Ref: `01_api_and_props.md`)

* `items`: `Array<BoardItem>` (Required). Defines the complete layout state. See `01_api_and_props.md` for `BoardItem` structure.
* `i18nStrings`: `BoardI18nStrings` (Optional). For accessibility and localization. See `05_accessibility.md` for structure.
* `empty`: (Optional, Slot preferred). Content for empty state.

## 4. `Board.vue` - Events (Ref: `01_api_and_props.md`)

* `@items-change`: `{ items: Array<BoardItem> }`. Core event for the controlled component pattern. Emitted after drag/resize. Parent **must** handle this to update the `:items` prop.
* `@dismiss-item`: `{ itemId: string }`. Emitted when item requests removal via `utils.dismiss()`.
* `@trigger-resize`: `{ itemId: string }`. Emitted when item content might have changed size via `utils.triggerResize()`.

## 5. `Board.vue` - Slots (Ref: `01_api_and_props.md`)

* `#item="{ item, utils }"`: (Scoped Slot, Required). Provides `item: BoardItem` and `utils: { dismiss, triggerResize }`. Consumer renders item content here.
* `#empty`: (Optional Slot). Content when `items` is empty.

## 6. `BoardItem.vue` (Internal Component) (Ref: `01_api_and_props.md`, `06_design_and_styling.md`)

* **Props (Internal):** Receives calculated style, `item` data, `i18nStrings`, interaction state.
* **Slots:** Default slot for content from `Board.vue`'s `#item` slot.
* **Functionality:** Renders item container, applies positioning/sizing, includes drag/resize handles, manages ARIA attributes, handles keyboard navigation focus. Visually styled like a Cloudscape card.

## 7. State Management (Ref: `01_api_and_props.md`, `09_architecture_diagrams.md`)

* **Strict Controlled Component:** Parent application owns the `items` state. `Board.vue` receives `items` via prop and emits `@items-change` with the *proposed* new state after interactions.
* **Minimal Internal State:** `Board.vue` only tracks transient state during an interaction (e.g., `isDragging`, `draggedItemId`, pointer position).

## 8. Layout Engine (Composable: `useGridLayout`) (Ref: `02_layout_engine.md`)

* **Grid Parameters:** 12 columns, configurable `rowHeight`, `gap`. Assumes container padding equals `gap`.
* **Calculation (`calculateItemStyle`):** Translates grid units to pixel styles (`top`, `left`, `width`, `height`), adapting for single-column mode.
* **Collision/Placement (`resolveLayoutChanges`):** Implements the **push/swap algorithm** to resolve overlaps after drag/resize, ensuring a valid layout is proposed. Returns a new `items` array.

## 9. Interaction Logic (Composable: `useBoardInteractions`) (Ref: `03_interaction_logic.md`, `07_interaction_behavior_details.md`)

* **Technology:** Use VueUse `useDraggable` / Pointer Events via custom directives.
* **Drag/Resize:** Handle initiation, movement (with temporary visual updates), and termination. On termination, calculate target definition, call `resolveLayoutChanges`, and emit `@items-change`.
* **Visual Feedback:** Implement item lifting/opacity changes, cursor changes, handle visibility/styling, **grid cell highlighting** (target cells vs other cells), and smooth animations for pushed items (CSS transitions). Consider ghost/placeholder element.
* **Keyboard:** Full keyboard support for drag/resize using standard patterns (Enter/Space to start/commit, Arrows to move/resize, Escape to cancel). Each step triggers `resolveLayoutChanges` and `@items-change`.

## 10. Responsiveness (Composable: `useBoardResponsiveness`) (Ref: `04_responsiveness.md`)

* **Mechanism:** Use `ResizeObserver` to monitor container width.
* **Behavior:** Transition to a **single-column layout** below a defined breakpoint (`isSingleColumn` state).
* **Impact:** Layout calculations (`calculateItemStyle`) and interaction logic adapt for single-column stacking and interaction constraints.

## 11. Accessibility (Composable: `useBoardAccessibility`) (Ref: `05_accessibility.md`)

* **Priority:** High (AAA). Adhere to WCAG 2.1 AA+.
* **Implementation:** Use ARIA attributes (`role`, `aria-label`, `aria-grabbed`, `aria-describedby`, etc.), manage focus logically, provide ARIA live region announcements for keyboard operations, and support `i18nStrings` for customization.

## 12. Styling (Ref: `06_design_and_styling.md`)

* **Strategy:** Scoped CSS or CSS Modules.
* **Customization:** Use CSS variables for key themeable properties (gap, colors, borders, radius) with Cloudscape-like defaults.
* **Goal:** Visually align with Cloudscape aesthetic.

## 13. Directory Structure (Ref: `09_architecture_diagrams.md`)

```
src/
├── components/
│   ├── Board.vue
│   └── BoardItem.vue # Internal
├── composables/
│   ├── useGridLayout.ts
│   ├── useBoardInteractions.ts
│   ├── useBoardResponsiveness.ts
│   └── useBoardAccessibility.ts
├── types/
│   └── index.ts # BoardItem, BoardItemDefinition, BoardI18nStrings etc.
├── styles/
│   ├── board.css # Core
│   └── variables.css # CSS Vars
└── main.ts # Library entry point
```

## 14. Documentation & Examples

* **Demo:** Create `example/` directory with Vite for a live demo.
* **README:** Comprehensive documentation covering API, usage, customization.
* **Storybook:** Consider for isolated development and showcasing variations.

## 15. Build & Publish

* **Vite Config:** Ensure library mode is correctly set up.
* **package.json:** Define `main`, `module`, `types`, `exports`, `files`, `peerDependencies`.
* **Scripts:** Include `build`, `lint`, `typecheck`.

This consolidated plan, supported by detailed documents (01-09) and diagrams, provides a robust roadmap for implementation.
