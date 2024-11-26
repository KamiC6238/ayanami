export type FillRectConfig = {
  pixelSize: number
  color: string
}

export type FillHoverRectConfig = Pick<FillRectConfig, 'pixelSize'>

export type ClearRectConfig = Pick<FillRectConfig, 'pixelSize'>