# Best Practices and Performance Tips for Interact.js

Using Interact.js effectively involves not just writing the correct code, but also structuring your app and interactions for smooth performance and maintainability. Below are some best practices and common pitfalls to consider:

## 1. Use Transforms for Movement

When moving elements (dragging), prefer using CSS `transform: translate(...)` rather than changing absolute left/top positions. Transforms are handled by the GPU and result in smoother animations with less layout thrashing. In our examples, we stored data-x/data-y and applied translate() in the drag move events, which is ideal. Avoid directly setting many style properties that cause reflow (like top, left, width, height) on every mouse move; if you must, batch or throttle them.

## 2. Limit DOM Queries and Heavy Computation in Move Handlers

Drag and resize move events fire many times per second (for each mouse/touch movement). Keep the logic in these handlers as light as possible. For example, avoid querying the DOM extensively (e.g., document.querySelectorAll inside a move event) or performing complex calculations on every move. If you need expensive checks (like collision detection among many elements), consider using requestAnimationFrame to throttle updates or performing checks on end instead of every move.

## 3. Apply Needed CSS to Interactable Elements

Always apply:
* `touch-action: none;` and `user-select: none;` on draggable/resizable elements (and possibly their parent container). This prevents the browser's default touch gestures and text selection, which can otherwise cause janky behavior (e.g., page scrolling when trying to drag an element on mobile). Interact.js's dev-tools will warn if you forget this.
* Set appropriate cursors via CSS or the cursorChecker. Interact.js by default changes the cursor on the `<body>` (e.g., to move or ns-resize when you hover near an edge). If you prefer to handle cursors yourself, you can disable this by `interact(target).styleCursor(false)` or use a custom cursorChecker to return null. But generally, the default is helpful.

## 4. Clean Up on Component Unmount

If you attach Interact.js to elements in a Vue component, make sure to remove or destroy those interactions when the component is destroyed. Not doing so can cause memory leaks or stale event handlers. Two approaches:
* Call `interact(element).unset()` in the Vue onUnmounted hook to remove that element's interactable.
* Or if using a class/selector for multiple, you can call `interact(targetSelector).unset()` to remove all of them for that selector. (Be careful if that selector is used elsewhere.)

This step is especially important if you dynamically create/destroy components with interactables.

## 5. Reuse Interactables When Possible

Creating an interactable (`interact(selector)`) for a class or many elements means all those elements share one configuration. This is efficient. If you need each element to have distinct behavior, you might use separate calls or dynamic creation. But whenever the behavior can be the same, use a single interactable for multiple elements (as we did with .grid-item class). It reduces the overhead of setting up many listeners. Interact.js can handle many elements, but fewer configurations is easier to manage.

## 6. Tree-Shaking and Bundle Size

If you're concerned about performance in terms of app size, consider using the scoped packages as mentioned in Installation. Only include what you need. For example, if you only need drag and drop, you might not import the gesture or resize modules. This reduces your JS payload. Also, ensure not to include the @interactjs/dev-tools in production builds, as it adds overhead for debugging hints. If you followed the modular install guide, use the provided Babel plugin or environment checks to drop dev-tools in production.

## 7. Avoid Frequent re-renders During Interactions

In frameworks like Vue, triggering state updates on every drag move can cause the component to re-render excessively, hurting performance. Instead, update the DOM directly in the move events (as we've done using element.style) and only update reactive state at the end of the interaction or at some throttled interval. For example, in the grid tutorial, we updated the Vue widgets state only on dragend/resizeend, not every pixel move. This keeps the Vue reactivity overhead out of the tight loop of pointer moves. If you need live feedback in state, consider debouncing the state updates.

## 8. Use Appropriate Interaction Options

A few tips on options to avoid pitfalls:
* If you notice that clicking on interactive child elements (like a button inside a draggable) triggers a drag when it shouldn't, use ignoreFrom to exclude those elements. This prevents frustrating UX where everything you click turns into a drag.
* If you want to require a long press before drag (to differentiate from a click), use the hold option with a duration. This way quick taps won't start a drag.
* Set maxInteractions globally if you want to limit multi-touch. For example, if your app should only ever have one item dragged at a time (even if two fingers are used), do `interact.maxInteractions(1)`. This can simplify logic and avoid unexpected multi-pointer scenarios.
* Use autoScroll when needed to improve UX for large scrollable areas, but disable it if not needed to avoid unnecessary scrolling computations.

## 9. Testing Across Devices

Because Interact.js abstracts mouse/touch, ensure to test your interactions on both desktop and mobile. Pay attention to touch gestures like pinch zoom (make sure they don't trigger if not intended due to missing CSS) and ensure the draggable elements are large enough or have handles for touch. Sometimes an interaction that feels fine with a mouse might need larger hit areas for fingers.

## 10. Maintainability: Modularize Interaction Code

If you have many components using similar Interact.js logic, consider abstracting them. For example:
* Write a custom Vue Directive (v-interact-drag) that takes options and sets up the interactable in mounted and cleans up in unmounted.
* Or write composable functions (using Vue's Composition API) that encapsulate the interact setup. This could return refs and manage the onMounted/unmounted logic internally.

This way, if you need to change the interaction behavior, you do it in one place. It also keeps your component code cleaner. However, start simple – only abstract once you see repetition.

## 11. Testing and Debugging Interact.js Applications

Testing interactive elements can be challenging. Here are some strategies:

### Using Dev Tools

Interact.js provides a dev-tools package that helps identify issues:

```javascript
import interact from 'interactjs';
import '@interactjs/dev-tools';

// Now interact will warn about potential issues:
// - Missing touch-action: none
// - Device-specific concerns
// - Performance problems
```

### Simulating User Interactions in Tests

For unit and integration tests, you may need to simulate pointer events:

```javascript
// Helper function to simulate drag
function simulateDrag(element, dx, dy) {
  const rect = element.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;
  
  // Create and dispatch events
  const pointerdown = new PointerEvent('pointerdown', {
    bubbles: true,
    clientX: startX,
    clientY: startY
  });
  
  element.dispatchEvent(pointerdown);
  
  // Simulate movement
  const pointermove = new PointerEvent('pointermove', {
    bubbles: true,
    clientX: startX + dx,
    clientY: startY + dy
  });
  
  document.documentElement.dispatchEvent(pointermove);
  
  // End the interaction
  const pointerup = new PointerEvent('pointerup', {
    bubbles: true,
    clientX: startX + dx,
    clientY: startY + dy
  });
  
  document.documentElement.dispatchEvent(pointerup);
}

// In your test:
test('element can be dragged', async () => {
  const element = document.querySelector('.draggable');
  simulateDrag(element, 100, 50);
  
  // Assert the element moved as expected
  const transform = element.style.transform;
  expect(transform).toContain('translate(100px, 50px)');
});
```

### Visual Debugging Helpers

Add visual indicators for your interactions during development:

```javascript
interact('.draggable')
  .draggable({
    listeners: {
      start(event) {
        // Add a class to show interaction has started
        event.target.classList.add('dragging');
        
        // Optionally show debug overlay
        const debugOverlay = document.createElement('div');
        debugOverlay.className = 'debug-overlay';
        debugOverlay.style.cssText = `
          position: fixed;
          top: 0;
          right: 0;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 10px;
          z-index: 10000;
        `;
        document.body.appendChild(debugOverlay);
        event.target._debugOverlay = debugOverlay;
      },
      
      move(event) {
        // Update debug information
        if (event.target._debugOverlay) {
          event.target._debugOverlay.textContent = `
            dx: ${event.dx.toFixed(2)}, dy: ${event.dy.toFixed(2)}
            pageX: ${event.pageX.toFixed(2)}, pageY: ${event.pageY.toFixed(2)}
          `;
        }
        
        // Handle movement as usual
        // ...
      },
      
      end(event) {
        event.target.classList.remove('dragging');
        if (event.target._debugOverlay) {
          document.body.removeChild(event.target._debugOverlay);
          delete event.target._debugOverlay;
        }
      }
    }
  });
```

## 12. Accessibility Considerations

Interactive elements need to be accessible to all users. Here are tips for making your Interact.js implementations more accessible:

### Keyboard Alternatives

Provide keyboard alternatives for drag/resize operations:

```javascript
// For a draggable element
const draggable = document.querySelector('.draggable');
const interactable = interact(draggable).draggable({...});

// Add keyboard event listeners
draggable.setAttribute('tabindex', '0'); // Make focusable
draggable.setAttribute('role', 'button');
draggable.setAttribute('aria-label', 'Draggable item. Use arrow keys to move');

let x = 0, y = 0;
const STEP = 10; // Pixels to move per key press

draggable.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      y -= STEP;
      break;
    case 'ArrowDown':
      y += STEP;
      break;
    case 'ArrowLeft':
      x -= STEP;
      break;
    case 'ArrowRight':
      x += STEP;
      break;
    default:
      return;
  }
  
  e.preventDefault();
  draggable.style.transform = `translate(${x}px, ${y}px)`;
  
  // Store position for both keyboard and pointer interactions
  draggable.setAttribute('data-x', x);
  draggable.setAttribute('data-y', y);
});
```

### ARIA Attributes for State

Use ARIA attributes to communicate state:

```javascript
interact('.draggable')
  .draggable({
    listeners: {
      start(event) {
        event.target.setAttribute('aria-grabbed', 'true');
        // Announce to screen readers
        event.target.setAttribute('aria-live', 'assertive');
      },
      end(event) {
        event.target.setAttribute('aria-grabbed', 'false');
        event.target.removeAttribute('aria-live');
      }
    }
  });
```

### Focus Management for Dropzones

When implementing drag and drop, manage focus appropriately:

```javascript
interact('.dropzone')
  .dropzone({
    ondrop(event) {
      // After successful drop, focus the dropzone
      event.target.focus();
      // Or focus the dropped item
      event.relatedTarget.focus();
      
      // Announce the result to screen readers
      const announcement = document.getElementById('a11y-announce');
      announcement.textContent = 'Item dropped successfully';
    }
  });
```

## 13. Performance Optimization

For high-performance interactions, especially with many elements:

### Use requestAnimationFrame for DOM Updates

```javascript
interact('.draggable')
  .draggable({
    listeners: {
      move(event) {
        const target = event.target;
        // Store the movement values but don't update DOM yet
        target._dx = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        target._dy = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        
        // Schedule visual update
        if (!target._rafId) {
          target._rafId = requestAnimationFrame(() => {
            target.style.transform = `translate(${target._dx}px, ${target._dy}px)`;
            target.setAttribute('data-x', target._dx);
            target.setAttribute('data-y', target._dy);
            target._rafId = null;
          });
        }
      }
    }
  });
```

### Optimize for Mobile Devices

```javascript
// Configure based on device capabilities
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

interact('.draggable')
  .draggable({
    // Increase tolerance on mobile for easier dragging
    pointerMoveTolerance: isMobile ? 10 : 5,
    
    // Better inertia for touch
    inertia: {
      resistance: isMobile ? 20 : 10, // Higher resistance on mobile
      minSpeed: isMobile ? 300 : 200,
      endSpeed: isMobile ? 30 : 20
    },
    
    // Reduce computation on move for better performance
    throttle: isMobile ? 30 : 10 // Milliseconds between move events
  });
```

## 14. Common Pitfalls to Avoid

* **Not updating state on drop**: If you move elements purely via transforms and never update your underlying data model, the next time the component renders (or on page refresh), the elements might jump back to their old positions. Always sync the final positions/sizes to your app state if those changes should persist.
* **Forgetting inertia end event**: If using inertia, note that the dragend or resizeend event will fire after the inertia animation completes, not at the moment of release. Interact.js adds a draginertiastart event when inertia kicks in. Make sure your logic (e.g., cleaning up or updating state) accounts for that. If you treat the initial release as final, you might double-handle events.
* **Interference with CSS frameworks**: Some CSS (like Bootstrap's user-select or touch-action defaults, or draggable attributes on images) might conflict. For instance, `<img>` tags by default might be draggable by the browser (HTML5 native drag). If you make them interact.js draggable, set `draggable="false"` on the img to prevent default browser drag image behavior.
* **Coordinate systems**: Be mindful of the difference between page vs client coordinates. If your container is offset or the page is scrolled, pageX vs clientX differ. Interact events provide both. Usually, using event.pageX/Y for absolute positioning, or using transforms as we did, is fine. Just be consistent.
* **z-index and stacking**: When dragging, if the element goes underneath others due to HTML stacking context, consider adding a class on drag start to bring it to front (position: absolute; z-index high). We did this in the list reordering example. Removing it on drop restores normal flow.

By following these best practices, you can create highly interactive interfaces that remain smooth and responsive. Interact.js is quite performant, but it gives you low-level control, so how you implement the interactions will determine the final performance. Always profile if you encounter jank: check if it's painting, layout, or scripting causing the slowdown and adjust accordingly (e.g., use transforms, throttle events, etc., as discussed).

### Recap:
* Optimize your event handlers, especially for continuous events.
* Use the tools Interact.js provides (snapping, restriction, etc.) rather than reinventing logic manually.
* Clean up to prevent leaks.
* Keep user experience in mind (don't forget to disable text selection, etc. to avoid annoyance).
* Modularize and reuse your interaction code for easier maintenance as your project grows.
* Ensure your interactive elements are accessible to all users.
* Use performance optimizations for smoother experiences, especially on mobile.
* Test thoroughly across different devices and browsers.

---

[← Previous: Tutorials](./05-tutorials.md) | [Back to Index](./index.md) | [Next: Practical Examples →](./07-examples.md)