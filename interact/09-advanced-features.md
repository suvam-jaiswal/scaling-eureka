# Advanced Features of Interact.js

Interact.js offers a range of advanced features beyond basic dragging and resizing. This document covers those features in detail.

## 1. Custom Interaction Class

For advanced scenarios, you can interact directly with the Interaction class:

```javascript
import interact, { Interaction } from '@interactjs/interact';

// Create a new custom interaction
const interaction = new Interaction({ 
  pointerType: 'mouse',
  pointerEvent: mouseEvent 
});

// Manually start an interaction
interaction.start({ 
  name: 'drag', 
  interactable: myInteractable,
  element: targetElement 
});

// You can also use the interactions registry
const activeInteractions = interact.interactions.list;
```

This is useful for programmatically controlling interactions or creating complex custom interaction behavior.

## 2. Interaction Lifecycle Hooks

Interact.js provides lifecycle hooks for deeper integration:

```javascript
// Listen to all interactions globally
interact.on('interactions:before-action-start', ({ interaction }) => {
  // Do something before any interaction starts
});

interact.on('interactions:action-start', ({ interaction }) => {
  // When an interaction actually starts
});

interact.on('interactions:action-move', ({ interaction }) => {
  // During move
});

interact.on('interactions:action-end', ({ interaction }) => {
  // When interaction ends
});

interact.on('interactions:after-action-end', ({ interaction }) => {
  // After all end handlers have run
});
```

These hooks are powerful for implementing cross-cutting concerns like analytics or global UI updates.

## 3. Inertia Customization

Fine-tuning inertia for more natural interactions:

```javascript
interact('.draggable').draggable({
  inertia: {
    resistance: 10,       // Resistance (higher = less inertia)
    minSpeed: 200,        // Minimum start velocity for inertia
    endSpeed: 20,         // Velocity when inertia stops
    allowResume: true,    // Allow resuming an inertia movement by clicking
    smoothEndDuration: 300 // ms to slow down before stopping
  },
  listeners: {
    move: (event) => { /* ... */ },
    end: (event) => { /* ... */ },
    inertiastart: (event) => {
      // Special event that fires when inertia begins
      console.log('Inertia started');
    }
  }
});
```

## 4. Dynamic Modifier Configuration

Modifiers can be updated dynamically during an interaction:

```javascript
const interactable = interact('.resizable').resizable({
  modifiers: [
    interact.modifiers.restrictSize({
      min: { width: 100, height: 100 }
    })
  ]
});

// Later, in response to some event
function updateRestrictions() {
  const modifier = interactable.options.resize.modifiers[0];
  modifier.options.min.width = 200;  // Update minimum width
  
  // Force recalculation of modifiers on next move
  interact.pointerMoveTolerance(0);
}
```

## 5. Custom Coordinate Calculations

For specialized coordinate systems:

```javascript
interact('.custom-element')
  .draggable({
    // Use the element itself as the origin
    origin: 'self',
    
    // Or provide a specific origin point
    origin: { x: 0, y: 0 },
    
    // Or dynamically calculate origin
    origin: (target, element, action) => {
      // Return { x, y } based on current state
      return {
        x: element.getBoundingClientRect().left,
        y: element.getBoundingClientRect().top
      };
    },
    
    // Choose whether to use page or client coordinates as the source
    deltaSource: 'page'  // or 'client'
  });
```

## 6. Advanced Auto-Scroll Options

Configure precision auto-scrolling behavior:

```javascript
interact('.item').draggable({
  autoScroll: {
    container: document.querySelector('#scroll-container'),
    margin: 50,        // Start scrolling when pointer is this close to edge
    distance: 5,       // Scroll this many pixels per animation frame
    interval: 10,      // Milliseconds between scroll calculations
    
    // Dynamic scroll speed based on proximity to edge
    speed: 300,        // Pixels per second at closest point to edge
    
    // Only auto-scroll in specific directions
    directions: {
      x: true,  // Allow horizontal scrolling 
      y: true   // Allow vertical scrolling
    }
  }
});
```

## 7. Persistent Interactables with Selectors

Working with elements that may be added/removed from DOM:

```javascript
// This selector will match any element with .dynamic-item class, 
// even ones added to the DOM after this code runs
interact('.dynamic-item').draggable({
  listeners: { 
    move: (event) => {
      const target = event.target;
      const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
      
      target.style.transform = `translate(${x}px, ${y}px)`;
      
      target.setAttribute('data-x', x.toString());
      target.setAttribute('data-y', y.toString());
    }
  }
});

// Later, add new elements
const newItem = document.createElement('div');
newItem.className = 'dynamic-item';
document.body.appendChild(newItem);
// The new element will automatically be draggable
```

## 8. Custom ActionChecker

Control when an action can start:

```javascript
interact('.conditional').draggable({
  actionChecker: (pointer, event, action, interactable, element, interaction) => {
    // Only allow dragging if a condition is met
    if (element.classList.contains('locked')) {
      return null; // Prevent interaction
    }
    
    // Could also change the action type
    if (pointer.shiftKey) {
      return { name: 'resize' }; // Change to resize
    }
    
    return action; // Allow the default action
  }
});
```

## 9. Advanced Drop Zone Validation

Custom drop logic with dynamic acceptance:

```javascript
interact('.dropzone').dropzone({
  accept: '.draggable', // Basic CSS selector
  
  // Advanced checker for complex conditions
  checker: (dragEvent,           // The drag event
            event,               // The original pointer event
            dropped,             // Whether the standard check passed
            dropzone,            // The dropzone Interactable
            dropElement,         // The dropzone element
            draggable,           // The draggable Interactable
            draggableElement) => {
              
    // Simple example: only accept drop if the draggable element
    // contains a specific data attribute value
    if (draggableElement.getAttribute('data-type') === 'valid') {
      return true;
    }
    
    // Get more specific about positions
    const dropRect = dropElement.getBoundingClientRect();
    const dragRect = draggableElement.getBoundingClientRect();
    
    // Check if the draggable's center is inside the dropzone
    const dragCenterX = dragRect.left + dragRect.width / 2;
    const dragCenterY = dragRect.top + dragRect.height / 2;
    
    return (dragCenterX >= dropRect.left &&
            dragCenterX <= dropRect.right &&
            dragCenterY >= dropRect.top &&
            dragCenterY <= dropRect.bottom);
  }
});
```

## 10. Pointer Event Customization

Fine-grained control over pointer events:

```javascript
interact(element).draggable({
  // Configure low-level pointer event handling
  pointerMoveTolerance: 5,  // Pixels pointer must move to start drag
  
  // Double-tap and hold options
  // Specify faster double-tap detection
  pointerEvents: {
    holdDuration: 1000,     // ms to wait for a "hold" event
    ignoreFrom: '.handle',  // Selector for elements to ignore 
    allowFrom: '.drag-handle', // Selector for elements to allow from
  }
});

// Control if text selection is prevented
interact.pointerEvents.defaults.preventDefault = false;
```

## 11. Custom Snap Functions

Beyond the built-in grid snapper, create custom snap points:

```javascript
interact('.snappable').draggable({
  modifiers: [
    interact.modifiers.snap({
      // Custom function that returns snap targets
      targets: (x, y, interaction) => {
        // Dynamic snap points
        const snapPoints = [];
        
        // Add snap points for each .snapTarget element
        document.querySelectorAll('.snapTarget').forEach(el => {
          const rect = el.getBoundingClientRect();
          snapPoints.push({ x: rect.left, y: rect.top, range: 20 });
          snapPoints.push({ x: rect.right, y: rect.bottom, range: 20 });
        });
        
        // Add a circular snap point
        const angle = interaction.currentAngle || 0;
        const radius = 100;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Snap points along a circle
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
          snapPoints.push({
            x: centerX + radius * Math.cos(a),
            y: centerY + radius * Math.sin(a),
            range: 20
          });
        }
        
        return snapPoints;
      }
    })
  ]
});
```

## 12. SVG Integration

Working with SVG elements requires special handling:

```javascript
interact('svg .draggable-node')
  .draggable({
    // Use the SVG element's coordinate system as origin
    origin: 'self',
    
    listeners: {
      move: (event) => {
        const target = event.target;
        // For SVG elements, get current transform and update it
        let matrix = target.getCTM();
        matrix = matrix.translate(event.dx, event.dy);
        
        // Apply the new transform matrix to the SVG element
        target.setAttribute('transform', 
          `matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, ${matrix.e}, ${matrix.f})`
        );
      }
    }
  });
```

## 13. Combining Multiple Interaction Types

An element can have multiple interaction types simultaneously:

```javascript
// Make an element both draggable and resizable
interact('.multi-interaction')
  .draggable({
    modifiers: [interact.modifiers.restrict({ restriction: 'parent' })],
    listeners: {
      move: (event) => {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        
        target.style.transform = `translate(${x}px, ${y}px)`;
        
        target.setAttribute('data-x', x.toString());
        target.setAttribute('data-y', y.toString());
      }
    }
  })
  .resizable({
    edges: { left: true, right: true, bottom: true, top: true },
    listeners: {
      move: (event) => {
        const target = event.target;
        let x = (parseFloat(target.getAttribute('data-x')) || 0);
        let y = (parseFloat(target.getAttribute('data-y')) || 0);
        
        // Update the element's style
        target.style.width = `${event.rect.width}px`;
        target.style.height = `${event.rect.height}px`;
        
        // Translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;
        
        target.style.transform = `translate(${x}px, ${y}px)`;
        
        target.setAttribute('data-x', x.toString());
        target.setAttribute('data-y', y.toString());
      }
    }
  })
  .gesturable({
    listeners: {
      move: (event) => {
        const target = event.target;
        // Scale the element based on gesture
        target.style.transform += ` scale(${event.scale})`;
        // Rotate based on gesture
        target.style.transform += ` rotate(${event.angle}deg)`;
      }
    }
  });
```

## 14. Advanced Event Propagation Control

Control the propagation of events in complex UIs:

```javascript
interact('.nested-draggable')
  .draggable({
    listeners: {
      start: (event) => {
        // Prevent other interactions from starting
        event.interaction.stop();
        event.preventDefault();
        
        // Conditionally stop event propagation to parent
        if (shouldPreventPropagation()) {
          event.stopPropagation();
        }
      }
    }
  });
```

## 15. Using Interact.js with Canvas

For canvas-based applications:

```javascript
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Array of objects to be interactive
const shapes = [
  { id: 1, x: 50, y: 50, width: 100, height: 80, color: 'red' },
  { id: 2, x: 200, y: 100, width: 80, height: 80, color: 'blue' }
];

// Draw the shapes
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  shapes.forEach(shape => {
    ctx.fillStyle = shape.color;
    ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
  });
  
  requestAnimationFrame(draw);
}

draw();

// Make the canvas interactive
interact(canvas)
  .draggable({
    // Find which shape was clicked
    actionChecker: (pointer, event, action, interactable) => {
      const rect = canvas.getBoundingClientRect();
      const x = pointer.clientX - rect.left;
      const y = pointer.clientY - rect.top;
      
      // Check if any shape was clicked
      const clickedShape = shapes.find(shape => 
        x >= shape.x && x <= shape.x + shape.width &&
        y >= shape.y && y <= shape.y + shape.height
      );
      
      if (clickedShape) {
        // Store the clicked shape on the interaction
        interactable._clickedShapeId = clickedShape.id;
        return action; // Allow drag
      }
      
      return null; // Prevent drag if no shape was clicked
    },
    
    listeners: {
      move: (event) => {
        const shapeId = event.interactable._clickedShapeId;
        const shape = shapes.find(s => s.id === shapeId);
        
        if (shape) {
          shape.x += event.dx;
          shape.y += event.dy;
        }
      }
    }
  });
```

By leveraging these advanced features, you can build highly sophisticated interactive interfaces with precise control over behavior. These techniques let you customize virtually every aspect of how users interact with your elements.

---

[← Previous: TypeScript Interfaces](./08-typescript-interfaces.md) | [Back to Index](./index.md) | [Next: Modifiers System →](./10-modifiers-system.md)