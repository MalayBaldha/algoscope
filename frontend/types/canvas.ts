import type { Frame, FrameHighlight, HighlightColor } from "./dsa";

/**
 * Calculated bounding box dimensions and layout position for a sliding window.
 */
export interface BoundingBoxLayout {
  leftOffset: number;
  width: number;
  visible: boolean;
  span: number;
}

/**
 * Array node rendering properties.
 */
export interface ArrayBarNodeProps {
  index: number;
  value: number | string;
  highlightColor?: HighlightColor | null;
  highlightLabel?: string | null;
  isWindowMax?: boolean;
  isWindowMember?: boolean;
  className?: string;
  onClick?: (index: number) => void;
}

/**
 * Pointer cursor badge properties.
 */
export interface PointerBadgeProps {
  label: string;
  name?: string;
  index: number | null;
  color?: HighlightColor | "default";
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "default";
  className?: string;
}

/**
 * Sliding window bounding box properties.
 */
export interface SlidingWindowBoxProps {
  leftIndex: number | null | undefined;
  rightIndex: number | null | undefined;
  itemWidth?: number;
  gap?: number;
  label?: string;
  className?: string;
}

/**
 * Sliding Window State snapshot from backend or client frame generator.
 */
export interface SlidingWindowState {
  nums: number[];
  window?: number[];
  deque_indices?: number[];
  max_values?: number[];
  [key: string]: unknown;
}

/**
 * Linear canvas adapter root props.
 */
export interface LinearCanvasProps<TState = SlidingWindowState> {
  frame?: Frame<TState> | null;
  items?: (number | string)[];
  leftPointer?: number | null;
  rightPointer?: number | null;
  highlights?: FrameHighlight[];
  title?: string;
  emptyMessage?: string;
  itemWidth?: number;
  gap?: number;
  className?: string;
  onItemClick?: (index: number) => void;
}

/**
 * Calculates the bounding box for a sliding window.
 */
export function calculateWindowBounds(
  left: number | null | undefined,
  right: number | null | undefined,
  itemWidth: number = 64,
  gap: number = 12
): BoundingBoxLayout {
  if (left === null || left === undefined || right === null || right === undefined) {
    return { leftOffset: 0, width: 0, visible: false, span: 0 };
  }

  if (left < 0 || right < 0 || right < left) {
    return { leftOffset: 0, width: 0, visible: false, span: 0 };
  }
  
  const span = right - left + 1;
  const leftOffset = left * (itemWidth + gap);
  const width = span * itemWidth + Math.max(0, span - 1) * gap;
  return { leftOffset, width, visible: true, span };
}

/**
 * Gets the highlight for a given index.
 */
export function getHighlightForIndex(
  index: number,
  highlights: FrameHighlight[] = []
): { color: HighlightColor; label?: string } | null {
  if (!highlights || highlights.length === 0){
    return null;
  }
  const matchingHighlights = highlights.filter((highlight) =>
    highlight.indices.includes(index)
  );
  if (matchingHighlights.length === 0) {
    return null;
  }
  const sortedHighlights = matchingHighlights.sort((a, b) => {
    const priorityMap = {
      "success": 1,
      "danger": 2,
      "warning": 3,
      "primary": 4,
      "secondary": 5,
    };
    return priorityMap[a.color] - priorityMap[b.color];
  });
  return {
    color: sortedHighlights[0].color,
    label: sortedHighlights[0].label,
  };
}
