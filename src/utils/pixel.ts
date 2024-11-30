import type { Position } from '@/types'

export function makePixelPositionKey({ x, y }: Position) {
  return `${x}-${y}`
}

export function isPixelPositionChanged(
  prePosition: Position,
  curPosition: Position,
) {
  const prePosKey = makePixelPositionKey(prePosition)
  const curPosKey = makePixelPositionKey(curPosition)

  return prePosKey !== curPosKey
}

export function getPixelPosition(canvas: HTMLCanvasElement, event: MouseEvent, pixelSize: number): Position {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / pixelSize) * pixelSize;
  const y = Math.floor((event.clientY - rect.top) / pixelSize) * pixelSize;

  return { x, y };
};