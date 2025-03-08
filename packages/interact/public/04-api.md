# Interact.js API Reference

Interact.js provides a fluent API centered around the interact function and the Interactable objects it returns. Below is a breakdown of the main classes, methods, and configuration options available, along with brief examples.

## Global interact Function and Global Methods

The `interact(target)` function is the entry point. It accepts a CSS selector string, a single DOM Element, or an array of elements. It returns an Interactable instance that represents that target (or set of targets). Once you have an Interactable, you can enable actions like draggable, etc., and attach event listeners.

Example: `const dragItem = interact('.drag-item')` – now dragItem is an Interactable for all elements with class drag-item.

There are also some global configuration methods on the interact object:
* `interact.maxInteractions(newValue?)` – Get or set the maximum number of interactions allowed at one time. By default this is unlimited (Infinity). If you pass a number (e.g., `interact.maxInteractions(1)`), it will limit the total simultaneous active gestures/drags across the page.
* `interact.pointerMoveTolerance(newValue?)` – Get/set the distance (in pixels) the pointer must move before it's considered a drag/resize start. This helps ignore tiny jitters. Default is often a few pixels.
* `interact.debug()` – Returns an object for debugging internal states (mostly for development).
* `interact.stop()` – Programmatically stop all ongoing interactions (useful in certain cases if you need to cancel interactions).

## Interactable Object and Action Methods

An Interactable is returned by `interact(target)`. It has methods to enable or configure different actions:
* `interactable.draggable(options)` – Enable or disable dragging on this interactable. Pass true to enable with default settings, false to disable, or an options object to enable with specific settings.
* `interactable.resizable(options)` – Similarly, enable/disable resizing on this interactable.
* `interactable.gesturable(options)` – Enable multi-touch gestures on this interactable.
* `interactable.dropzone(options)` – Make this interactable a dropzone (to accept dropped draggables).
* `interactable.on(eventName, listener)` – Add an event listener for this interactable. You can use event names like 'dragmove', 'resizestart', 'gesturemove', 'down', 'tap', etc. (See Events section below for a list). You can also pass an object where keys are event names and values are listener functions, or an array of event names as the first argument.
* `interactable.off(eventName, listener)` – Remove an event listener.
* `interactable.set(options)` – A shorthand to apply multiple options at once. For example, you can pass an object containing keys like `{ draggable: true, dropzone: { accept: '.foo' }, ... }` to configure many aspects in one go.
* `interactable.unset()` – Destroy this interactable: remove all listeners and remove it from memory. This is important for cleanup (for example, call this when a Vue component is unmounted to avoid memory leaks).
* `interactable.origin(value)` – Get/set the origin for coordinate calculations. By default, it's either the page origin or the element's top-left (origin: 'self' can be used to treat the element's top-left as (0,0) for that element's coordinates). You might adjust origin when working with SVG or canvases.
* `interactable.ignoreFrom(value)` / `interactable.allowFrom(value)` – These correspond to the ignoreFrom and allowFrom options, but as methods if you want to set them separately.
* `interactable.options` – This property holds all configuration options (grouped by action). You typically won't need to access it directly, except for reading current settings.

The options object you pass to `draggable()`, `resizable()`, or `gesturable()` can include the following common fields (in addition to any action-specific ones):

| Option Name | Type | Description |
|-------------|------|-------------|
| listeners | Object or Function | Event listeners for this action's events. You can specify an object with keys 'start', 'move', 'end' (and in the case of gestures also 'inertiastart' if inertia is enabled), or use the onstart/onmove shorthand. |
| enabled | Boolean | Whether this action is enabled. (True by default when you call the method with an object or true. You can set to false to temporarily disable without fully unsetting.) |
| manualStart | Boolean | If true, don't auto-start the action on pointer move – you will start it via code (using interact.interactions.start(...)). Default is false (auto start on drag). |
| max | Number | Maximum number of simultaneous interactions on this Interactable (for this action). Default Infinity (no limit). Example: `interactable.draggable({ max: 2 })` would allow at most 2 pointers to drag two separate elements of this Interactable at once. |
| maxPerElement | Number | Max number of interactions per individual element (target) for this Interactable. Default is 1 (so one element can only be dragged by one pointer at a time). Increase if you want, for example, two pointers to drag the same element (unusual). |
| inertia | Boolean or Object | Enable inertia (throwing effect). true to use default settings, or an object to configure parameters like `{ resistance, minSpeed, endSpeed, allowResume, smoothEndDuration }`. |
| modifiers | Array | Array of modifiers to apply (snap, restrict, etc.) for this action. Use interact.modifiers.* to create them. They will only affect this Interactable's events for that action. |
| origin | String or Element or Object | The origin for coordinates (e.g., 'self' or an element or { x: number, y: number }). Default is the same as used in interact(target) call or 'parent'/page origin. Often left default. |
| allowFrom | String or Element | CSS selector or element that is the only place a drag/resize can start (acts as handle). If the user's pointer down target doesn't match this, the action won't start. |
| ignoreFrom | String or Element | CSS selector or element that will prevent the action from starting if the pointer down target is within this element. Useful to exclude certain parts of an element. |
| cursorChecker | Function | A function to dynamically set the cursor. By default, Interact.js sets cursors like move or nwse-resize on the <body> during interactions for feedback. You can override with a custom function that returns a CSS cursor string. |

There are also action-specific options:
* **Drag options**: e.g., startAxis and lockAxis. startAxis can be 'x', 'y', or 'xy' (default). If set to 'x', then a drag will only start if the initial movement is mostly horizontal; 'y' for vertical. lockAxis can be used to lock the drag movement to one axis – if set to 'x', the element will only move horizontally (any vertical movement is ignored). If 'start', it will lock to the axis in which the drag motion started (determined by whether the initial move was more horizontal or vertical).
* **Resize options**: e.g., squareResize (in older versions) is replaced by using the aspectRatio modifier. There's also an edges option (as we used) or an alternative handles array for specifying specific elements as resize handles.
* **Gesture options**: mainly just enabled or any custom gestures you want to differentiate (usually not needed; the defaults handle pinch/rotate together).

## Events and Listeners

Interact.js emits a variety of events. You can listen to events either by specifying listeners in the action options or by calling `.on()` on an Interactable (or even `interact.on()` for global events).

### Pointer Events
Low-level events for pointer interactions:
* `down`, `move`, `up` – correspond to mousedown/touchstart, mousemove/touchmove, mouseup/touchend.
* `tap` – fired on a quick tap/click (no drag).
* `doubletap` – double-click (two taps in quick succession).
* `hold` – fired if pointer is held down without moving for a certain duration (default ~600ms, configurable via pointerEvents({ holdDuration: ... })).

### Drag Events
When draggable is enabled:
* `dragstart`
* `dragmove`
* `draginertiastart` (if inertia is enabled and drag is thrown)
* `dragend`

### Resize Events
When resizable is enabled:
* `resizestart`
* `resizemove`
* `resizeinertiastart` (with inertia)
* `resizeend`

### Gesture Events
When gesturable is enabled:
* `gesturestart`
* `gesturemove`
* `gestureend`

### Dropzone Events
For dropzone interactables:
* `dropactivate` – a draggable that is accepted by this dropzone has started (could activate visual cues).
* `dropdeactivate` – that draggable's interaction ended (regardless of drop success).
* `dragenter` – a draggable has entered the dropzone (repeated if it leaves and re-enters).
* `dragleave` – a draggable left the dropzone.
* `dropmove` – a draggable is moving within the dropzone.
* `drop` – a draggable was dropped successfully onto the dropzone (drop condition met).

When handling drop events, `event.relatedTarget` is the dragged element and `event.target` is the dropzone.

Each Interact.js event object (like the event passed to listeners) has the following common properties (in addition to type-specific ones):
* `event.type` – the event type string (e.g., "dragmove").
* `event.target` – the element being interacted with (for high-level drag/resize events).
* `event.currentTarget` – in case of pointer events, the element on which the listener was bound.
* `event.interactable` – the Interactable object.
* `event.interaction` – the low-level Interaction instance (could be useful for advanced control).
* `event.timeStamp` – timestamp of the event.
* **Coordinates**: `event.pageX`, `event.pageY` (absolute page coords) and `event.clientX`, `clientY` (viewport coords) for the pointer position.
* `event.dx`, `event.dy` – change in x/y from the last move event (0 on start).
* `event.velocityX`, `event.velocityY` and `event.speed` – velocity of the pointer at this event.

Specific event types add more:
* **Drag events**: `event.dragEnter` / `dragLeave` (if using dropzones, these tell you dropzone interactions).
* **Resize events**: `event.rect` (object with `{ top, left, bottom, right, width, height }`) representing the element's new size/position, and `event.deltaRect` (change in those since last event), plus `event.edges` indicating which edges were active.
* **Gesture events**: `event.distance`, `event.angle`, `event.da` (delta angle), `event.scale`, `event.ds` (delta scale) as discussed.

### Event Listening Patterns
You can attach multiple events at once by space-delimited string or array:

```javascript
interactable.on('dragmove dragend', function(event) { ... });
interactable.on(['resizemove','resizeend'], function(event) { ... });
```

You can also remove listeners with `.off` similarly.

## Utilities and Miscellanea
* `interact.snappers` – This is an object with utility functions for snapping targets. We saw `interact.snappers.grid({ x, y })` which returns a function that calculates snap points on a grid. There are also snappers for other shapes, but grid is most common.
* `interact.modifiers` – Namespace for built-in modifiers. The key ones include snap, snapSize, snapEdges, restrict, restrictRect, restrictSize, restrictEdges, aspectRatio. Each is used by calling, e.g., `interact.modifiers.restrict({...})` and passing the result in the modifiers array. Modifiers can have their own options (like endOnly, enabled, etc., depending on type).
* **InteractEvent Class** – All events like DragEvent, ResizeEvent etc. inherit from InteractEvent. Typically you don't need to instantiate these; you just handle them in listeners. If needed, you can inspect `event instanceof InteractEvent`.
* **AutoStart and Dev Tools** – By default, Interact.js auto-starts actions when the pointer moves enough. There is an `interact.autoScroll` global config and the @interactjs/dev-tools plugin which can provide warnings in development. These are advanced topics; the dev-tools plugin can warn if you forgot to set touch-action: none on an element, for example. It's not used in production builds.

This API overview should give you a reference for what methods and options are available. For more detail on each method, the official documentation and TypeScript definitions (which you can find in node_modules/interactjs/types/) are useful. In the next section, we will walk through some tutorials to apply this API in real scenarios, especially focusing on building a draggable and resizable grid system in Vue 3.

## Integration with Module Bundlers and Frameworks

### Using with Vue.js 

Interact.js works well with Vue.js through lifecycle hooks. Here's a pattern for proper setup and cleanup:

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import interact from 'interactjs';

const elementRef = ref(null);
let interactable = null;

onMounted(() => {
  if (elementRef.value) {
    interactable = interact(elementRef.value)
      .draggable({
        // configuration
      })
      .on('dragmove', handleDragMove);
  }
});

onUnmounted(() => {
  if (interactable) {
    interactable.unset();
    interactable = null;
  }
});

function handleDragMove(event) {
  // Handle the movement
}
</script>

<template>
  <div ref="elementRef" class="draggable">Drag me</div>
</template>
```

### Using with React

For React components, use useEffect for setup and cleanup:

```jsx
import { useRef, useEffect } from 'react';
import interact from 'interactjs';

function DraggableComponent() {
  const elementRef = useRef(null);
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    const interactable = interact(elementRef.current)
      .draggable({
        // configuration
        listeners: {
          move: handleDragMove
        }
      });
    
    // Cleanup function to prevent memory leaks
    return () => {
      interactable.unset();
    };
  }, []);
  
  function handleDragMove(event) {
    const target = event.target;
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    
    target.style.transform = `translate(${x}px, ${y}px)`;
    
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }
  
  return (
    <div ref={elementRef} className="draggable">
      Drag me
    </div>
  );
}
```

### Using with TypeScript

For TypeScript projects, import types for better type checking:

```typescript
import interact from 'interactjs';
import { Interactable, DraggableOptions, DragEvent } from '@interactjs/types';

// With explicit typing
const options: DraggableOptions = {
  listeners: {
    move: (event: DragEvent) => {
      // Type-safe event handling
      const target = event.target as HTMLElement;
      // ...rest of the implementation
    }
  }
};

const element = document.querySelector('.draggable') as HTMLElement;
const interactable: Interactable = interact(element).draggable(options);
```

### Tree-Shaking with Module Bundlers

For bundlers that support tree-shaking (like Webpack, Rollup, or esbuild), use the modular imports to reduce bundle size:

```javascript
// Import only what you need
import interact from '@interactjs/interact';
import '@interactjs/auto-start';
import '@interactjs/actions/drag';
import '@interactjs/modifiers';
```

This pattern allows bundlers to eliminate unused code and reduce your final bundle size.

For a more comprehensive API reference, see the [Complete API Reference](./11-complete-api-reference.md) section.

---

[← Previous: Basic Usage](./03-usage.md) | [Back to Index](./index.md) | [Next: Tutorials →](./05-tutorials.md)