import type { Position } from '@/types'

export function isPixelPositionChanged(
  prePosition: Position,
  curPosition: Position
) {
  return (
    prePosition.x !== curPosition.x ||
    prePosition.y !== curPosition.y
  )
}

export function makePixelPositionKey({ x, y }: Position) {
  return `${x}-${y}`;
}

export function getPixelPosition(canvas: HTMLCanvasElement, event: MouseEvent): Position {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / 10) * 10;
  const y = Math.floor((event.clientY - rect.top) / 10) * 10;

  return { x, y };
};