import { ref, computed, onMounted, onBeforeUnmount, type Ref } from 'vue';

const SINGLE_COLUMN_BREAKPOINT = 768; // Example breakpoint in px

export function useBoardResponsiveness(boardRef: Ref<HTMLElement | null>) {
  // --- State ---
  const containerWidth = ref(0);
  let resizeObserver: ResizeObserver | null = null;

  // --- Computeds ---
  const isSingleColumn = computed(
    () => containerWidth.value < SINGLE_COLUMN_BREAKPOINT
  );

  // --- Lifecycle Hooks ---
  onMounted(() => {
    if (boardRef.value) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // Use contentBoxSize for more accurate width if available
          const width = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
          containerWidth.value = width;
        }
      });
      resizeObserver.observe(boardRef.value);
      // Initial width measurement
      containerWidth.value = boardRef.value.offsetWidth;
    }
  });

  onBeforeUnmount(() => {
    if (resizeObserver && boardRef.value) {
      resizeObserver.unobserve(boardRef.value);
    }
    resizeObserver = null;
  });

  // --- Return ---
  return {
    containerWidth,
    isSingleColumn,
  };
}
