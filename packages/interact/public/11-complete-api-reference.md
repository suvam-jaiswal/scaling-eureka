# Complete Interact.js API Reference

This document provides a comprehensive reference for the Interact.js API, covering all methods, properties, and options.

## Top-Level API

### interact(target)

The main entry point that creates or returns an Interactable for elements matching the target.

**Parameters:**
- `target`: String (CSS selector), Element, or Array of Elements

**Returns:** Interactable

**Example:**
```javascript
// Create interactable for all .draggable elements
const interactable = interact('.draggable');

// Create interactable for a specific element
const element = document.getElementById('drag-1');
const singleInteractable = interact(element);
```

### interact.isSet(element)

Checks if an element has been made interactable.

**Parameters:**
- `element`: Element to check

**Returns:** Boolean

**Example:**
```javascript
if (interact.isSet(element)) {
  console.log('Element is interactable');
}
```

### interact.on(eventType, listener)

Adds a global event listener.

**Parameters:**
- `eventType`: String or Array of strings for event types
- `listener`: Function to call when event occurs

**Returns:** interact

**Example:**
```javascript
interact.on('dragmove', (event) => {
  console.log('Something was dragged');
});
```

### interact.off(eventType, listener)

Removes a global event listener.

**Parameters:**
- `eventType`: String or Array of strings for event types
- `listener`: Function to remove

**Returns:** interact

**Example:**
```javascript
const listener = (event) => console.log('Something was dragged');
interact.on('dragmove', listener);
// Later:
interact.off('dragmove', listener);
```

### interact.debug()

Returns debug data about the current state of Interact.js.

**Returns:** Object with debug information

**Example:**
```javascript
console.log(interact.debug());
```

### interact.getPointerAverage(pointers)

Calculates the average of multiple pointer coordinates.

**Parameters:**
- `pointers`: Array of objects with x/y coordinates

**Returns:** Object `{ x, y }`

**Example:**
```javascript
const pointers = [{ x: 0, y: 0 }, { x: 100, y: 100 }];
const avg = interact.getPointerAverage(pointers);
// avg = { x: 50, y: 50 }
```

### interact.getTouchAngle(touchEvent)

Calculates the angle between two touches from a touch event.

**Parameters:**
- `touchEvent`: TouchEvent with at least two touches

**Returns:** Number (angle in degrees)

**Example:**
```javascript
element.addEventListener('touchmove', (e) => {
  if (e.touches.length >= 2) {
    const angle = interact.getTouchAngle(e);
    console.log(`Touch angle: ${angle} degrees`);
  }
});
```

### interact.getTouchBBox(touchEvent)

Gets the bounding box of all touches in a touch event.

**Parameters:**
- `touchEvent`: TouchEvent with at least one touch

**Returns:** Object with `{ x, y, width, height, left, right, top, bottom }`

**Example:**
```javascript
element.addEventListener('touchmove', (e) => {
  const bbox = interact.getTouchBBox(e);
  console.log(`Touch area: ${bbox.width} x ${bbox.height}`);
});
```

### interact.getElementRect(element)

Gets the normalized dimensions of an element.

**Parameters:**
- `element`: DOM Element

**Returns:** Object with `{ left, right, top, bottom, width, height }`

**Example:**
```javascript
const rect = interact.getElementRect(document.getElementById('my-element'));
console.log(`Element size: ${rect.width} x ${rect.height}`);
```

### interact.supportsTouch()

Checks if the browser supports touch events.

**Returns:** Boolean

**Example:**
```javascript
if (interact.supportsTouch()) {
  console.log('Touch is supported');
}
```

### interact.supportsPointerEvent()

Checks if the browser supports pointer events.

**Returns:** Boolean

**Example:**
```javascript
if (interact.supportsPointerEvent()) {
  console.log('Pointer events are supported');
}
```

### interact.stop()

Stops all interactions immediately.

**Returns:** interact

**Example:**
```javascript
document.getElementById('stop-button').addEventListener('click', () => {
  interact.stop(); // Cancels all ongoing interactions
});
```

### interact.pointerMoveTolerance(newValue)

Gets or sets the distance the pointer must move before an action is started.

**Parameters:**
- `newValue`: (Optional) Number of pixels

**Returns:** Current tolerance value or interact

**Example:**
```javascript
// Set tolerance
interact.pointerMoveTolerance(10);

// Get current tolerance
const tolerance = interact.pointerMoveTolerance();
```

### interact.addDocument(doc, options)

Adds a document to interact's event listener delegation.

**Parameters:**
- `doc`: Document to add
- `options`: Options object

**Returns:** Document

**Example:**
```javascript
// Add an iframe's document
const iframe = document.querySelector('iframe');
const iframeDoc = iframe.contentDocument;
interact.addDocument(iframeDoc);
```

### interact.removeDocument(doc)

Removes a document from interact's event listener list.

**Parameters:**
- `doc`: Document to remove

**Returns:** Document

**Example:**
```javascript
interact.removeDocument(iframeDoc);
```

## Interactable Object Methods

### interactable.draggable(options)

Enables or configures dragging on the interactable.

**Parameters:**
- `options`: Boolean or Object with drag configuration

**Returns:** This Interactable

**Example:**
```javascript
interact('.draggable').draggable({
  inertia: true,
  modifiers: [interact.modifiers.restrict({ restriction: 'parent' })],
  autoScroll: true,
  listeners: {
    start(event) { console.log('drag started'); },
    move(event) {
      const target = event.target;
      const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
      
      target.style.transform = `translate(${x}px, ${y}px)`;
      
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    },
    end(event) { console.log('drag ended'); }
  }
});
```

### interactable.resizable(options)

Enables or configures resizing on the interactable.

**Parameters:**
- `options`: Boolean or Object with resize configuration

**Returns:** This Interactable

**Example:**
```javascript
interact('.resizable').resizable({
  edges: { top: true, left: true, bottom: true, right: true },
  modifiers: [
    interact.modifiers.restrictEdges({ outer: 'parent' }),
    interact.modifiers.restrictSize({ min: { width: 100, height: 100 } })
  ],
  inertia: true,
  listeners: {
    move(event) {
      const target = event.target;
      let x = (parseFloat(target.getAttribute('data-x')) || 0);
      let y = (parseFloat(target.getAttribute('data-y')) || 0);
      
      // Update the element's style
      target.style.width = `${event.rect.width}px`;
      target.style.height = `${event.rect.height}px`;
      
      // Translate when resizing from top or left
      x += event.deltaRect.left;
      y += event.deltaRect.top;
      
      target.style.transform = `translate(${x}px, ${y}px)`;
      
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    }
  }
});
```

### interactable.gesturable(options)

Enables or configures gesture recognition on the interactable.

**Parameters:**
- `options`: Boolean or Object with gesture configuration

**Returns:** This Interactable

**Example:**
```javascript
interact('.gesturable').gesturable({
  listeners: {
    start(event) { console.log('gesture started'); },
    move(event) {
      const target = event.target;
      // Scale element
      target.style.transform += ` scale(${event.scale})`;
      // Rotate element
      target.style.transform += ` rotate(${event.angle}deg)`;
    },
    end(event) { console.log('gesture ended'); }
  }
});
```

### interactable.dropzone(options)

Enables or configures the element as a dropzone.

**Parameters:**
- `options`: Boolean or Object with dropzone configuration

**Returns:** This Interactable

**Example:**
```javascript
interact('.dropzone').dropzone({
  accept: '.drag-item',
  overlap: 0.5,
  ondropactivate(event) {
    event.target.classList.add('drop-active');
  },
  ondragenter(event) {
    event.target.classList.add('drop-target');
    event.relatedTarget.classList.add('can-drop');
  },
  ondragleave(event) {
    event.target.classList.remove('drop-target');
    event.relatedTarget.classList.remove('can-drop');
  },
  ondrop(event) {
    console.log('Dropped');
  },
  ondropdeactivate(event) {
    event.target.classList.remove('drop-active');
    event.target.classList.remove('drop-target');
  }
});
```

### interactable.on(eventType, listener)

Adds an event listener for the interactable.

**Parameters:**
- `eventType`: String or Array of strings for event types
- `listener`: Function to call when event occurs

**Returns:** This Interactable

**Example:**
```javascript
interact('.element')
  .on('dragstart', (event) => { console.log('Drag started'); })
  .on('dragmove', (event) => { /* Move logic */ })
  .on('dragend', (event) => { console.log('Drag ended'); });
```

### interactable.off(eventType, listener)

Removes an event listener from the interactable.

**Parameters:**
- `eventType`: String or Array of strings for event types
- `listener`: Function to remove

**Returns:** This Interactable

**Example:**
```javascript
const listener = (event) => { console.log('Drag started'); };
interact('.element').on('dragstart', listener);
// Later:
interact('.element').off('dragstart', listener);
```

### interactable.set(options)

Sets multiple interaction options at once.

**Parameters:**
- `options`: Object containing options for different interaction types

**Returns:** This Interactable

**Example:**
```javascript
interact('.element').set({
  draggable: true,
  resizable: {
    edges: { left: true, bottom: true }
  },
  modifiers: [interact.modifiers.restrictRect({
    restriction: 'parent'
  })]
});
```

### interactable.unset()

Removes all interactions and event listeners for the interactable.

**Returns:** interact

**Example:**
```javascript
// Clean up when element is being removed
interact('.element').unset();
```

### interactable.rectChecker(callback)

Sets a function to calculate the interactable's dimensions.

**Parameters:**
- `callback`: Function that returns a rect-like object

**Returns:** This Interactable or current rectChecker

**Example:**
```javascript
interact('.draggable').rectChecker((element) => {
  // Custom logic to calculate rectangle
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height
  };
});
```

### interactable.styleCursor(newValue)

Enables or disables cursor styling during interactions.

**Parameters:**
- `newValue`: Boolean

**Returns:** This Interactable or current value

**Example:**
```javascript
// Disable automatic cursor changes (handle it yourself)
interact('.draggable').styleCursor(false);
```

### interactable.preventDefault(newValue)

Sets whether to prevent the browser's default actions for pointer events.

**Parameters:**
- `newValue`: Boolean or 'auto'

**Returns:** This Interactable or current value

**Example:**
```javascript
interact('.draggable').preventDefault(true);
```

### interactable.origin(newValue)

Gets or sets the origin of interactions relative to the element.

**Parameters:**
- `newValue`: Element, String ('parent', 'self'), or Object with x/y coordinates

**Returns:** This Interactable or current origin

**Example:**
```javascript
// Set origin to the center of the element
interact('.draggable').origin({ x: '50%', y: '50%' });
```

### interactable.deltaSource(newValue)

Sets which coordinate system the drag delta values are reported in.

**Parameters:**
- `newValue`: String ('page' or 'client')

**Returns:** This Interactable or current deltaSource

**Example:**
```javascript
// Use client (viewport) coordinates
interact('.draggable').deltaSource('client');
```

### interactable.getRect(element)

Gets the dimensions of an element, taking into account any rectChecker.

**Parameters:**
- `element`: Element to get dimensions for

**Returns:** Object with `{ left, right, top, bottom, width, height }`

**Example:**
```javascript
const rect = interact('.draggable').getRect(document.querySelector('.draggable'));
console.log(`Dimensions: ${rect.width} x ${rect.height}`);
```

### interactable.squareResize(newValue)

(Deprecated) Sets whether resizing is aspect-ratio-preserving.

**Parameters:**
- `newValue`: Boolean

**Returns:** This Interactable or current value

**Example:**
```javascript
// Keep aspect ratio when resizing (deprecated, use aspectRatio modifier instead)
interact('.resizable').squareResize(true);

// Modern equivalent:
interact('.resizable').resizable({
  modifiers: [interact.modifiers.aspectRatio({ ratio: 'preserve' })]
});
```

### interactable.autoScroll(options)

Configures auto-scrolling during interactions.

**Parameters:**
- `options`: Boolean or Object with auto-scrolling configuration

**Returns:** This Interactable or current autoScroll options

**Example:**
```javascript
interact('.draggable').autoScroll({
  container: document.querySelector('#scroll-container'),
  margin: 50,
  distance: 5,
  interval: 10
});
```

### interactable.context()

Gets the context (typically the document) of the Interactable.

**Returns:** Document or other context

**Example:**
```javascript
const context = interact('.draggable').context();
console.log(context === document); // true for regular document
```

## Modifier Functions

### interact.modifiers.snap()

Creates a modifier that snaps coordinates to targets.

**Parameters:**
- `options`: Object with snap configuration

**Returns:** Modifier object

**Example:**
```javascript
const snapModifier = interact.modifiers.snap({
  targets: [
    interact.snappers.grid({ x: 50, y: 50 })
  ],
  range: 20,
  relativePoints: [{ x: 0, y: 0 }]
});
```

### interact.modifiers.restrict()

Creates a modifier that restricts coordinates within a boundary.

**Parameters:**
- `options`: Object with restriction configuration

**Returns:** Modifier object

**Example:**
```javascript
const restrictModifier = interact.modifiers.restrict({
  restriction: 'parent',
  elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
});
```

### interact.modifiers.restrictEdges()

Creates a modifier that restricts the edges of an element within a boundary.

**Parameters:**
- `options`: Object with edge restriction configuration

**Returns:** Modifier object

**Example:**
```javascript
const restrictEdgesModifier = interact.modifiers.restrictEdges({
  outer: 'parent',
  endOnly: true
});
```

### interact.modifiers.restrictSize()

Creates a modifier that restricts the size of an element during resize.

**Parameters:**
- `options`: Object with size restriction configuration

**Returns:** Modifier object

**Example:**
```javascript
const restrictSizeModifier = interact.modifiers.restrictSize({
  min: { width: 100, height: 100 },
  max: { width: 500, height: 300 }
});
```

### interact.modifiers.aspectRatio()

Creates a modifier that maintains aspect ratio during resize.

**Parameters:**
- `options`: Object with aspect ratio configuration

**Returns:** Modifier object

**Example:**
```javascript
const aspectRatioModifier = interact.modifiers.aspectRatio({
  ratio: 16/9,  // Fixed ratio
  // OR
  ratio: 'preserve'  // Keep initial ratio
});
```

### interact.snappers.grid()

Creates a function for snapping coordinates to a grid.

**Parameters:**
- `options`: Object with grid configuration

**Returns:** Function

**Example:**
```javascript
const gridSnapper = interact.snappers.grid({
  x: 20,
  y: 20,
  offset: { x: 5, y: 5 }
});
```

## Event Types

### Pointer Events
- `down` - Pointer down on the interactable
- `move` - Pointer move
- `up` - Pointer up
- `cancel` - Pointer cancel
- `tap` - Quick tap/click
- `doubletap` - Double tap/click
- `hold` - Pointer held down without moving

### Drag Events
- `dragstart` - Drag started
- `dragmove` - Drag move
- `draginertiastart` - Inertia started after drag
- `dragend` - Drag ended

### Resize Events
- `resizestart` - Resize started
- `resizemove` - Resize move
- `resizeinertiastart` - Inertia started after resize
- `resizeend` - Resize ended

### Gesture Events
- `gesturestart` - Gesture started
- `gesturemove` - Gesture move
- `gestureend` - Gesture ended

### Drop Events
- `dropactivate` - A draggable enters interactable's target area
- `dropdeactivate` - A draggable leaves interactable's target area
- `dragenter` - A draggable enters the dropzone
- `dragleave` - A draggable leaves the dropzone
- `dropmove` - A draggable moves inside the dropzone
- `drop` - A draggable is dropped on the dropzone

### Internal Lifecycle Events
- `interactions:before-action-start`
- `interactions:action-start`
- `interactions:action-move`
- `interactions:action-end`
- `interactions:after-action-end`

## Event Object Properties

### Common Properties (InteractEvent)
- `target` - The interacted element
- `currentTarget` - The element the listener was added to
- `relatedTarget` - Dropzone: the dragged element; Drag: a dropzone element
- `interactable` - The Interactable object
- `interaction` - The Interaction object
- `x` / `y` - Pointer coordinates
- `clientX` / `clientY` - Viewport coordinates
- `pageX` / `pageY` - Page coordinates
- `dx` / `dy` - Change in coordinates since last event
- `velocityX` / `velocityY` - Velocity of pointer in pixels per second
- `speed` - Speed of the pointer
- `timeStamp` - Event timestamp

### DragEvent Properties
- All common properties
- `dragEnter` - Element being dragged over
- `dragLeave` - Element drag left from

### ResizeEvent Properties
- All common properties
- `rect` - The current element rectangle
  - `top`, `left`, `bottom`, `right`, `width`, `height`
- `deltaRect` - Change in rectangle
  - `top`, `left`, `bottom`, `right`
- `edges` - The edges being dragged
  - `top`, `left`, `bottom`, `right`

### GestureEvent Properties
- All common properties
- `distance` - Distance between pointers
- `angle` - Angle of the gesture in degrees
- `da` - Change in angle since last event
- `scale` - Scaling factor (ratio of distances)
- `ds` - Change in scale since last event

## Configuration Objects

### DraggableOptions
```javascript
{
  // Common options
  enabled: true,
  modifiers: [],
  listeners: { start, move, end },
  inertia: true,
  
  // Draggable-specific
  lockAxis: 'x', // 'x', 'y', 'start', 'xy' or false
  startAxis: 'x', // 'x', 'y', 'xy'
  
  // Functionality
  oninertiastart: function() {},
  autoScroll: {
    container: null,
    margin: 60,
    distance: 10,
    interval: 10
  }
}
```

### ResizableOptions
```javascript
{
  // Common options
  enabled: true,
  modifiers: [],
  listeners: { start, move, end },
  inertia: true,
  
  // Resizable-specific
  edges: {
    top: false,
    left: false,
    bottom: true,
    right: true
  },
  
  // Deprecated (use aspectRatio modifier)
  square: false,
  squareResize: false,
  
  // For inertia
  oninertiastart: function() {},
  
  // For auto-scroll
  autoScroll: true
}
```

### GesturableOptions
```javascript
{
  // Common options
  enabled: true,
  modifiers: [],
  listeners: { start, move, end },
  
  // For inertia
  oninertiastart: function() {}
}
```

### DropzoneOptions
```javascript
{
  accept: '.drag-item',
  overlap: 0.5, // 0-1, 'pointer', or 'center'
  checker: function(dragEvent, event, dropped, dropzone, dropElement, draggable, draggableElement) {
    return dropped; // boolean
  },
  
  // Event listeners
  ondropactivate: function(event) {},
  ondropdeactivate: function(event) {},
  ondragenter: function(event) {},
  ondragleave: function(event) {},
  ondropmove: function(event) {},
  ondrop: function(event) {}
}
```

### InertiaOptions
```javascript
{
  resistance: 10,       // Resistance (higher = less inertia)
  minSpeed: 100,        // Minimum start velocity for inertia
  endSpeed: 10,         // Velocity when inertia stops
  allowResume: true,    // Allow resuming an inertia movement by clicking
  smoothEndDuration: 300, // ms to slow down before stopping
  zeroResumeDelta: true // Jump to resuming pointer
}
```

### AutoScrollOptions
```javascript
{
  container: null,      // Element to scroll (default document.body)
  margin: 60,           // Pixel distance from edges to start scrolling
  distance: 10,         // Distance to scroll on each frame
  interval: 10,         // ms between scroll calculations
  speed: 300,           // Pixels per second near edge
  
  // Limit scroll directions
  directions: {
    x: true,
    y: true
  }
}
```

## Module Structure

Interact.js is modular and can be imported in parts for tree-shaking:

```javascript
// Core module
import interact from '@interactjs/interact';

// Actions
import '@interactjs/actions/drag';
import '@interactjs/actions/resize';
import '@interactjs/actions/gesture';
import '@interactjs/actions/drop';

// Auto-start
import '@interactjs/auto-start';

// Modifiers
import '@interactjs/modifiers';

// Inertia
import '@interactjs/inertia';

// Dev-tools (development only)
import '@interactjs/dev-tools';
```

## Browser Support

Interact.js supports all modern browsers, including:
- Chrome, Firefox, Safari, Edge
- Mobile browsers on iOS and Android
- Internet Explorer 9+ (with some limitations)

For older browsers, you may need polyfills for:
- `requestAnimationFrame`
- `Array.forEach`, `Array.map`, etc.
- `Object.assign`

## Integration with Frameworks

### Vue.js

```javascript
// In Vue component
import { onMounted, onUnmounted, ref } from 'vue';
import interact from 'interactjs';

export default {
  setup() {
    const elementRef = ref(null);
    let interactable = null;

    onMounted(() => {
      if (elementRef.value) {
        interactable = interact(elementRef.value)
          .draggable({
            // options
          });
      }
    });

    onUnmounted(() => {
      if (interactable) {
        interactable.unset();
      }
    });

    return { elementRef };
  }
};
```

### React

```jsx
import { useRef, useEffect } from 'react';
import interact from 'interactjs';

function DraggableComponent() {
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      const interactable = interact(elementRef.current)
        .draggable({
          // options
        });

      return () => {
        interactable.unset();
      };
    }
  }, []);

  return <div ref={elementRef}>Drag me</div>;
}
```

### Angular

```typescript
import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import interact from 'interactjs';

@Component({
  selector: 'app-draggable',
  template: '<div #element>Drag me</div>'
})
export class DraggableComponent implements OnInit, OnDestroy {
  @ViewChild('element') element: ElementRef;
  private interactable: any;

  ngOnInit() {
    this.interactable = interact(this.element.nativeElement)
      .draggable({
        // options
      });
  }

  ngOnDestroy() {
    if (this.interactable) {
      this.interactable.unset();
    }
  }
}
```

This comprehensive API reference covers all the main aspects of Interact.js and should serve as a detailed guide for implementing any required functionality. For the most current details, always consult the official documentation and TypeScript definitions.

---

[← Previous: Modifiers System](./10-modifiers-system.md) | [Back to Index](./index.md)