/**
 * Defines the position and size of a board item within the grid.
 */
export interface BoardItemDefinition {
  columnOffset: number; // 0-based column index
  rowOffset: number; // 0-based row index
  columnSpan: number; // Number of columns the item occupies
  rowSpan: number; // Number of rows the item occupies
}

/**
 * Represents a single item on the board, including its layout and associated data.
 */
export interface BoardItem {
  id: string; // Unique identifier for the item
  definition: BoardItemDefinition; // Layout definition
  data?: any; // Optional arbitrary data for rendering content
}

/**
 * Utility functions provided to the #item slot scope.
 */
export interface BoardItemUtils {
  dismiss: () => void; // Function to signal item removal request
  triggerResize: () => void; // Function to signal potential content resize
}

/**
 * Structure for internationalization strings used for ARIA labels and controls.
 */
export interface BoardI18nStrings {
  // For Board component
  boardLabel?: string; // ARIA label for the board container
  liveAnnouncementDndStarted?: (operationType: 'resize' | 'drag') => string;
  liveAnnouncementDndItemReordered?: (position: {
    x: number; // 1-based column index
    y: number; // 1-based row index
  }) => string;
  liveAnnouncementDndItemResized?: (size: {
    width: number; // columnSpan
    height: number; // rowSpan
  }) => string;
  liveAnnouncementDndCommit?: (operationType: 'resize' | 'drag') => string;
  liveAnnouncementDndDiscarded?: (operationType: 'resize' | 'drag') => string;
  liveAnnouncementItemRemoved?: (itemHeader: string | undefined) => string; // Attempt to get header text

  // For BoardItem component
  itemAriaRoleDescription?: string; // e.g., "Board item"
  dragHandleAriaLabel?: string;
  dragHandleAriaDescription?: string;
  resizeHandleAriaLabel?: (
    direction: 'N' | 'S' | 'E' | 'W' | 'NW' | 'NE' | 'SW' | 'SE'
  ) => string;
  resizeHandleAriaDescription?: string;
}

// Event Payloads
export interface ItemsChangeDetail {
  items: BoardItem[];
}

export interface DismissItemDetail {
  itemId: string;
}

export interface TriggerResizeDetail {
  itemId: string;
}
