import type { Position } from '@/types'

export function makePixelPositionKey({ x, y }: Position, pixelSize: number) {
  const topLeftPos = { x, y }
  const bottomRightPos = {
    x: x + pixelSize,
    y: y + pixelSize
  }

  return `${topLeftPos.x}_${topLeftPos.y}_${bottomRightPos.x}_${bottomRightPos.y}`
}

export function isPixelPositionChanged(
  prePosition: Position,
  curPosition: Position,
  pixelSize: number
) {
  const prePosKey = makePixelPositionKey(prePosition, pixelSize)
  const curPosKey = makePixelPositionKey(curPosition, pixelSize)

  return prePosKey !== curPosKey
}

export function getPixelPosition(canvas: HTMLCanvasElement, event: MouseEvent): Position {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / 10) * 10;
  const y = Math.floor((event.clientY - rect.top) / 10) * 10;

  return { x, y };
};