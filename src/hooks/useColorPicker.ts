import { fromEvent, merge, tap, throttleTime } from 'rxjs'
import { useColorPickerStore } from '@/store'
import { calculateRGB, hslToRgb, drawHSLPalette } from '@/utils'

export const useColorPicker = () => {
  const colorPickerStore = useColorPickerStore()

  const initPalette = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')

    if (ctx) {
      const hsl = { h: 0, s: 100, l: 50 }
      colorPickerStore.setRGB(hslToRgb(hsl))
      drawHSLPalette(ctx, hsl)
    }
  }

  const initCanvasListener = (canvas: HTMLCanvasElement) => {
    merge(
      fromEvent<MouseEvent>(canvas, 'mousedown').pipe(
        tap((event) => {
          colorPickerStore.setRGB(calculateRGB(event, canvas))
        })
      ),
      fromEvent<MouseEvent>(canvas, 'mousemove').pipe(
        throttleTime(16),
        tap((event) => {
          colorPickerStore.setRGB(calculateRGB(event, canvas))
        })
      ),
      fromEvent<MouseEvent>(canvas, 'mouseup').pipe(
        tap(() => {
          colorPickerStore.updatePickedColor()
        })
      ),
    ).subscribe()
  }

  const init = (canvas: HTMLCanvasElement) => {
    initPalette(canvas)
    initCanvasListener(canvas)
  }

  return {
    init
  }
}