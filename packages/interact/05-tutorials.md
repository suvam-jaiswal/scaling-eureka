# Tutorials and Implementation Guides

In this section, we will go through step-by-step tutorials for several real-world scenarios using Interact.js with Vue 3 and TypeScript. Each tutorial builds on the concepts discussed earlier, with a focus on a draggable/resizable grid system as a more advanced example.

## Tutorial 1: Basic Draggable Box

**Goal**: Create a simple Vue component with a box that can be dragged around within its parent container.

### Steps:

1. **Set up the Component**: Create a Vue component (e.g., DraggableBox.vue). In the template, add a div for the box:

```vue
<template>
  <div ref="box" class="box">Drag me!</div>
</template>
```

And some basic styling in `<style>` (give it a size, background, etc., and importantly position: absolute if contained in a non-body parent, so it can move):

```css
.box {
  width: 100px; height: 100px;
  background: lightcoral;
  position: absolute;
  touch-action: none; user-select: none;
}
```

We use absolute positioning so we can freely move it within a container. The CSS ensures it won't scroll or select text on touch.

2. **Import and initialize Interact.js**: In the script, import interact and setup the draggable on mount.

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import interact from 'interactjs';
const box = ref<HTMLElement|null>(null);
onMounted(() => {
  if (box.value) {
    interact(box.value).draggable({
      listeners: {
        move(event) {
          // Update position
          const target = event.target;
          // keep track of drag positions using data attributes
          const x = (parseFloat(target.getAttribute('data-x')||'0')) + event.dx;
          const y = (parseFloat(target.getAttribute('data-y')||'0')) + event.dy;
          // apply translation
          target.style.transform = `translate(${x}px, ${y}px)`;
          // store new positions
          target.setAttribute('data-x', x.toString());
          target.setAttribute('data-y', y.toString());
        }
      }
    });
  }
});
</script>
```

**Explanation**: We store the element's coordinates in data-x and data-y attributes. Initially, these are 0 (we treat the starting position as (0,0)). On each drag move, event.dx/dy give the change – we add that to the stored values and apply a CSS transform translate. This moves the box incrementally. We then update the stored data attributes for the next event. This way, the box moves with the cursor.

3. **Test and refine**: When you run the app, you should be able to click and drag the box around. If it's not moving:
   * Check that the element has `touch-action: none;` in CSS (for touch devices).
   * Ensure the script ran (the component was mounted). If using `<script setup>` as above, it should work automatically.
   * Open the console to see if any errors (like not finding the element or interact not imported correctly).
   * If the box moves but "jumps back" on each drag, it means the position isn't being accumulated correctly. Using the data attribute method as above prevents that jump.

4. **Constraint (optional)**: To restrict dragging within the parent (say the parent is a container element of fixed size), you can add a restrict modifier:

```javascript
interact(box.value).draggable({
  modifiers: [ interact.modifiers.restrict({ restriction: 'parent' }) ],
  listeners: { move(/*...*/) { ... } }
});
```

This will keep the box from going outside its parent boundaries.

Now you have a basic draggable component. This pattern of using data-x/data-y for storing transform positions is common and will be reused for more complex examples.

## Tutorial 2: Resizable Element with Snap to Grid

**Goal**: Create an element that the user can resize by dragging from its edges, with the resizing snapping to a grid (for uniform increments).

### Steps:

1. **Component Setup**: Similar to before, create (or reuse) a component with a target element:

```html
<div ref="panel" class="panel">Resize me</div>
```

Style it with a border or handles for clarity:

```css
.panel {
  width: 150px; height: 150px;
  background: lightblue;
  position: relative;
  touch-action: none; user-select: none;
}
/*optional: visual resize handles at corners*/
.panel::after {
  content: "";
  position: absolute; bottom: 0; right: 0;
  width: 15px; height: 15px;
  background: darkblue;
  cursor: se-resize;
}
```

Here we made a pseudo-element at bottom-right as a visual handle (for UX). `cursor: se-resize` gives a diagonal arrow cursor when hovering that corner.

2. **Enable Resizing with Snap**: In the script:

```javascript
import interact from 'interactjs';
const panel = ref<HTMLElement|null>(null);
onMounted(() => {
  if (panel.value) {
    interact(panel.value).resizable({
      edges: { top: true, left: true, bottom: true, right: true },
      modifiers: [
        interact.modifiers.snap({
          targets: [ interact.snappers.grid({ x: 20, y: 20 }) ],
          range: Infinity,  // always snap
          offset: { x: 0, y: 0 }
        })
      ],
      listeners: {
        move(event) {
          // similar to earlier: get data-* for x,y or default 0
          const target = event.target;
          let x = (parseFloat(target.getAttribute('data-x')||'0'));
          let y = (parseFloat(target.getAttribute('data-y')||'0'));
          // update element size
          target.style.width  = `${event.rect.width}px`;
          target.style.height = `${event.rect.height}px`;
          // translate when resizing from top/left edges
          x += event.deltaRect.left;
          y += event.deltaRect.top;
          target.style.transform = `translate(${x}px, ${y}px)`;
          target.setAttribute('data-x', x.toString());
          target.setAttribute('data-y', y.toString());
        }
      }
    });
  }
});
```

**Explanation**: We enabled resizing on all edges (top, left, bottom, right). We added a snap modifier with a 20x20 grid – this means the element's new width/height will snap to multiples of 20px. (It also snaps the position via deltaRect, ensuring the edges align to the grid.) In the move listener, we update width and height based on event.rect. We also adjust x and y if the top or left edges moved (event.deltaRect.left/top would be non-zero if the left or top edge was dragged, meaning the element's position shifted). We then apply the transform translate to keep the element in the correct spot and store the new x,y. The result is that as you resize, the panel's size jumps in 20px increments, and it stays aligned.

3. **Test the Snap**: Try resizing the panel. You should see it "jump" in steps of 20px rather than smoothly, and the guide or grid effect will be apparent if you overlay a 20px grid background. Adjust the grid size to your liking. If you want a finer or coarser snap, change the `{ x: 20, y: 20 }`. If you want snapping only at the end of resize, you could use `endOnly: true` in the snap modifier (so the element would resize freely during drag, but on release it snaps to the nearest grid).

4. **Maintain Aspect Ratio (Optional)**: If you wanted the panel to maintain a square shape, you could add the aspectRatio modifier:

```javascript
interact.modifiers.aspectRatio({ ratio: 'preserve' })
```

This ensures the aspect ratio when resizing remains whatever it was at start (effectively locking width/height proportion). You'd include it in the modifiers array. Or specify a number like `{ ratio: width/height }`.

Now you have a panel that can be resized by dragging its edges/corners, snapping to a grid. This is a building block for grid systems or resizable layouts.

## Tutorial 3: Drag and Drop (Reorderable List Example)

**Goal**: Use draggable and dropzone to create a simple list of items that can be reordered by dragging and dropping.

**Scenario**: You have a list of items (e.g., tasks in a todo list). You want to drag an item and drop it above or below another to reorder.

### Steps:

1. **HTML structure**: For simplicity, suppose each item is a div in a container:

```html
<div class="list">
  <div class="list-item" v-for="item in items" :key="item.id" :id="item.id">
    {{ item.text }}
  </div>
</div>
```

The .list container holds .list-item elements.
Style .list-item with user-select: none; and maybe a border. They could be relatively positioned; we might not need absolute here because we can allow dragging all over and using dropzones to reorder (the original DOM order will determine placement).

2. **Make items draggable**: In script:

```javascript
onMounted(() => {
  interact('.list-item').draggable({
    inertia: true,
    listeners: {
      move(event) {
        // We will use absolute positioning while dragging
        event.target.style.position = 'absolute';
        event.target.style.zIndex = '1000';
        // move with translate
        event.target.style.transform =
          `translate(${event.pageX - event.target.offsetWidth/2}px, ${event.pageY - event.target.offsetHeight/2}px)`;
      },
      end(event) {
        // Reset styles after drop
        event.target.style.transform = '';
        event.target.style.position = '';
        event.target.style.zIndex = '';
      }
    }
  });
});
```

This snippet makes all .list-item elements draggable. On move, we set the position to absolute and translate the item to follow the pointer (centering it under the cursor for a nicer feel). On end, we remove the transform and positioning so that it falls back into the document flow at its new place (assuming we move the DOM node on drop).

3. **Setup dropzones**: We want each list item to act as a dropzone to catch drops above/below it. One strategy: use two drop targets for each item – one area above it, one below it. For simplicity, we'll treat each .list-item itself as a dropzone (meaning drop onto an item to place the dragged item above it).

```javascript
interact('.list-item').dropzone({
  accept: '.list-item',  // accept other list items
  overlap: 0.5,
  ondragenter(event) {
    const dropItem = event.target;
    dropItem.classList.add('drop-hover');
  },
  ondragleave(event) {
    event.target.classList.remove('drop-hover');
  },
  ondrop(event) {
    const dropItem = event.target;
    const draggedItem = event.relatedTarget;
    // Swap or reorder items in DOM or data
    const list = dropItem.parentNode;
    // Insert the dragged item before the drop target
    list.insertBefore(draggedItem, dropItem);
  }
});
```

We configure each item as a dropzone that accepts the same type (other items). We highlight it on dragenter (maybe with a CSS class that changes background). On drop, we perform a simple DOM manipulation: get the parent .list and insert the dragged item node before the drop target item. This effectively moves the dragged item in the DOM to that new position.

4. **Data consistency**: If your list is generated from an array (items), after reordering DOM you should also update the array to reflect the new order. In ondrop, instead of directly manipulating DOM, you might update your Vue data (like using the indexes of drop and dragged items to swap elements in the array), and let Vue re-render the list. Doing that ensures the source of truth (the data) is updated. The DOM swap approach works, but bypasses Vue's reactivity.

5. **Test reordering**: Drag an item over another; when the pointer is over the middle of another item, that item should highlight, and releasing should drop the dragged item above it. You can expand this idea to have a visual placeholder. For example, on dragenter you could create a blank space indicating where the item will land.

This tutorial demonstrates using dropzones for reordering. This is a simplistic implementation (real reorder lists often handle more edge cases, like dragging to empty space at end, etc.), but it shows how Interact.js can be used for sortable interfaces.

## Tutorial 4: Building a Draggable & Resizable Grid Layout (Advanced)

Now for the main event: a draggable, resizable grid system in Vue 3. This is akin to a dashboard where widgets can be rearranged and resized on a grid (similar to libraries like Gridster or Vue Grid Layout). We will outline how to build a basic version of this using Interact.js.

**Goal**: We have a grid (say 12 columns) and various widgets that occupy some cells. Users can drag widgets to new positions and resize them to cover more or fewer grid cells. Movement and resizing should snap to the grid. We should also avoid collisions (prevent overlapping widgets).

### Steps:

1. **Define the Grid and Item Data**:
Decide how to represent positions. For example, if we have a 12-column grid and variable rows, we might represent each widget as an object with properties `{ id, x, y, w, h }` – where (x,y) is the top-left cell coordinate (e.g., x=0..11, y=row index), and w,h are width and height in grid cell units. For simplicity, let's say each cell is 100x100 pixels. We will map these to pixel positions.

```javascript
const gridCols = 12;
const cellSize = 100; // px
const widgets = ref([
  { id: 'w1', x: 0, y: 0, w: 3, h: 2, name: 'Widget 1' },
  { id: 'w2', x: 3, y: 0, w: 3, h: 1, name: 'Widget 2' },
  // ... more widgets
]);
```

This is our reactive state for widget positions.

2. **Grid Template**:
We create a container for the grid and loop through widgets:

```html
<div class="grid-container" ref="gridContainer">
  <div v-for="item in widgets" :key="item.id" class="grid-item"
       :data-id="item.id"
       :style="{
         width: item.w * cellSize + 'px',
         height: item.h * cellSize + 'px',
         transform: 'translate(' + item.x * cellSize + 'px,' + item.y * cellSize + 'px)'
       }">
    {{ item.name }}
  </div>
</div>
```

Each .grid-item is absolutely positioned within .grid-container via transform. We set its size and position based on the grid coordinates multiplied by cellSize. The container .grid-container should be position: relative; .grid-item can be position: absolute (since we use transform, absolute isn't strictly required, but setting absolute helps if we want to use top/left instead of transform).
CSS for .grid-container might define a width (e.g., 1200px for 12 columns * 100px each) and a min-height. .grid-item style should include touch-action: none; user-select: none; cursor: move; etc.

3. **Make Grid Items Draggable & Resizable**:
In onMounted, we attach interact to .grid-item elements:

```javascript
onMounted(() => {
  // Draggable
  interact('.grid-item').draggable({
    modifiers: [
      interact.modifiers.snap({
        targets: [ interact.snappers.grid({ x: cellSize, y: cellSize }) ],
        range: Infinity,
        offset: 'startCoords'  // align snapping to initial position of element
      }),
      interact.modifiers.restrict({ restriction: gridContainer.value })
    ],
    listeners: {
      move(event) {
        const target = event.target;
        // current translation from transform
        let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      },
      end(event) {
        // On drop, update the widget's grid coordinates in state
        const id = event.target.getAttribute('data-id');
        // calculate grid coords from final pixel position
        const finalX = parseFloat(event.target.getAttribute('data-x')) || 0;
        const finalY = parseFloat(event.target.getAttribute('data-y')) || 0;
        const gridX = Math.round(finalX / cellSize);
        const gridY = Math.round(finalY / cellSize);
        const widget = widgets.value.find(w => w.id === id);
        if (widget) {
          widget.x = gridX;
          widget.y = gridY;
        }
        // reset the transform and data-attributes
        event.target.style.transform =
          `translate(${gridX * cellSize}px, ${gridY * cellSize}px)`;
        event.target.removeAttribute('data-x');
        event.target.removeAttribute('data-y');
      }
    }
  });
  // Resizable
  interact('.grid-item').resizable({
    edges: { left: true, right: true, top: true, bottom: true },
    modifiers: [
      interact.modifiers.snap({
        targets: [ interact.snappers.grid({ x: cellSize, y: cellSize }) ],
        range: Infinity,
        offset: 'startCoords'
      }),
      interact.modifiers.restrictEdges({
        outer: gridContainer.value, endOnly: true
      })
    ],
    listeners: {
      move(event) {
        const target = event.target;
        // Compute new width/height in pixels from event.rect
        let newWidth  = event.rect.width;
        let newHeight = event.rect.height;
        target.style.width  = newWidth + 'px';
        target.style.height = newHeight + 'px';
        // Also move if top/left edges were dragged
        let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.deltaRect.left;
        let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.deltaRect.top;
        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      },
      end(event) {
        // Update the widget's w,h (grid size) in state
        const id = event.target.getAttribute('data-id');
        const finalW = parseFloat(event.target.style.width);
        const finalH = parseFloat(event.target.style.height);
        const gridW = Math.round(finalW / cellSize);
        const gridH = Math.round(finalH / cellSize);
        const x = parseFloat(event.target.getAttribute('data-x')) || 0;
        const y = parseFloat(event.target.getAttribute('data-y')) || 0;
        const gridX = Math.round(x / cellSize);
        const gridY = Math.round(y / cellSize);
        const widget = widgets.value.find(w => w.id === id);
        if (widget) {
          widget.w = gridW;
          widget.h = gridH;
          widget.x = gridX;
          widget.y = gridY;
        }
        // Snap the element's style to exact grid
        event.target.style.width  = gridW *cellSize + 'px';
        event.target.style.height = gridH* cellSize + 'px';
        event.target.style.transform = `translate(${gridX * cellSize}px, ${gridY * cellSize}px)`;
        target.removeAttribute('data-x');
        target.removeAttribute('data-y');
      }
    }
  });
});
```

This is a lot, but essentially:
* **Draggable**: We snap to the grid and restrict movement to the container. In move, we update pixel translation as we did in earlier examples. In end, we compute the nearest grid cell coordinates by rounding the final pixel position divided by cellSize. We then update the corresponding widget's x, y in our reactive state. We also adjust the element's transform to exactly align to the grid (in case it was mid-cell due to any reason) and clear temporary data attributes.
* **Resizable**: We allow resizing from any edge. We snap the edges to the grid and restrict the outer edges to not go outside the container (restrictEdges with outer: container). In move, we apply the new width/height (pixel values) and also translate the element if the top or left edge moved (similar to earlier). In end, we calculate the new w, h in grid units by rounding the pixel size, and update the widget's data. Also update x,y in case it moved. Then set the element's style to the exact snapped grid size and position.

4. **Collision Handling**: With snapping, if two widgets are dragged to the same cells, they will overlap visually. Handling collisions (to prevent overlaps) is complex – one approach is to detect overlap and either disallow drop or push the other widget. A simpler approach: on drag move or end, you can check if the target grid cells are already occupied by another widget. If yes, you could reject the move (e.g., snap back to original). For brevity, we won't implement full collision resolution here, but you could:
   * Maintain a 2D array or set of occupied cells (updated whenever widget positions change).
   * On dragmove, if an item enters an occupied cell, give visual feedback (like red outline).
   * On dragend, if target position is occupied, either prevent it (reset to original position) or swap positions with the occupant, etc.
   
   This logic can be quite involved. A simpler alternative is to use the dropzone approach – treat each cell as a dropzone and allow drop only if empty, but managing dozens of dropzones (for each cell) might be less efficient.

5. **Test the Grid**:
When you drag a widget, it should move in 100px increments (snapping to grid cells). When you drop, the reactive widgets data updates, so if you re-render or on next drag it will consider its new position. Resizing similarly snaps to the grid. Try resizing a widget; it will expand or contract to consume whole cells.

6. **Reactive Updates**:
Because we update the widgets array on interaction end, the template styles (computed from item.x, item.y, item.w, item.h) will automatically reflect the new positions/sizes if the component re-renders. We manually also set the element's style at the end of interactions to avoid any visible jank between the drop and Vue's next render cycle.

Note: This grid system can be further enhanced:
* Add guidelines or a grid background for better UX.
* Implement a smarter collision handling or a layout algorithm to reposition widgets if one is dropped on another.
* Emit events when a widget is moved or resized (so that parent components can save layouts or do additional logic).
* Optimize performance for many widgets (our approach attaches one Interactable for all .grid-item via the class selector, which is fine; Interact.js will handle each element).

Despite the complexity, we've achieved a basic dashboard-like grid with draggable, resizable widgets using Interact.js and Vue 3.

---

[← Previous: API Reference](./04-api.md) | [Back to Index](./index.md) | [Next: Best Practices →](./06-best-practices.md)