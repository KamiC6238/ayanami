import { Position } from './common'

export type CanvasType = 'main' | 'preview' | 'grid'

export interface InitCanvasConfig {
  type: CanvasType
}

export interface RectConfig {
  position: Position
  canvasType: CanvasType
}

export type SquareRectConfig = RectConfig & {
  endPosition: Position
}