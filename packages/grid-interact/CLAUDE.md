# Common Commands for interact-grid

## Development

Start the development server:

```bash
npm run dev
```

## Testing & Linting

Run the linter:

```bash
npm run lint
```

Run type checking:

```bash
npm run typecheck
```

## Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Project Structure

- `src/components/`: Contains reusable Vue components
- `src/views/`: Contains page components
- `src/stores/`: Contains Pinia stores
- `src/router/`: Contains Vue Router configuration
- `src/assets/`: Contains static assets like CSS and images

## Style Guide

- Use 2 spaces for indentation
- Use TypeScript interfaces for data models
- Use composition API with `<script setup>` syntax
- Emit events for parent components to handle state changes
- Use Pinia for global state management

## purpose and functionality to keep in mind, the goal is to mimic what Cloudscape Design System does with their configurable dashboard grid. The following are the key features and behaviors to implement

Drag & Drop Interactions
 • Draggable Widgets: Dashboard items (widgets) can be picked up and moved around within the grid. Users grab a widget (usually via a drag handle in its header) and drag it to a new location on the board ￼. This lets users rearrange the dashboard to prioritize content.
 • Adding via Drag: New widgets can be added by dragging from an item palette into the board ￼ ￼. The palette item (a mini representation of a widget) is dragged onto the dashboard and dropped to instantiate that widget at the drop location.
 • Visual Drop Indicators: As a widget is dragged, the dashboard provides a visual affordance to show where it can be dropped ￼. For example, an outline or placeholder might appear in the grid, indicating the available space. The dragged item itself is often shown with an elevated shadow to indicate it’s “picked up” ￼.
 • Swap & Push Behavior: The grid prevents overlaps by dynamically rearranging items during drag. If you drag a widget into a space occupied by another, Cloudscape’s design will swap their positions or push the other item out of the way to make room ￼ ￼. In practice, as you drag one card near another, the other card slides aside smoothly to open a slot. This ensures no two widgets ever overlap in the final layout.
 • Dropping Items: When the user releases the drag, the widget “drops” into the nearest valid grid slot. It snaps into place, and any affected widgets settle into their new positions. Cloudscape uses a brief animation for this transition – the moved item and any displaced items slide into their new locations (about 115ms ease-in) so the change is visually clear ￼ ￼.

Resizing Widgets
 • User Resizable: Users can change a widget’s size by dragging its resize handle (for example, a gripper on the corner or edge of the widget) ￼. This allows expanding a widget to show more data or shrinking it to save space.
 • Grid-Based Sizing: Resizing snaps to the dashboard’s grid. The Cloudscape dashboard is built on a fixed column grid (commonly 4 columns wide in a standard view) ￼ ￼. As a result, widget widths change in increments of one column. (E.g. a widget can be 1, 2, 3, or 4 columns wide – corresponding to small, medium, large, or extra large sizes ￼ ￼.) The height similarly adjusts in predefined row increments ￼ rather than freeform pixels, keeping everything aligned.
 • Min/Max Constraints: There are defined minimum and maximum sizes for widgets. A widget can’t be shrunk so much that content is unusable, nor expanded beyond the grid’s width. In Cloudscape’s case, the smallest size is one column (quarter of the full width) and the largest spans all columns ￼ ￼. These discrete sizes correspond to design breakpoints (small, medium, large, extra-large widget variants).
 • Responsive Resizing: The system might enforce that certain widgets maintain aspect ratios or minimum heights so content isn’t clipped. When a widget is resized, others may shift: if you make a widget taller, the items below it on the board push further down. The resizing interaction, just like dragging, should provide feedback (e.g. a semi-transparent outline showing the widget’s new footprint as you drag the handle). When finished, the layout reflows to accommodate the new size.

Responsive Layout for Different Screens
 • Adaptive Column Count: The dashboard’s grid adjusts to the screen size. On desktop, the Cloudscape configurable dashboard uses a multi-column layout (4 columns by default for typical widths) ￼. On very large screens it can even increase to a 6-column grid to utilize the space ￼. Conversely, on small screens (like phones), the layout collapses to a single-column stack for readability ￼. (The number of columns is fixed by the design – developers using Cloudscape cannot arbitrary change it ￼.)
 • Reflow on Resize: As the viewport width changes, widgets automatically reposition. For example, a layout that is 4 columns wide on desktop will break down to 1 column on a narrow mobile device – essentially all widgets will stack vertically in one column, each taking 100% width ￼. The order of widgets in the DOM typically dictates their order in the single column view (usually same order as the multi-column layout, just wrapped to new lines).
 • Media Queries or JS Handling: To replicate this, use CSS media queries or responsive layout techniques. The grid container can switch its template from 4-column to 1-column at a certain breakpoint. Ensure Interact.js is aware of the current grid sizing – e.g. update the draggable snap grid settings when the column count changes. This way, if a user drags or resizes on a smaller screen, it snaps to the one-column grid instead of a four-column grid.
 • Fluid Width Widgets: On a small screen (1-column layout), even a widget that was “small” (1 column) on desktop will now naturally expand to full width of the single column. The design expects widgets to be full-width in one-column mode so that content isn’t cramped. Thus, your code should either automatically scale widget width to 100% at the smallest breakpoint or treat any width >1 as just 100% in mobile layout.
 • Consistent Behavior: All interactive behaviors (drag, drop, resize) should remain available on all screen sizes (including touch devices). Interact.js supports touch events with the same API as mouse ￼, so users on tablets can drag and rearrange widgets with touch input. Additionally, consider enabling an auto-scroll feature during drag if the dashboard can scroll: e.g. if a user drags a widget toward the bottom edge on a long page, the container should scroll down automatically ￼. This ensures users can drag items from top to bottom of a long dashboard on small screens.

Persistence of Layout State
 • Saving User Configuration: A key aspect of a configurable dashboard is that user customizations persist. When a user rearranges or resizes widgets, those changes should be stored so that the next time they open the dashboard, it looks the same. Cloudscape’s design allows users to “show/hide, delete, move, change size, and add items” ￼ – these choices form a user-specific dashboard state.
 • Data to Store: The layout state can be represented as a data structure (for example, an array of widget configurations). Each widget’s config might include an ID, its size (e.g. width in grid units and height in row units), and its position (e.g. which column and row it starts at in the grid). If using a 4-column grid, position could be stored as something like {x: 0, y: 2, w: 2, h: 1} meaning “starts at column 0, row 2, spans 2 columns wide and 1 row high,” for instance.
 • Storage Mechanism: This configuration should be saved to persistent storage. A common approach is using browser Local Storage or IndexedDB for a client-only app, or saving to a backend (database) if the dashboard is tied to a user account. For example, Cloudscape’s own demo patterns use local storage for remembering user settings like table density preferences ￼ – similarly, a dashboard could store layout JSON in local storage so that it’s retained between sessions.
 • Applying Stored Layout: On page load, retrieve the saved layout data and apply it. This means generating the dashboard with widgets in the recorded positions and sizes. If a widget is missing (say the data refers to a widget the user removed), skip it. If new widgets are added (via an “Add widget” action), you’d append them and update the state.
 • Updating State on Interactions: Whenever the user drags, resizes, adds, or removes a widget, update the in-memory layout data. For instance, on drag end, capture the widget’s new coordinates; on resize end, capture its new dimensions. Then save the updated layout to storage. Keeping the state in sync in real-time means the UI and the saved data always match. It’s also wise to provide a “Reset to default layout” option (as seen in the UI screenshot above) in case a user wants to revert to the original layout.

Performance Considerations
 • Use CSS Transforms: To ensure smooth dragging, move elements with CSS transforms (translate) instead of altering top/left positions. Changing transform: translate(x,y) uses GPU acceleration and avoids forcing browser re-layout of the entire page. Interact.js’s recommended pattern is to update an element’s transform on each drag move event ￼. For example, in the drag move listener you compute the new coordinates and do element.style.transform = "translate(Xpx, Ypx)". This results in fluid, 60fps drag motion even for larger elements.
 • Avoid Layout Thrash: Because widgets are likely absolutely positioned within the board (to enable free movement), moving one widget with transforms won’t impact others’ layout until you “drop” and finalize positions. This is good for performance – it isolates changes. When you do need to reposition other widgets (on drop or during a swap), consider applying transforms/transition animations to those as well, rather than rebuilding the entire grid layout from scratch. Minimizing DOM modifications to just the elements that changed will keep interactions snappy.
 • Throttling and Frames: Interact.js fires continuous events as you drag or resize. Make sure the work done on these events is efficient. Heavy computations should be throttled or moved out of the hot path. If needed, use requestAnimationFrame to schedule position updates, but often simply applying a transform as above is fast enough. The library’s pointer events are fine-grained; you typically don’t need to manually throttle them if you keep the handler lightweight.
 • Snap Calculation Efficiency: Snapping to a grid (discussed below) is handled by Interact’s modifiers which are optimized in C++ or at a low level. Utilizing those (rather than writing custom JS to constantly check and adjust coordinates) can improve performance ￼. Likewise, boundary restrictions (not letting a widget go outside the container) can be done via built-in modifiers ￼, which is often more efficient than manual checks every pixel of movement.
 • CSS Transitions for Animations: Leverage CSS transitions for the nice sliding animations when widgets rearrange. Cloudscape uses a ~115ms ease animation for swaps and drops ￼ ￼. You can achieve this by adding a CSS transition on the transform property of widgets. Then, when you programmatically change a widget’s transform (say, moving a widget to a new spot on drop), the browser will animate the movement. This offloads the animation work to the browser’s optimized compositing engine. Ensure to toggle transitions off during the actual drag (to avoid lag), and only enable them for the settling animation.

Additional Features and UX Enhancements
 • Snap-to-Grid: The grid system uses snapping so that widgets align perfectly. Interact.js supports a grid snap modifier, which you can configure with the grid cell size ￼. For example, if each column is 25% width and each row step is 100px tall, you set the snap grid to those intervals. As the user drags a widget, it will “jump” in increments of one cell, making placement feel magnetic to the grid. Snapping also applies when resizing, so the widget’s edges snap to the grid lines ￼ ￼. This ensures that after any interaction, every widget’s position and size align to the invisible grid underpinning the layout.
 • Collision Detection & Reflow: Beyond just snapping, a good dashboard grid manages collisions between widgets. Cloudscape’s approach is to dynamically reflow items to avoid overlap (swap/push) ￼ ￼. To replicate this, you would detect when the dragged widget’s projected position collides with another widget’s cell. One strategy is to track a matrix of occupied grid cells. When a drag enters cells occupied by another widget, you could automatically shift that other widget to the next free space (e.g., move it downwards or to some other open spot) in real-time. This gives the effect of items shuffling around to accommodate the drag. It’s a complex logic problem (often solved by libraries like GridStack or React-Grid-Layout), but with Interact.js you’d implement it in the drag move listener: check overlaps and adjust positions accordingly.
 • Boundary Constraints: Users should not be able to drag a widget outside the board’s bounds. Interact.js provides a restrict modifier to keep drags within a parent element ￼. Apply this so even if a user tries to drag fast, the widget stops at the container edges. Similarly, when resizing, enforce that a widget cannot be stretched beyond the board’s width or above/below its extents. This might involve limiting the drag handle’s range (for instance, if a widget is at the far right column, disallow resizing further right). By constraining movements, you maintain a valid layout at all times.
 • Layout Constraints: Define rules for widget arrangement. For example, maybe certain widgets are “full width only” or cannot be smaller than a given size due to their content. Cloudscape’s guidelines suggest designing each widget for all sizes and letting the user decide ￼ ￼, but you might still impose some logical limits (like a chart widget must be at least medium size to be useful). Also, consider a grid gap – space between widgets. Cloudscape likely has consistent gutters between cards. Your grid snapping can incorporate a gap so that widgets don’t butt directly against each other.
 • Visual Cues & Snapping Feedback: Enhance the dragging experience with visuals. For example, highlight the grid cells under the dragged widget or show a ghost outline of the widget’s new size/position as it’s being dragged or resized. Cloudscape mentions a “visual affordance” on the layout for placement ￼. This could be implemented by drawing a temporary guide (e.g., a semi-transparent rectangle) where a widget would drop if released. Snapping to a cell might be accompanied by a slight “snap” animation or sound to confirm the lock (optional, but improves tactile feel).
 • Accessibility: A configurable dashboard should remain accessible to all users ￼. This means providing keyboard interactions for drag-and-drop. For instance, Cloudscape’s demo indicates instructions: “Use Space or Enter to activate drag, arrow keys to move, Space or Enter to drop, Escape to cancel” (this text was hinted in search results). You can implement this by making each widget focusable and giving it keyboard handlers: upon a certain key, switch into “move mode” where arrow keys adjust the widget’s position in the grid by one step. Similarly, provide a way to resize via keyboard (perhaps when focused, use a key combination to grow or shrink the widget). All drag handles and resize handles should have appropriate aria-label (e.g., “Drag handle for widget X. Press Enter to reorder”). During the interaction, use ARIA live regions to announce changes (e.g., “Moved Service health widget to row 2, column 1”). And of course, ensure the palette for adding widgets is keyboard navigable and that dropping a new widget via keyboard is possible (perhaps by focusing a palette item and pressing Enter to add it to a highlighted drop zone).
 • Other Input Methods: Also consider touch and assistive tech. On touch devices, the drag handle should be large enough to touch, and maybe provide a slight haptic feedback or vibration on long press (if using native mobile capabilities) to indicate the item is picked up. For screen readers, if drag-and-drop is too complex, consider offering an alternate interface to customize the dashboard (such as a list of widgets with up/down arrows to reorder them, or a settings dialog). This aligns with providing alternative ways to accomplish drag-drop interactions without actually dragging ￼.
 • Polish and User Experience: Lastly, small details can elevate the experience. Inertial scrolling (throwing) is generally turned off in a grid dashboard because precision is more important than momentum – you don’t want a widget flying away when released. Snapping essentially cancels out inertia by locking to positions. However, Interact.js does offer inertia and multi-touch, which are more relevant if you had something like a free-form canvas. In a structured grid, it’s best to keep movements deliberate. Also, ensure that during a drag or resize, the widget’s content might need to temporarily simplify (for example, a complex chart might show just a placeholder) to keep the interaction smooth. After drop, you can re-render any heavy content. Keep an eye on performance if your widgets themselves are heavy (you might pause updating a live chart while the user is dragging it, then refresh data once it’s dropped).

By accounting for all these interactions and behaviors, you can use Interact.js to replicate Cloudscape’s robust dashboard grid system. In summary, you’ll implement draggable, resizable panels that snap to a responsive grid, provide smooth animations and feedback, preserve the user’s custom layout, and remain fast and accessible for everyone using the dashboard ￼ ￼. This combination of features delivers a user experience on par with the Cloudscape Design configurable dashboard.

Sources: Cloudscape Design System guidelines and examples ￼ ￼, Interact.js documentation for draggable/resizable behaviors ￼ ￼, and related Cloudscape discussions.
