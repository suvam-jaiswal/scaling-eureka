# Installation and Setup in a Vue 3 TypeScript Project

Setting up Interact.js in a Vue 3 project is straightforward. The library is distributed via npm and includes TypeScript type definitions, making it easy to use in a TypeScript-enabled project.

## 1. Install the Interact.js Package

Use npm (or Yarn/Pnpm) to add Interact.js to your project:

```bash
npm install interactjs
```

This will install the pre-bundled package with all features included. Since the library is written in TypeScript, the npm package already includes the necessary type definitions for use in your TypeScript project. You do not need to install @types/interactjs; the types are built-in. (If you were using Interact.js via a CDN in a non-bundled environment, you could install @interactjs/types for editor support, but for Vue projects using a module bundler this isn't necessary.)

## 2. Import and Integrate Interact.js in Vue

Once installed, you can import Interact.js into your Vue components or setup code. Typically, you'll use it in a specific component where you have an element that needs to be draggable/resizable. For example, in a Vue 3 Single File Component:

```vue
<template>
  <div ref="dragBox" class="draggable-box">
    Drag or Resize Me
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import interact from 'interactjs';

const dragBox = ref<HTMLElement | null>(null);

onMounted(() => {
  if (dragBox.value) {
    // Create an interactable for the element
    interact(dragBox.value)
      .draggable({
        listeners: {
          move(event) {
            // update position during drag (example)
            event.target.style.transform =
              `translate(${event.dx}px, ${event.dy}px)`;
          }
        }
      })
      .resizable({
        edges: { top: true, left: true, bottom: true, right: true },
        listeners: {
          move(event) {
            // update size during resize (example)
            event.target.style.width  = `${event.rect.width}px`;
            event.target.style.height = `${event.rect.height}px`;
          }
        }
      });
  }
});
</script>

<style>
.draggable-box {
  /* Recommended CSS for interactable elements */
  touch-action: none;    /* prevent default touch gestures (like scrolling) during interactions */
  user-select: none;     /* prevent text selection during drag */
  /* optional styling */
  width: 150px;
  height: 150px;
  background: #4e9aff;
}
</style>
```

In this example, we import interact and use it inside onMounted (so the DOM element is available) to make our div draggable and resizable. We attached minimal listeners to update the element's style directly for demonstration. In a real project, you might update component state instead of directly mutating the DOM, but this shows the basic idea.

**Using Refs**: We use a Vue ref (dragBox) to get a reference to the DOM element. Interact.js can accept a DOM element, CSS selector, or even an array of elements as a target. Using a $refs or the Composition API ref is ideal in Vue to ensure you target the correct element.

**Composition API Consideration**: We call interact(dragBox.value) in onMounted so that it only runs on the client (browser). If you attempt to run it during SSR or before the component is mounted, the element won't exist. Always initialize Interact.js in a lifecycle hook that runs after the component is rendered (e.g., onMounted in Composition API, or the mounted() hook in Options API).

## 3. Alternate Installation: Using Scoped Packages (Tree Shaking)

The default interactjs package includes all features (drag, resize, gestures, modifiers, etc.). If you're concerned about bundle size and only need some features, Interact.js offers a modular approach with scoped packages. For example, you can install @interactjs/interact (core), @interactjs/actions (draggable/resizable/gestures), @interactjs/auto-start, @interactjs/modifiers, etc., individually. This allows you to import only what you use.

For instance:

```bash
npm install @interactjs/interact @interactjs/actions @interactjs/auto-start @interactjs/modifiers
```

And in your code:

```javascript
import '@interactjs/auto-start';     // enable auto-start of interactions
import '@interactjs/actions/drag';   // import draggable action
import '@interactjs/actions/resize'; // import resizable action
import '@interactjs/modifiers';      // import modifiers (snap, restrict)
import interact from '@interactjs/interact';
```

This approach requires a bit more setup but can reduce bundle size by excluding unused features. For many applications, using the standard interactjs package is perfectly fine to start with, and you can refactor to the modular imports later if needed.

## 4. Global Integration (Optional)

If you plan to use Interact.js in many components, you could create a Vue plugin or directive for it. For example, a custom v-interact directive could automatically apply draggable/resizable to elements. This can promote reuse and clean up component code. However, implementing such an abstraction is advanced and beyond the scope of this guide. Initially, it's recommended to integrate Interact.js on a per-component basis where needed. This makes it easier to manage in a TypeScript context (keeping the logic local and strongly typed within the component).

Now that Interact.js is installed and set up, we can move on to using it for common interaction tasks in Vue. In the next section, we'll cover how to enable dragging, resizing, gestures, and other features, and how to handle the events generated by Interact.js.

---

[← Previous: Overview](./01-overview.md) | [Back to Index](./index.md) | [Next: Basic Usage →](./03-usage.md)