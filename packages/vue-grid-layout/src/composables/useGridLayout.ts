import { Ref, computed, ref } from 'vue';

import { BoardItem } from '../types';

export function useGridLayout(boardItems: Ref<BoardItem[]>) {
  const calculatedStyles = computed(() => {
    const occupiedCells: boolean[][] = Array(24)
      .fill(null)
      .map(() => Array(12).fill(false));

    return boardItems.value.map((item: BoardItem) => {
      let columnStart = item.columnOffset;
      let rowStart = item.rowOffset;
      const columnSpan = item.columnSpan;
      const rowSpan = item.rowSpan;

      // Collision avoidance logic
      while (true) {
        let hasCollision = false;
        for (let i = rowStart; i < rowStart + rowSpan; i++) {
          if (i >= 24) {
            hasCollision = true;
            break;
          }
          for (let j = columnStart; j < columnStart + columnSpan; j++) {
            if (j >= 12 || occupiedCells[i][j]) {
              hasCollision = true;
              break;
            }
          }
          if (hasCollision) break;
        }

        if (!hasCollision && rowStart + rowSpan <= 24 && columnStart + columnSpan <= 12) {
          // Mark cells as occupied
          for (let i = rowStart; i < rowStart + rowSpan; i++) {
            for (let j = columnStart; j < columnStart + columnSpan; j++) {
              occupiedCells[i][j] = true;
            }
          }
          break;
        } else {
          // Collision detected, try next position
          columnStart++;
          if (columnStart + columnSpan > 12) {
            columnStart = 0;
            rowStart++;
            if (rowStart + rowSpan > 24) {
              // Give up, item will overlap
              console.warn(`Could not find a free spot for item ${item.id}`);
              columnStart = item.columnOffset;
              rowStart = item.rowOffset;
              break;
            }
          }
        }
      }

      const gridArea = `${rowStart + 1} / ${columnStart + 1} / span ${rowSpan} / span ${columnSpan}`;

      return {
        id: item.id,
        gridArea,
      };
    });
  });

  return { calculatedStyles };
}
