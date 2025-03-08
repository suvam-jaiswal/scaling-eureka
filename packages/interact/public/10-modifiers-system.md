# Interact.js Modifiers System

The modifiers system is one of the most powerful features of Interact.js, allowing you to modify the behavior of interactions. This guide will explain how modifiers work, the built-in modifiers available, and how to create custom modifiers.

## How Modifiers Work

Modifiers alter coordinates and provide constraints during interactions. They process interaction data in sequence (like a pipeline) where each modifier can change values before the next one runs.

The general structure of a modifier configuration:

```javascript
interact('.element').draggable({
  modifiers: [
    // One or more modifier objects
    interactModifier1(options1),
    interactModifier2(options2),
    // ...etc
  ]
})
```

Each modifier is applied in order, which means the sequence matters. For example, if you want to both restrict an element to a boundary AND snap it to a grid, the order determines the result:

- `[restrict, snap]`: First restrict to boundary, then snap to grid points within that boundary
- `[snap, restrict]`: First snap to grid (anywhere), then restrict those snapped points to the boundary

## Built-in Modifiers

### 1. Snap Modifier

Snaps interaction coordinates to specified points or a grid.

```javascript
interact.modifiers.snap({
  targets: [
    // Target can be a point
    { x: 100, y: 100, range: 25 },
    
    // Or a grid
    interact.snappers.grid({ x: 50, y: 50 }),
    
    // Or a function returning points
    (x, y, interaction) => {
      // Return snap targets based on current conditions
      return { x: Math.round(x / 20) * 20, y: Math.round(y / 20) * 20 };
    }
  ],
  // How to check distance to snap target (defaults to 'euclidean')
  // Options: 'euclidean', 'manhattan', or custom function
  range: 20,          // Distance in pixels to snap (or Infinity for always)
  offset: { x: 0, y: 0 }, // Offset applied to snap targets
  relativePoints: [   // Points on the element used for snapping
    { x: 0, y: 0 },   // Top-left by default
    { x: 1, y: 1 }    // You can add bottom-right, center, etc.
  ],
  endOnly: false      // Whether to apply only at end of interaction
})
```

### 2. Restrict Modifier

Restricts the movement of interaction coordinates to within specified boundaries.

```javascript
interact.modifiers.restrict({
  // The restriction can be:
  restriction: 'parent', // 'parent' or 'self' as string shortcuts
  
  // Or a specific element/selector
  restriction: document.getElementById('boundary'),
  restriction: '#boundary',
  
  // Or a rect object
  restriction: {
    top: 0, left: 0, bottom: 500, right: 500,
    width: 500, height: 500
  },
  
  // Or a function that returns any of the above
  restriction: (x, y, element, interactable, interaction) => {
    // Dynamically determine restriction area
    return someElement.getBoundingClientRect();
  },
  
  // Optional parameters
  elementRect: { top: 0, left: 0, bottom: 1, right: 1 }, // How the element's rect is calculated for restriction
  endOnly: false, // Whether to apply only at the end of interaction
  offset: { top: 10, left: 10, bottom: -10, right: -10 } // Padding inside restriction area
})
```

### 3. RestrictEdges Modifier

Specifically restricts the edges of an element (useful for resizable elements).

```javascript
interact.modifiers.restrictEdges({
  // Outer edges restriction (element must be inside this)
  outer: 'parent',
  
  // Inner edges restriction (element must contain this)
  inner: { width: 100, height: 100 },
  
  // Can also use function as with restrict
  outer: (x, y, element, interaction) => {
    return calculateBoundary();
  },
  
  endOnly: false,
  offset: { top: 10, left: 10, bottom: -10, right: -10 }
})
```

### 4. RestrictSize Modifier

Restricts the size of an element during resizing.

```javascript
interact.modifiers.restrictSize({
  min: { width: 100, height: 100 }, // Minimum size
  max: { width: 500, height: 400 }, // Maximum size
  endOnly: false
})
```

### 5. AspectRatio Modifier

Maintains a specific aspect ratio during resizing.

```javascript
interact.modifiers.aspectRatio({
  // The desired ratio (width/height)
  ratio: 16/9, 
  
  // Or 'preserve' to maintain the starting ratio
  ratio: 'preserve',
  
  // Which edges are modified to maintain ratio
  // The default adjusts the opposite edge to the one being dragged
  modifiers: [otherModifier1, otherModifier2], // Optional inner modifiers
  
  // Optional custom implementation
  equalDelta: true, // Change width & height by equal pixel amounts
  
  // Style of aspect ratio preservation
  modifyCoords: (coords, interaction) => {
    // Custom resize logic
    // return modified { x, y, width, height }
  }
})
```

### 6. Rubberband Modifier

Create an elastic effect where dragging beyond boundaries is possible but with resistance.

```javascript
// This is a custom implementation example using the modify method
function rubberband(options = {}) {
  return {
    name: 'rubberband',
    options,
    methods: {
      set({ coords, interaction, state }) {
        const { target, element } = interaction;
        const { distanceThreshold = 50, elasticity = 0.5 } = options;
        
        if (!state.boundRect) {
          // Get the boundary rectangle on first run
          state.boundRect = options.boundRect || element.parentElement.getBoundingClientRect();
        }
        
        const bounds = state.boundRect;
        let { x, y } = coords;
        
        // Check if we're beyond boundaries
        if (x < bounds.left) {
          const distance = bounds.left - x;
          x = bounds.left - (distance * elasticity);
        } else if (x > bounds.right) {
          const distance = x - bounds.right;
          x = bounds.right + (distance * elasticity);
        }
        
        if (y < bounds.top) {
          const distance = bounds.top - y;
          y = bounds.top - (distance * elasticity);
        } else if (y > bounds.bottom) {
          const distance = y - bounds.bottom;
          y = bounds.bottom + (distance * elasticity);
        }
        
        coords.x = x;
        coords.y = y;
        
        return coords;
      }
    }
  };
}
```

## Combining Multiple Modifiers

Modifiers can be combined in various ways to create complex behaviors:

```javascript
interact('.element').draggable({
  modifiers: [
    // First restrict to parent
    interact.modifiers.restrict({
      restriction: 'parent',
      endOnly: false
    }),
    
    // Then snap to grid
    interact.modifiers.snap({
      targets: [interact.snappers.grid({ x: 20, y: 20 })],
      range: Infinity
    }),
    
    // Then apply minimum distance from center
    interact.modifiers.restrict({
      restriction: (x, y, element, interaction) => {
        // Create a "no-go" zone in center
        const parentRect = element.parentElement.getBoundingClientRect();
        const centerX = parentRect.left + parentRect.width/2;
        const centerY = parentRect.top + parentRect.height/2;
        
        // Calculate distance from center
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // If too close to center, adjust coordinates
        if (distance < 50) {
          const angle = Math.atan2(dy, dx);
          return {
            x: centerX + Math.cos(angle) * 50,
            y: centerY + Math.sin(angle) * 50
          };
        }
        
        return { x, y };
      }
    })
  ]
});
```

## Creating Custom Modifiers

You can create your own modifiers for specialized behavior:

```javascript
// Custom modifier that creates a magnetic effect toward certain points
function magneticPoints(options) {
  return {
    name: 'magnetic-points',
    options,
    methods: {
      set(arg) {
        const { interaction, coords, state } = arg;
        const { points = [], strength = 0.1, range = 100 } = options;
        
        // Initialize state if needed
        if (!state.active) {
          state.active = false;
          state.target = null;
        }
        
        // Find closest point
        let closestPoint = null;
        let minDistance = Infinity;
        
        for (const point of points) {
          const dx = point.x - coords.x;
          const dy = point.y - coords.y;
          const distance = Math.sqrt(dx*dx + dy*dy);
          
          if (distance < minDistance && distance < range) {
            closestPoint = point;
            minDistance = distance;
          }
        }
        
        // Apply magnetic pull
        if (closestPoint) {
          state.active = true;
          state.target = closestPoint;
          
          // Move toward point with strength factor
          coords.x += (closestPoint.x - coords.x) * strength;
          coords.y += (closestPoint.y - coords.y) * strength;
        } else {
          state.active = false;
        }
        
        return coords;
      }
    }
  };
}

// Usage
interact('.draggable').draggable({
  modifiers: [
    magneticPoints({
      points: [
        { x: 100, y: 100 },
        { x: 200, y: 300 },
        { x: 300, y: 150 }
      ],
      strength: 0.2,
      range: 80
    })
  ]
});
```

## Advanced Modifier Techniques

### Conditional Modifiers

You can create modifiers that only activate under certain conditions:

```javascript
function conditionalModifier(options) {
  const { condition, modifierToApply } = options;
  
  return {
    name: 'conditional-modifier',
    options,
    methods: {
      set(arg) {
        // Check if condition is met
        if (condition(arg.interaction)) {
          // Apply the wrapped modifier
          return modifierToApply.methods.set(arg);
        }
        // Otherwise, pass through coordinates unchanged
        return arg.coords;
      }
    }
  };
}

// Usage example - only snap when shift key is pressed
interact('.draggable').draggable({
  modifiers: [
    conditionalModifier({
      condition: (interaction) => interaction.event.shiftKey,
      modifierToApply: interact.modifiers.snap({
        targets: [interact.snappers.grid({ x: 20, y: 20 })],
        range: Infinity
      })
    })
  ]
});
```

### Stateful Modifiers

Modifiers can maintain state between calls to create complex behaviors:

```javascript
function velocityModifier(options) {
  return {
    name: 'velocity',
    options,
    methods: {
      start(arg) {
        const { state } = arg;
        state.velocityX = 0;
        state.velocityY = 0;
        state.lastX = arg.coords.x;
        state.lastY = arg.coords.y;
        state.lastTime = Date.now();
      },
      set(arg) {
        const { interaction, coords, state } = arg;
        const { friction = 0.9, additive = true } = options;
        
        // Calculate instantaneous velocity
        const now = Date.now();
        const dt = now - state.lastTime;
        if (dt > 0) {
          const dx = coords.x - state.lastX;
          const dy = coords.y - state.lastY;
          
          // Update velocity (with some smoothing)
          state.velocityX = 0.8 * (dx / dt) + 0.2 * state.velocityX;
          state.velocityY = 0.8 * (dy / dt) + 0.2 * state.velocityY;
          
          // Store values for next calculation
          state.lastX = coords.x;
          state.lastY = coords.y;
          state.lastTime = now;
        }
        
        // Apply velocity if this is an inertia phase
        if (interaction.interacting() && additive) {
          coords.x += state.velocityX * friction;
          coords.y += state.velocityY * friction;
        }
        
        return coords;
      }
    }
  };
}
```

### Responsive Modifiers

Create modifiers that adapt to screen size:

```javascript
function responsiveRestrict(options) {
  return {
    name: 'responsive-restrict',
    options,
    methods: {
      set(arg) {
        const { interaction, coords } = arg;
        const { element } = interaction;
        
        // Get current viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Different restrictions based on screen size
        let restriction;
        
        if (viewportWidth < 768) {
          // Mobile: Restrict to horizontal movement only
          restriction = {
            top: element.getBoundingClientRect().top,
            bottom: element.getBoundingClientRect().top,
            left: 0,
            right: viewportWidth
          };
        } else {
          // Desktop: Allow full movement within parent
          restriction = element.parentElement.getBoundingClientRect();
        }
        
        // Apply restriction
        if (coords.x < restriction.left) coords.x = restriction.left;
        if (coords.x > restriction.right) coords.x = restriction.right;
        if (coords.y < restriction.top) coords.y = restriction.top;
        if (coords.y > restriction.bottom) coords.y = restriction.bottom;
        
        return coords;
      }
    }
  };
}

// Usage
interact('.draggable').draggable({
  modifiers: [responsiveRestrict()]
});
```

### Type-Safe Modifiers with TypeScript

When using TypeScript, you can create type-safe custom modifiers:

```typescript
import { Modifier, ModifierArg } from '@interactjs/types';

interface MagneticPointOptions {
  points: Array<{ x: number, y: number }>;
  strength?: number;
  range?: number;
}

interface MagneticPointState {
  active: boolean;
  target: { x: number, y: number } | null;
}

function magneticPoints(options: MagneticPointOptions): Modifier {
  return {
    name: 'magnetic-points',
    options,
    methods: {
      set(arg: ModifierArg) {
        const { interaction, coords, state } = arg;
        const { points = [], strength = 0.1, range = 100 } = options;
        
        // Initialize state if needed
        if (!state.active) {
          state.active = false;
          state.target = null;
        }
        
        // Type casting the state to our interface
        const magneticState = state as unknown as MagneticPointState;
        
        // Find closest point
        let closestPoint = null;
        let minDistance = Infinity;
        
        for (const point of points) {
          const dx = point.x - coords.x;
          const dy = point.y - coords.y;
          const distance = Math.sqrt(dx*dx + dy*dy);
          
          if (distance < minDistance && distance < range) {
            closestPoint = point;
            minDistance = distance;
          }
        }
        
        // Apply magnetic pull
        if (closestPoint) {
          magneticState.active = true;
          magneticState.target = closestPoint;
          
          // Move toward point with strength factor
          coords.x += (closestPoint.x - coords.x) * strength;
          coords.y += (closestPoint.y - coords.y) * strength;
        } else {
          magneticState.active = false;
        }
        
        return coords;
      }
    }
  };
}
```

By understanding and leveraging the modifier system, you can create precisely customized interactions that go far beyond basic dragging and resizing. Modifiers empower you to build natural-feeling interfaces with complex constraints and behaviors.

---

[← Previous: Advanced Features](./09-advanced-features.md) | [Back to Index](./index.md) | [Next: Complete API Reference →](./11-complete-api-reference.md)