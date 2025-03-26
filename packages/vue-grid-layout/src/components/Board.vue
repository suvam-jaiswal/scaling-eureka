<script setup lang="ts">
import { computed, ref } from 'vue';
import type {
  BoardI18nStrings,
  BoardItem as BoardItemType,
  DismissItemDetail,
  ItemsChangeDetail,
  TriggerResizeDetail,
} from '../types';
import BoardItem from './BoardItem.vue'; // Internal component
import { useGridLayout } from '../composables/useGridLayout';
import { useBoardInteractions } from '../composables/useBoardInteractions';
import { useBoardAccessibility } from '../composables/useBoardAccessibility';

// --- Props ---
interface Props {
  items: BoardItemType[];
  i18nStrings?: BoardI18nStrings;
  // Add rowHeight, gap props if they become configurable
}
const props = defineProps<Props>();

// --- Emits ---
const emit = defineEmits<{
  (e: 'items-change', detail: ItemsChangeDetail): void;
  (e: 'dismiss-item', detail: DismissItemDetail): void;
  (e: 'trigger-resize', detail: TriggerResizeDetail): void;
}>();

// --- Template Ref ---
const boardRef = ref<HTMLElement | null>(null);

// --- Composables ---
const { calculatedStyles } = useGridLayout(ref(props.items));
const {
  draggingItemId,
  handleDragStart,
} = useBoardInteractions(
  // Pass reactive items, resolveLayoutChanges, emit
);
const {
  boardId,
  descriptionIds,
  liveRegionMessage,
  getI18nString,
  getItemProps,
} = useBoardAccessibility(computed(() => props.i18nStrings));

// --- Event Handlers ---
function onDismissItem(itemId: string) {
  emit('dismiss-item', { itemId });
}

function onTriggerResize(itemId: string) {
  emit('trigger-resize', { itemId });
}

// --- Render Logic ---
const boardClasses = computed(() => ({
  'vue-board': true,
}));

const boardAriaProps = computed(() => ({
  id: boardId,
  role: 'application', // Or group
  'aria-label': getI18nString('boardLabel') || 'Dashboard board',
  'aria-roledescription': 'Board',
  // aria-describedby pointing to hidden instructions?
}));

</script>

<template>
  <div ref="boardRef" :class="boardClasses" v-bind="boardAriaProps">
    <!-- Visually Hidden Descriptions for ARIA -->
    <div :id="descriptionIds.drag" class="vue-board__visually-hidden">
      {{ getI18nString('dragHandleAriaDescription') || 'Press Space or Enter to start dragging, use arrow keys to move, Space or Enter to commit, Escape to cancel.' }}
    </div>
    <div :id="descriptionIds.resize" class="vue-board__visually-hidden">
      {{ getI18nString('resizeHandleAriaDescription') || 'Press Space or Enter to start resizing, use arrow keys to resize, Space or Enter to commit, Escape to cancel.' }}
    </div>

    <!-- Items -->
    <template v-if="items && items.length > 0">
      <BoardItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :style="{ gridArea: calculatedStyles.value[item.id]?.gridArea }"
        :is-dragging="draggingItemId === item.id"
        :is-resizing="false"
        :i18n-strings="i18nStrings"
        :a11y-props="getItemProps(item.id)"
        @pointerdown-drag="handleDragStart(item.id, $event)"
        @pointerdown-resize="() => { }"
        @dismiss="onDismissItem(item.id)"
        @trigger-resize="onTriggerResize(item.id)"
      >
        <!-- Scoped Slot for Content -->
        <slot
          name="item"
          :item="item"
          :utils="{ dismiss: () => onDismissItem(item.id), triggerResize: () => onTriggerResize(item.id) }"
        ></slot>
      </BoardItem>
    </template>

    <!-- Empty State -->
    <template v-else>
      <slot name="empty">
        <!-- Default empty state content if needed -->
      </slot>
    </template>

    <!-- Optional: Background Grid Layer for Highlighting -->
    <!-- <div class="vue-board__grid-background"> ... </div> -->

    <!-- ARIA Live Region -->
    <div class="vue-board__visually-hidden" aria-live="assertive" aria-atomic="true">
      {{ liveRegionMessage }}
    </div>

    <!-- Global listeners for drag/resize move/end if needed -->
    <!-- These might be better handled within useBoardInteractions -->

  </div>
</template>

<style scoped>
/* Import base styles - adjust path as needed */
@import '../styles/variables.css';
@import '../styles/board.css';

/* Add any Board.vue specific scoped styles here */
.vue-board {
  /* Example: Ensure it stretches if needed */
  min-height: 100px;
}
</style>
