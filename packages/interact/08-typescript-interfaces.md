# TypeScript Interfaces for Interact.js

This document provides a comprehensive reference for the TypeScript interfaces used in Interact.js. Understanding these interfaces is essential for properly typing your interactions when using TypeScript.

## Core Interfaces

### Interactable

The `Interactable` interface represents an element (or set of elements) that has been made interactive.

```typescript
interface Interactable {
  // Action methods
  draggable(options?: boolean | DraggableOptions): this;
  resizable(options?: boolean | ResizableOptions): this;
  gesturable(options?: boolean | GesturableOptions): this;
  dropzone(options?: boolean | DropzoneOptions): this;
  
  // Event handling
  on(eventType: string | string[], listener: ListenerFn): this;
  off(eventType: string | string[], listener?: ListenerFn): this;
  
  // Configuration methods
  styleCursor(value: boolean): this;
  origin(newValue?: Element | string | object): Element | string | object;
  deltaSource(newValue?: 'page' | 'client'): string;
  allowFrom(newValue?: string | Element): string | Element | null;
  ignoreFrom(newValue?: string | Element): string | Element | null;
  
  // State management
  set(options: {[key: string]: any}): this;
  unset(): this;
  
  // Other properties
  options: {
    drag?: DraggableOptions;
    resize?: ResizableOptions;
    gesture?: GesturableOptions;
    drop?: DropzoneOptions;
    [key: string]: any;
  };
  target: Element | string;
  events: InteractEvents;
  _context: Element;
}
```

### InteractEvent

The base event type for all interaction events.

```typescript
interface InteractEvent {
  target: HTMLElement;
  currentTarget: HTMLElement;
  relatedTarget: HTMLElement | null;
  interactable: Interactable;
  interaction: Interaction;
  type: string;
  timeStamp: number;
  
  // Coordinates
  pageX: number;
  pageY: number;
  clientX: number;
  clientY: number;
  
  // Movement
  dx: number;
  dy: number;
  
  // Velocity
  velocityX: number;
  velocityY: number;
  speed: number;
  
  // Utilities
  preventDefault(): void;
  stopPropagation(): void;
  stopImmediatePropagation(): void;
}
```

### ActionOptions

Base interface for all action option types.

```typescript
interface ActionOptions {
  enabled?: boolean;
  origin?: Element | string | object;
  allowFrom?: string | Element;
  ignoreFrom?: string | Element;
  
  listeners?: {
    start?: ListenerFn;
    move?: ListenerFn;
    end?: ListenerFn;
    [key: string]: ListenerFn | undefined;
  } | ListenerFn;
  
  modifiers?: Array<Modifier>;
  inertia?: boolean | InertiaOptions;
  
  max?: number;
  maxPerElement?: number;
  manualStart?: boolean;
  hold?: number;
  cursorChecker?: CursorCheckerFn;
}
```

## Action-Specific Interfaces

### DraggableOptions

Options for draggable interactables.

```typescript
interface DraggableOptions extends ActionOptions {
  startAxis?: 'x' | 'y' | 'xy';
  lockAxis?: 'x' | 'y' | 'start' | 'xy';
  oninertiastart?: ListenerFn;
  onstart?: ListenerFn;
  onmove?: ListenerFn;
  onend?: ListenerFn;
  
  // For auto-scroll
  autoScroll?: boolean | AutoScrollOptions;
}
```

### ResizableOptions

Options for resizable interactables.

```typescript
interface ResizableOptions extends ActionOptions {
  edges?: {
    top?: boolean | string | Element;
    left?: boolean | string | Element;
    bottom?: boolean | string | Element;
    right?: boolean | string | Element;
  };
  
  // Deprecated in favor of aspectRatio modifier
  square?: boolean;
  squareResize?: boolean;
  
  invert?: 'none' | 'negate' | 'reposition';
  
  oninertiastart?: ListenerFn;
  onstart?: ListenerFn;
  onmove?: ListenerFn;
  onend?: ListenerFn;
}
```

### GesturableOptions

Options for gesturable interactables.

```typescript
interface GesturableOptions extends ActionOptions {
  oninertiastart?: ListenerFn;
  onstart?: ListenerFn;
  onmove?: ListenerFn;
  onend?: ListenerFn;
}
```

### DropzoneOptions

Options for dropzone interactables.

```typescript
interface DropzoneOptions {
  accept?: string | Element | ((_: Element, _2: Element, _3: Element) => boolean);
  overlap?: 'pointer' | 'center' | number;
  checker?: DropChecker;
  
  ondropactivate?: ListenerFn;
  ondropdeactivate?: ListenerFn;
  ondragenter?: ListenerFn;
  ondragleave?: ListenerFn;
  ondropmove?: ListenerFn;
  ondrop?: ListenerFn;
}
```

## Event Interfaces

### DragEvent

Event object for drag interactions.

```typescript
interface DragEvent extends InteractEvent {
  dragEnter?: Element;
  dragLeave?: Element;
}
```

### ResizeEvent

Event object for resize interactions.

```typescript
interface ResizeEvent extends InteractEvent {
  rect: {
    top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
    height: number;
  };
  deltaRect: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
  edges: {
    top?: boolean;
    left?: boolean;
    bottom?: boolean;
    right?: boolean;
  };
}
```

### GestureEvent

Event object for gesture interactions.

```typescript
interface GestureEvent extends InteractEvent {
  distance: number;
  angle: number;
  da: number; // delta angle
  scale: number;
  ds: number; // delta scale
}
```

## Modifier Interfaces

```typescript
interface Modifier {
  options?: any;
  methods: {
    start?: (arg: ModifierArg) => void;
    set?: (arg: ModifierArg) => ModifierArg;
    beforeEnd?: (arg: ModifierArg) => void;
    stop?: (arg: ModifierArg) => void;
  };
  name: string;
  enable: boolean;
}

interface ModifierArg {
  interaction: Interaction;
  interactable: Interactable;
  element: Element;
  rect: Rect;
  edges: Edges;
  pageCoords: Point;
  prevCoords: Point;
  prevRect: Rect;
  useStatusRect: boolean;
  status: {
    phase: 'start' | 'resume' | 'move' | 'inertia' | 'end';
  };
}
```

## Helper Types

```typescript
// A listener function for any interaction event
type ListenerFn = (event: InteractEvent) => void;

// For drop checker function
type DropChecker = (dragEvent: any, event: any, dropped: boolean) => boolean;

// For cursor checker function
type CursorCheckerFn = (action: string, interactable: Interactable, element: Element, interacting: boolean) => string | null;

// Rectangle for geometry
interface Rect {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

// Point for coordinates
interface Point {
  x: number;
  y: number;
}

// Edges for resize
interface Edges {
  top?: boolean;
  left?: boolean;
  bottom?: boolean;
  right?: boolean;
}
```

## Usage Examples with TypeScript

### Type-safe Draggable

```typescript
import interact from 'interactjs';
import { Interactable, DraggableOptions, DragEvent } from '@interactjs/types';

// Define the options with proper types
const options: DraggableOptions = {
  modifiers: [
    interact.modifiers.restrict({
      restriction: 'parent',
      endOnly: true
    })
  ],
  listeners: {
    start: (event: DragEvent) => {
      console.log('Drag started');
    },
    move: (event: DragEvent) => {
      // Properly typed event handling
      const target = event.target as HTMLElement;
      const x = (parseFloat(target.getAttribute('data-x') || '0')) + event.dx;
      const y = (parseFloat(target.getAttribute('data-y') || '0')) + event.dy;
      
      target.style.transform = `translate(${x}px, ${y}px)`;
      
      target.setAttribute('data-x', x.toString());
      target.setAttribute('data-y', y.toString());
    }
  }
};

// Get a type-safe interactable
const interactable: Interactable = interact('.draggable').draggable(options);
```

### Using Type Guards

```typescript
import { InteractEvent, DragEvent, ResizeEvent, GestureEvent } from '@interactjs/types';

function handleInteractEvent(event: InteractEvent) {
  // Type guard to check specific event types
  if (event.type.startsWith('drag')) {
    const dragEvent = event as DragEvent;
    // Now we can safely use dragEvent specific properties
    console.log(`Dragging with velocity: ${dragEvent.velocityX}, ${dragEvent.velocityY}`);
  } 
  else if (event.type.startsWith('resize')) {
    const resizeEvent = event as ResizeEvent;
    // Use resize-specific properties
    console.log(`New size: ${resizeEvent.rect.width} x ${resizeEvent.rect.height}`);
  }
  else if (event.type.startsWith('gesture')) {
    const gestureEvent = event as GestureEvent;
    // Use gesture-specific properties
    console.log(`Scale: ${gestureEvent.scale}, Rotation: ${gestureEvent.angle}°`);
  }
}
```

These interfaces provide a foundation for type-safe usage of Interact.js in TypeScript projects. They ensure that you receive proper autocomplete suggestions, type checking, and documentation in your IDE when working with Interact.js.

## Integration with Vue 3 and TypeScript

When using Interact.js with Vue 3 and TypeScript, you'll want to ensure proper typing for both the interactable and your Vue components:

```typescript
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import interact from 'interactjs';
import { Interactable, DragEvent } from '@interactjs/types';

// Define properly typed refs
const elementRef = ref<HTMLElement | null>(null);
let interactable: Interactable | null = null;

onMounted(() => {
  if (elementRef.value) {
    interactable = interact(elementRef.value)
      .draggable({
        inertia: true,
        modifiers: [
          interact.modifiers.restrict({
            restriction: 'parent',
            endOnly: true
          })
        ],
        listeners: {
          move: (event: DragEvent) => {
            const target = event.target as HTMLElement;
            const x = (parseFloat(target.getAttribute('data-x') || '0')) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y') || '0')) + event.dy;
            
            target.style.transform = `translate(${x}px, ${y}px)`;
            
            target.setAttribute('data-x', x.toString());
            target.setAttribute('data-y', y.toString());
          }
        }
      });
  }
});

// Clean up properly
onUnmounted(() => {
  if (interactable) {
    interactable.unset();
    interactable = null;
  }
});
</script>

<template>
  <div ref="elementRef" class="draggable">Drag me</div>
</template>
```

## Type-Safe Modifiers

When working with modifiers, you can benefit from TypeScript's type checking:

```typescript
import interact from 'interactjs';
import { Modifier, SnapOptions, RestrictOptions } from '@interactjs/types';

// Type-safe snap modifier
const snapOptions: SnapOptions = {
  targets: [
    { x: 100, y: 100, range: 25 }
  ],
  range: 20,
  relativePoints: [{ x: 0, y: 0 }]
};

const snapModifier: Modifier = interact.modifiers.snap(snapOptions);

// Type-safe restrict modifier
const restrictOptions: RestrictOptions = {
  restriction: 'parent',
  elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
  endOnly: true
};

const restrictModifier: Modifier = interact.modifiers.restrict(restrictOptions);

// Use the modifiers
interact('.draggable').draggable({
  modifiers: [snapModifier, restrictModifier]
});
```

## Declaring Module for Augmentation

If you need to add or augment the types, you can declare the module:

```typescript
// augment-interact.d.ts
import 'interactjs';

declare module 'interactjs' {
  // Add or extend interfaces
  export interface CustomDragEvent extends DragEvent {
    customProperty: string;
  }
  
  // Add methods to the global interact object
  export interface InteractStatic {
    myCustomMethod(arg: string): void;
  }
}
```

---

[← Back to Index](./index.md) | [Next: Advanced Features →](./09-advanced-features.md)