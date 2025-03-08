# Practical Examples

Here we present a series of standalone code examples demonstrating Interact.js features in different scenarios. Each example includes a brief explanation of what it does.

## Example 1: Drag and Drop Grid with Snapping

Scenario: A set of items can be dragged within a container and will snap to a grid layout (e.g., 50px grid). Similar to part of the grid tutorial, but simplified.

```html
<div id="grid-container">
  <div class="grid-item" v-for="n in 4" :id="'item'+n">Item {{n}}</div>
</div>
<style>
#grid-container { position: relative; width: 400px; height: 400px; background: #f0f0f0; }
.grid-item {
  position: absolute;
  width: 50px; height: 50px;
  background: #b3d4fc;
  touch-action: none; user-select: none;
}
</style>
<script>
interact('.grid-item').draggable({
  modifiers: [
    interact.modifiers.snap({
      targets: [ interact.snappers.grid({ x: 50, y: 50 }) ],
      range: Infinity, relativePoints: [{ x: 0, y: 0 }]
    }),
    interact.modifiers.restrict({ restriction: '#grid-container' })
  ],
  listeners: {
    move(event) {
      // dragging logic: update translate
      const target = event.target;
      // use data-x/y or fallback to 0
      let x = (parseFloat(target.dataset.x) || 0) + event.dx;
      let y = (parseFloat(target.dataset.y) || 0) + event.dy;
      target.style.transform = `translate(${x}px, ${y}px)`;
      target.dataset.x = x; target.dataset.y = y;
    }
  }
});
</script>
```

Explanation: Four .grid-item divs inside a container. The script uses a class selector to make them draggable. We apply two modifiers: snap to a 50px grid (the size of items) and restrict movement within the container. As a result, you can drag items around, and they will latch to the 50px grid positions. The move listener is identical to earlier examples, tracking the position in data-x, data-y. This ensures smooth dragging and correct snapping.

## Example 2: Snapping and Restricting a Resizable Element

Scenario: An element that can be resized, but it snaps its size to increments of 20px and cannot be made smaller than a minimum or moved outside the container.

```html
<div id="resize-container" style="position: relative; width:300px; height:300px; padding:10px; background:#eee;">
  <div id="resize-box" style="
       width: 80px; height: 80px; background:#8ce;
       position: absolute; touch-action:none; user-select:none;">
    Resize Me
  </div>
</div>
<script>
interact('#resize-box').resizable({
  edges: { left:true, right:true, top:true, bottom:true },
  modifiers: [
    interact.modifiers.snap({
      targets: [ interact.snappers.grid({ x:20, y:20 }) ],
      range: Infinity, relativePoints: [ { x:0, y:0 } ]
    }),
    interact.modifiers.restrictSize({
      min: { width: 40, height: 40 },
      max: { width: 300, height: 300 }
    }),
    interact.modifiers.restrictEdges({
      outer: '#resize-container', endOnly: true
    })
  ],
  listeners: {
    move(event) {
      const target = event.target;
      // get current pos from data or 0
      let x = parseFloat(target.getAttribute('data-x')) || 0;
      let y = parseFloat(target.getAttribute('data-y')) || 0;
      // update size
      target.style.width  = event.rect.width + 'px';
      target.style.height = event.rect.height + 'px';
      // translate if needed (top/left drag)
      x += event.deltaRect.left;
      y += event.deltaRect.top;
      target.style.transform = `translate(${x}px, ${y}px)`;
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    }
  }
});
</script>
```

Explanation: We have a #resize-box inside #resize-container. We enable resizing on all edges. Modifiers used:
* Snap to a 20px grid (so width/height will jump in 20px increments).
* restrictSize to enforce min width/height of 40px and max up to container size.
* restrictEdges to keep the box within the container's bounds during resize (especially if dragging edges outward).
The move listener updates the element's style and position, storing data-x,y (similar to previous resizing examples). The result: when you drag the edges, the box resizes in steps of 20px and won't shrink too small or go outside the gray container.

## Example 3: Collision Detection on Drag (Basic)

Scenario: Two draggable boxes change color if they collide with each other while dragging.

```html
<div id="playground" style="position: relative; width:400px; height:200px; background:#f9f9f9;">
  <div class="box" id="box1" style="position:absolute; width:50px; height:50px; background: #28e;"></div>
  <div class="box" id="box2" style="position:absolute; width:50px; height:50px; background: #28e; left: 100px; top: 80px;"></div>
</div>
<script>
function checkCollision(el1, el2) {
  const r1 = el1.getBoundingClientRect();
  const r2 = el2.getBoundingClientRect();
  return !(r2.left > r1.right ||
           r2.right < r1.left ||
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
}
interact('.box').draggable({
  listeners: {
    move(event) {
      const target = event.target;
      // move element
      target.style.left = (parseFloat(target.style.left)||0) + event.dx + 'px';
      target.style.top  = (parseFloat(target.style.top)||0) + event.dy + 'px';
      // collision check
      const otherId = target.id === 'box1' ? 'box2' : 'box1';
      const other = document.getElementById(otherId);
      if (other && checkCollision(target, other)) {
        target.style.background = 'red';
        other.style.background = 'red';
      } else {
        target.style.background = '#28e';
        if (other) other.style.background = '#28e';
      }
    }
  }
});
</script>
```

Explanation: We have two absolutely positioned .box elements in a container. We make them draggable (no special modifiers here). On each move, we manually set left and top styles (for a change, instead of transform). After moving, we call checkCollision to see if the dragged box overlaps the other box. If so, we change both boxes' background to red; if not, we reset to blue (#28e). The collision check uses bounding boxes. This example shows a simple approach to collision detection: using geometry in the drag handler. For more complex scenarios or many elements, you'd optimize this (perhaps only checking nearby items, etc.).

## Example 4: Custom Dropzone (Drag to Trash)

Scenario: Drag an item to a "trash bin" area to remove it.

```html
<div style="padding:20px;">
  <div id="drag-item" style="display:inline-block; width:60px; height:60px; background:orange;">📝</div>
  <div id="trash" style="display:inline-block; width:60px; height:60px; background:#ccc; margin-left:100px; text-align:center; line-height:60px;">
    🗑️
  </div>
</div>
<script>
interact('#drag-item').draggable({
  listeners: {
    move(event) {
      event.target.style.transform = `translate(${event.pageX}px, ${event.pageY}px)`;
    },
    end(event) {
      // reset position if not dropped in trash
      event.target.style.transform = '';
    }
  }
});
interact('#trash').dropzone({
  accept: '#drag-item',
  overlap: 0.75,
  ondragenter(event) {
    event.target.style.background = 'red';
  },
  ondragleave(event) {
    event.target.style.background = '#ccc';
  },
  ondrop(event) {
    event.target.style.background = '#ccc';
    event.relatedTarget.style.display = 'none'; // "delete" the item
    alert('Item deleted!');
  }
});
</script>
```

Explanation: A draggable item (an orange square with an emoji) and a trash can (gray square with bin emoji). The item is made draggable. On drag move, we position it at the pointer via transform (this is a crude positioning using event.pageX/Y, which could be refined to center the item under cursor, but it works simply). On drag end, we reset its position (so if dropped nowhere, it goes back to original spot). The #trash is a dropzone that accepts only the specific #drag-item. We require 75% overlap for it to count as a drop (overlap: 0.75 means the item must almost fully be on the trash). While dragging, if the item enters the trash area, we highlight it red; if it leaves, go back to gray. On drop, we "delete" the item by hiding it (setting display: none) and show an alert. This example demonstrates a delete use case and how to use overlap thresholds and visual feedback on drop targets.

## Example 5: Logging Events and Coordinates

Scenario: A debug example that logs various Interact.js events on an element.

```html
<div id="debug-target" style="width:100px; height:100px; background:#67e; touch-action:none; user-select:none;">
  Drag or Tap me
</div>
<script>
interact('#debug-target')
  .draggable({})    // enable dragging (no listeners here)
  .gesturable({})   // enable gestures if you put 2 fingers
  .on('dragstart dragmove dragend tap doubletap hold', function(event) {
    console.log(event.type,
                'pageX:', event.pageX, 'pageY:', event.pageY,
                'dx:', event.dx, 'dy:', event.dy,
                'speed:', event.speed);
  });
</script>
```

Explanation: We have a #debug-target which is a simple colored box. We call .draggable({}) and .gesturable({}) just to enable those interactions (so that drag events fire; gesturable is enabled to allow hold and other pointer events to come through). Then we use the .on() method to attach a listener for multiple event types: drag events, plus tap, doubletap, and hold. In the listener, we log the event type and some properties to the console: coordinates and delta, etc. If you run this and interact:
* Clicking quickly will log a tap event.
* Clicking and holding ~0.6s will log a hold event.
* Double-clicking will log doubletap.
* Dragging will log a series of dragmove and then a dragend.
This example is useful during development to understand what events are firing and the data they carry.

Each of these examples can be adapted to a Vue component easily (wrapping the HTML and script in a component, and using Vue's data if needed), but they are presented in a generic way for clarity. They demonstrate common scenarios: grid snapping, resizing with constraints, collision detection, dropzones, and debugging events.

---

[← Previous: Best Practices](./06-best-practices.md) | [Back to Index](./index.md)