# Basic Usage: Making Elements Draggable

To make an element draggable, you create an interactable for it and call the `.draggable()` method with any desired options. The most important option is the event listeners for drag events. Interact.js will emit events such as dragstart, dragmove, and dragend during the interaction. You can provide listener functions for these events to update your UI.

## Example – Draggable Element
Suppose we have a `<div class="drag-item">...</div>` in our template. We can enable dragging as follows:

```javascript
interact('.drag-item').draggable({
  listeners: {
    start(event) {
      console.log('Drag started on', event.target);
    },
    move(event) {
      // Change element's position by the amount dragged since last event
      const { dx, dy } = event;
      event.target.style.transform =
        `translate(${dx}px, ${dy}px)`;
    },
    end(event) {
      console.log('Drag ended with velocity',
                  event.velocityX, event.velocityY);
    }
  }
});
```

In this snippet, we used a CSS selector `.drag-item` to target the element. You could also pass a specific element (e.g., `interact(elementRef.value)`). We provided three listeners:
* `start`: called when dragging starts (pointer goes down and movement is detected).
* `move`: called continuously as the element is dragged (pointer moves). Here we adjust the element's CSS transform by the incremental dx and dy values provided by the event.
* `end`: called when the drag finishes (pointer is released).

## Understanding Drag Event Data
Interact.js provides useful properties on the event object. For drag events:
* `event.dx` and `event.dy` – the change in x and y coordinates since the last event (so you can incrementally move the element).
* `event.pageX/pageY` – the current absolute position of the pointer on the page.
* `event.rect` – (for resize, not used in drag).
* `event.velocityX/velocityY` – the speed of the pointer at the end of the drag (useful in end events, e.g., to calculate momentum).
* `event.target` – the DOM element being dragged.
* `event.interactable` – the Interactable object (in case you need to access its settings).

Typically, for dragging, you maintain the element's position in some variables or data attributes. In the example above, we directly applied dx, dy to transform. This works for a simple demo but will reset on each move. A better approach is to track the element's cumulative position. For instance:

```javascript
// at top: let pos = { x: 0, y: 0 };
interact('.drag-item').draggable({
  listeners: {
    move(event) {
      pos.x += event.dx;
      pos.y += event.dy;
      event.target.style.transform =
        `translate(${pos.x}px, ${pos.y}px)`;
    }
  }
});
```

This way, `pos` keeps track of the element's translated position, and each move event moves it from its current position. Alternatively, you can store data-x and data-y attributes on the element to persist the position between events (as shown later in the resizing example).

**Note**: It's recommended to add some CSS to draggable elements: `touch-action: none; user-select: none;`. This prevents the browser's default behaviors (scrolling, text selection) from interfering with touch/mouse dragging.

# Enabling Resizing of Elements

Making an element resizable is similar to draggable. You use the `.resizable()` method with options. The key option for resizing is specifying which edges/corners can be dragged to resize.

## Example – Resizable Element
Assume a `<div class="resize-item">...</div>` in the template.

```javascript
interact('.resize-item').resizable({
  edges: { top: true, left: true, bottom: true, right: true },
  listeners: {
    start(event) {
      console.log('Resize started');
    },
    move(event) {
      // Get change in dimensions
      const { width, height } = event.rect;       // new size
      const { left, top } = event.deltaRect;      // size change since last event
      // Update the element's style
      event.target.style.width  = `${width}px`;
      event.target.style.height = `${height}px`;
      // Optionally adjust position to account for top/left edges if they were dragged
      const x = (parseFloat(event.target.dataset.x) || 0) + left;
      const y = (parseFloat(event.target.dataset.y) || 0) + top;
      event.target.style.transform = `translate(${x}px, ${y}px)`;
      // Store the updated position for next move
      event.target.dataset.x = x;
      event.target.dataset.y = y;
    },
    end(event) {
      console.log('Resize ended. New size:', event.rect.width, 'x', event.rect.height);
    }
  }
});
```

In this configuration:
* `edges: { top: true, ... }` enables all four edges for resizing. This means the user can grab any edge or corner to resize the box. You can also specify selectors or elements for edges. For example, you could set `right: '.handle-se'` to only allow resizing when a specific handle element (with class handle-se) is dragged.
* In the move listener, we use `event.rect` which contains the new calculated width and height of the element. We apply those to the element's style. We also use `event.deltaRect` (which has top, left, bottom, right deltas) to adjust the element's translation if needed. In a resize, when you drag the top or left edges, the element's top-left position changes. The example above stores data-x and data-y on the element (initially 0) and updates them by the change in left and top so that the element stays in the correct position while resizing from those edges.
* This approach of storing data-x/data-y and using CSS transforms for positioning keeps the element in place and only adjusts as needed, which is a known pattern for combining dragging and resizing.

## Resizing Options
In addition to edges, Interact.js has other options and considerations for resizing:
* By default, resizing with edges means the user can also grab corners (which is simply grabbing both a horizontal and vertical edge at once).
* You can restrict which edges: e.g., `edges: { left: false, right: true, top: false, bottom: true }` would only allow resizing from the bottom-right corner (since top/left are disabled, effectively only bottom and right edges work, and their intersection is the bottom-right corner).
* If you want to resize from only the corners and not the mid edges, you could set the edges to specific corner handle elements instead of true/false.
* To maintain aspect ratio during resize, Interact.js provides an aspect ratio modifier (discussed later in Advanced usage). There isn't a simple preserveAspectRatio: true option; instead you use a modifier or custom logic.
* The `event.rect` provides the new position and size of the element's bounding box on each resizemove. This is useful if you want to update other layout info or just log final size on end.

# Multi-Touch Gestures (Pinch/Zoom/Rotate)

Interact.js supports multi-pointer gestures through the `.gesturable()` method. Gestures are recognized when at least two pointers (e.g., two fingers on a touchscreen) are on the target element. Common use cases are pinch-to-zoom and rotate gestures.

## Example – Rotate Gesture
Imagine an element (like an image or div) that we want to rotate via a two-finger twist:

```javascript
interact('.rotate-area').gesturable({
  listeners: {
    move(event) {
      // Keep track of cumulative rotation:
      let currentAngle = parseFloat(event.target.getAttribute('data-angle')) || 0;
      currentAngle += event.da; // event.da = change in angle since last event
      event.target.style.transform = `rotate(${currentAngle}deg)`;
      event.target.setAttribute('data-angle', currentAngle.toString());
      // Optionally, also scale the element:
      if (event.scale !== 1) {
        // event.scale is the ratio of current gesture distance to start distance
        event.target.style.transform += `scale(${event.scale})`;
      }
    },
    start(event) {
      // maybe store initial angle or show UI feedback
    },
    end(event) {
      console.log('Gesture ended');
    }
  }
});
```

In this snippet:
* We use `event.da` (delta angle) from gesture events to increment the rotation. The library calculates the angle between the two touch points and how it changes.
* `event.scale` is the ratio of distances (current distance between touches / starting distance). If you want to implement pinch-to-zoom, you can use event.scale. In the example above, we simply apply scaling live. (Often for pinch-zoom, you would apply a cumulative scale similarly to angle).
* We stored the cumulative rotation in a data-angle attribute. Alternatively, like dragging, you could keep a variable outside.
* We apply transforms for rotation (and scale). Note: combining rotate and scale in one transform string is fine, but you have to be careful with order (in CSS, transform order matters). Here we do rotate then scale.

For pinch zoom specifically, you might ignore rotation and only handle scale:

```javascript
interact('.zoom-target').gesturable({
  listeners: {
    move(event) {
      let scale = (event.target.dataset.scale && parseFloat(event.target.dataset.scale)) || 1;
      scale *= event.ds; // event.ds = change in scale since last event
      event.target.style.transform = `scale(${scale})`;
      event.target.dataset.scale = scale;
    }
  }
});
```

This would make an element zoom in/out as you pinch. We use event.ds (delta scale) which gives the incremental change since last event, multiplying it to a stored scale value.

## Gesture Event Properties
Gesture events (gesturestart, gesturemove, gestureend) provide:
* `event.distance`: The distance between the two touch points.
* `event.angle`: The angle (in degrees) between the touch points.
* `event.da`: Change in angle since previous event.
* `event.scale`: Ratio of current distance to starting distance (at gesturestart).
* `event.ds`: Change in scale since last event.
* Plus the common properties (like event.target, etc.). Typically, you use event.da and event.ds for smooth continuous updates.

When using gestures, remember to set `touch-action: none` in CSS on the target to prevent the browser's default pinch-zoom (on mobile) or other gestures from interfering.

# Using Modifiers: Snapping and Restricting Movement

Modifiers in Interact.js are plugins that alter the behavior of drag/resize events, often to enforce constraints. Two of the most commonly used modifiers are snapping and restrict:
* **Snapping**: Make the drag or resize snap to a grid or specific points.
* **Restrict**: Limit the area within which an element can be dragged or resized (e.g., within parent bounds or a certain region).

Modifiers are added via a modifiers array in the draggable/resizable options.

## Snap to Grid Example
Suppose we want a draggable element to snap to a 50x50 pixel grid.

```javascript
import { interact } from 'interactjs';  // ensure we have interact.modifiers available

const gridSize = 50;
interact('.drag-item').draggable({
  modifiers: [
    interact.modifiers.snap({
      targets: [ interact.snappers.grid({ x: gridSize, y: gridSize }) ],
      range: Infinity,
      offset: { x: 0, y: 0 }
    })
  ],
  listeners: { ... }
});
```

Here we use `interact.modifiers.snap({...})` with a target of `interact.snappers.grid({ x: 50, y: 50 })`. This means the drag coordinates will snap to the nearest 50px grid lines. `range: Infinity` means it will always snap (no maximum distance – by default snapping might only engage when close to a target, but Infinity ensures it always snaps). We also set an offset (or you could use relativePoints) to align the snapping grid to the element's top-left. By default, the grid will align such that (0,0) on the page is a snap point; if your container is offset or you want a different alignment, you adjust offset.

After adding this modifier, the event.dx/dy in your move listener will already reflect snapped movement – you don't need to do extra math; the modifier adjusts the event coordinates. For example, if you try to drag 10px but grid is 50px, event.dx might jump to 50px on first move, etc.

## Restrict Movement Example
To restrict dragging within a container element:

```javascript
interact('.drag-item').draggable({
  modifiers: [
    interact.modifiers.restrict({
      restriction: '.container',   // CSS selector of parent/container
      endOnly: true,               // apply restriction only at end, or false to apply during drag
    })
  ],
  listeners: { ... }
});
```

This uses the restrict modifier to keep the draggable within the element matching `.container`. If endOnly were false (the default is false, meaning restriction is continuous), the draggable would never leave the container while dragging. If `endOnly: true`, the user can drag out but when they drop (dragend), the final position will be adjusted to be inside the restriction (useful if you want to allow some leeway or overlay effect but snap back on release).

You can also restrict to coordinates or an element rect. restriction can accept an element, a selector, or an object like `{x: 0, y: 0, width: 800, height: 600}` for a fixed area.

## Multiple Modifiers
You can use multiple modifiers together. For instance, snapping and restricting:

```javascript
interact(element).draggable({
  modifiers: [
    interact.modifiers.restrict({ restriction: 'parent' }),
    interact.modifiers.snap({ targets: [interact.snappers.grid({ x: 50, y: 50 })] })
  ]
});
```

Modifiers are executed in order; the order can matter. Typically you'd restrict first, then snap, but it depends on the effect (snapping first then restricting might slightly shift the snap if the point is outside bounds). In practice, experiment to see which order yields desired behavior.

Other available modifiers include:
* `interact.modifiers.aspectRatio` – to enforce a specific aspect ratio on resizable (or even draggable) interactions (commonly used for resizable to maintain shape).
* `interact.modifiers.restrictSize` – to set min/max width/height for resizes.
* `interact.modifiers.restrictEdges` – a more advanced way to restrict movement on specific edges.
* `interact.modifiers.snapEdges` – to snap a specific edge or corner to a grid or point.

These can be combined as needed for advanced interactions.

# Dropzones (Drag and Drop)

If you want to implement drag-and-drop behavior (moving an element and dropping it onto another element to perform some action), Interact.js supports this via dropzone functionality. You designate certain elements as drop targets using `.dropzone()` and configure what happens on drop.

## Basic Dropzone Example:

```javascript
// Make an element draggable
interact('.draggable-card').draggable({
  listeners: { move(/*...*/){ /*move logic*/ } },
  inertia: true
});

// Designate another element as a dropzone
interact('.drop-area').dropzone({
  accept: '.draggable-card',       // only accept elements with this selector
  overlap: 0.5,                    // require 50% overlap for a drop to be counted
  ondropactivate(event) {
    // highlight dropzone when a drag starts
    event.target.classList.add('drop-active');
  },
  ondragenter(event) {
    // pointer dragged into dropzone
    event.target.classList.add('drop-target');
    event.relatedTarget.classList.add('can-drop');
  },
  ondragleave(event) {
    // dragged pointer leaves the dropzone area
    event.target.classList.remove('drop-target');
    event.relatedTarget.classList.remove('can-drop');
  },
  ondrop(event) {
    // final drop happened
    console.log(`${event.relatedTarget.id} dropped into ${event.target.id}`);
  },
  ondropdeactivate(event) {
    // remove active dropzone highlighting
    event.target.classList.remove('drop-active');
    event.target.classList.remove('drop-target');
  }
});
```

In this scenario:
* We call `.draggable()` on `.draggable-card` to enable dragging (with inertia for a nicer feel).
* We call `.dropzone(...)` on `.drop-area` to make it a drop target. The options:
  * `accept`: A CSS selector (or element) to filter which draggables can drop here. In this case, only elements of class `.draggable-card` will be recognized. If an element that doesn't match tries to drop, the drop events won't fire for this dropzone.
  * `overlap`: How much of the draggable must overlap the dropzone to count as a drop. We set 0.5 which means the draggable must cover at least 50% of the dropzone's area. You could also use 'pointer' (default, just check pointer position) or 'center' (draggable's center must be in dropzone).
* We then define event handlers: `ondropactivate` fires when a drag that is eligible for this dropzone starts (we add a highlight to indicate the drop area is active). `ondragenter` fires when a draggable enters the dropzone area (we add classes to indicate a potential drop target and change the draggable's appearance to show it can be dropped). `ondragleave` fires when it leaves. `ondrop` fires on a successful drop (we handle the dropped item – e.g., move DOM elements or update state). `ondropdeactivate` fires at the end to clean up.

Under the hood, Interact.js is tracking the draggable and dropzone. Note that Interact.js does not automatically move the dragged element into the dropzone or change the DOM hierarchy. If you want the dragged element to "live" inside the dropzone after drop, you must manually append or position it there in the ondrop handler. The events give you event.relatedTarget (the dragged element) and event.target (the dropzone element) so you can manipulate them as needed.

## Multiple Dropzones
A draggable can have multiple dropzones. The dragenter/dragleave events will fire for each dropzone as you move through them. You can check event.target to know which dropzone is triggered. Ensure accept rules are set such that only intended targets react.

## Dropzone Checker (Advanced)
Instead of or in addition to accept and overlap, you can provide a custom checker function to decide if a drop is valid. This is useful for complex scenarios (e.g., based on runtime conditions). See Interact.js docs for `.dropzone({ checker: function(...) { ... } })` usage.

# Other Useful Options and Features

## Inertia
We enabled it in the dropzone example. Setting `inertia: true` on draggable or resizable gives a smooth "throw" effect – when the user releases, the element will continue moving a bit and then slow to a stop, imitating physical inertia. You can configure inertia (e.g., duration, resistance) if needed. It's great for user experience but note it adds some after-effects you have to account for (the dragend event will fire after inertia finishes, not immediately on release).

## Auto-Scroll
If you have a scrollable container or page, Interact.js can auto-scroll it when a draggable is near the edge during drag. This is enabled via the autoScroll option. For example:

```javascript
interact(element).draggable({
  autoScroll: {
    container: document.querySelector('.scrollable-container'),
    margin: 50,
    speed: 300
  }
})
```

This will scroll the container when the pointer is within 50px of its edge, at a speed of 300px/sec. This is very useful for dragging something across a scrollable list or page.

## Allow From / Ignore From
These options let you fine-tune where a drag/resize can be initiated. allowFrom specifies a CSS selector for a child element that permits starting the action (like a handle). ignoreFrom specifies elements that should not start the action. For example, if your draggable box contains a button that users might click (and you don't want drags to start when they click the button), use `ignoreFrom: 'button'` in your draggable options. Conversely, you could have a small handle icon and use `allowFrom: '.handle'` to only drag when the user grabs that handle. This improves usability in complex UIs.

## Manual Start
By default, as soon as the user presses and moves the pointer, a drag or resize starts. You can require a manual start, which means you would call the Interaction.start() method yourself to begin the action. This is advanced, but note that there's also a hold option which will delay start until the pointer is held down for a certain amount of time. For example, `interact(element).draggable({ hold: 500 })` would only start dragging after ~500ms press, which can prevent accidental drags.

## Max Interactions
Interact.js allows multiple elements to be interacted with simultaneously by default. If you want to limit this (globally or per element), you can use `interact.maxInteractions()` or the per-interactable max option. For instance, `interact.maxInteractions(1)` globally limits to one concurrent interaction (no multi-touch or multi-drag at the same time). Or `interact('.item').draggable({ max: 1 })` would ensure only one pointer can drag elements of that class at once. By default, `maxPerElement: 1` which means a single element can't have two pointers dragging it simultaneously (you usually keep that).

## Callback vs .on()
In examples, we used the `listeners: { move() { ... } }` style. You can also attach listeners separately using the `.on()` method. For example:

```javascript
interact(element)
  .draggable({ /*options without listeners*/ })
  .on('dragmove', event => { ... })
  .on('dragend', event => { ... });
```

This is equivalent and sometimes handy to separate configuration from logic. Additionally, you can use `.off()` to remove listeners.

With these basics – dragging, resizing, gestures, modifiers, dropzones – you can implement a wide range of interactions. Next, we'll delve into the full API to see all available methods and options in detail, followed by some practical tutorials to cement these concepts.

---

[← Previous: Installation](./02-installation.md) | [Back to Index](./index.md) | [Next: API Reference →](./04-api.md)