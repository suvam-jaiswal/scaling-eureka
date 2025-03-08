# Interact.js Overview

Interact.js is a JavaScript library for drag and drop, resizing, and multi-touch gestures on modern browsers. It provides a unified API for mouse, touch, and pointer events, smoothing out browser differences. This library is free and open-source and includes powerful features like momentum-based inertia and modular snapping and restriction functionality out of the box. In practice, this means you can easily add natural-feeling drag-and-drop UI elements, resizable panels, draggable grid layouts, touch gestures (like pinch/zoom or rotate), and more to your web applications.

## Key Features:
 * **Draggable Elements**: Make any DOM element draggable with full control over drag start, movement, and end events.
 * **Resizable Elements**: Enable on-the-fly resizing of elements (with optional constraints like aspect ratio or specific edges).
 * **Multi-touch Gestures**: Support pinch, rotate, and other multi-pointer gestures with gesture events (e.g., for touch-based UIs).
 * **Inertia & Throwing**: Optionally continue movement after release for a natural "throwing" effect, gradually decelerating (inertia).
 * **Snapping to Grid or Points**: Snap drag or resize movements to a grid or specific coordinates for precise alignment.
 * **Modifiers (Constraints)**: Easily restrict movement within a boundary (parent element, viewport, etc.) or enforce minimum/maximum sizes.
 * **Dropzone & Collisions**: Designate drop targets to build drag-and-drop interfaces with events for when draggable items enter or drop onto targets.
 * **Simultaneous Interactions**: Allow multiple elements to be dragged/resized at the same time (multi-pointer and multi-element support).
 * **Unified Pointer Events**: Abstracts away differences between touch, mouse, and pointer events, giving consistent event data on all devices.
 * **Performance Focus**: Interact.js is lightweight and doesn't impose a heavy framework; it optimizes pointer event handling and only modifies the DOM to update the cursor style by default.

## How Interact.js Works

Interact.js works by letting you create an "Interactable" for any element or group of elements. You activate features (draggable, resizable, etc.) on these interactables and define event listeners for interactions. For example, you can make an element draggable and listen for drag events to manually update the element's position. Notably, Interact.js does not move or resize elements for you by itself – instead, it provides the events and calculations (such as drag distance, pointer coordinates, etc.), and you apply those to your element in your own code. This design gives you full control over the DOM updates, allowing integration with frameworks like Vue.js and state management as needed.

Because the library doesn't automatically change your element's position or size (except for showing a temporary cursor style change), you have the freedom to decide how an interaction affects your application state. For instance, on a dragmove event you might update the element's CSS transform or Vue component state to reflect the new position. On a resizemove event, you can adjust the element's width/height style or emit an event to update a layout model. Interact.js simply makes it easier to handle the low-level pointer math and offers add-ons (modifiers) to handle common constraints like boundaries and snapping.

## Common Use Cases

Interact.js can be used anywhere you need interactive movement or sizing of elements in the browser. Some common use cases include:
 * **Draggable Widgets and Cards**: Create drag-and-drop dashboards or kanban boards where cards can be rearranged via drag.
 * **Resizable Panels and Dialogs**: Let users resize split panes, modal dialogs, or images by dragging from edges or corners.
 * **Interactive Grid Layouts**: Build a grid system (like a dashboard or photo gallery) where items can be repositioned and resized with snap-to-grid behavior for neat alignment.
 * **Drag and Drop File Uploads or Sortable Lists**: Use drag interactions and dropzones to implement file upload targets or reordering list items (by dragging an item and dropping it into a new position).
 * **Image Croppers or Selection Regions**: Allow users to draw or move/resize a rectangular selection on an image (draggable + resizable with aspect ratio constraints).
 * **Custom Sliders and Controls**: Make custom UI controls (like sliders, range selectors, knob dials) draggable for user input.
 * **Touch Gestures on Mobile**: Implement pinch-zoom on images or maps, rotate gestures on elements, or a draw/paint canvas that responds to multi-touch using the gesturable features.
 * **Games and Graphics Applications**: For example, dragging game pieces on a board, resizing shapes in a diagramming tool, or implementing a simple drag-to-connect interface.

Because Interact.js is framework-agnostic, it integrates well with Vue.js (as well as React, Angular, etc.) by letting you handle DOM updates and state in the Vue way (e.g., using reactive data or Vuex) while Interact.js manages the pointer events. In the following sections, we'll see how to set up Interact.js in a Vue 3 project with TypeScript and go from basic usage to advanced techniques like grid snapping and custom event handling.

---

[← Back to Index](./index.md) | [Next: Installation →](./02-installation.md)