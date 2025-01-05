import { fromEvent, merge, Observable, tap, throttleTime, noop } from 'rxjs'
import type { HSL, RGBA } from '@/types'

export const rgbToHsl = (rgb: RGBA) => {
  let { r, g, b } = rgb
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min
  const sum = max + min

  let h = 0
  let s = 0
  const l = sum / 2

  if (diff) {
    s = l > 0.5 ? diff / (2 - sum) : diff / sum
    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / diff + 2
        break
      case b:
        h = (r - g) / diff + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}


export const hslToRgb = (hsl: HSL) => {
  let { h, s, l } = hsl
  h = h / 360
  s = s / 100
  l = l / 100

  let red, green, blue

  const hueTorgb = (v1: number, v2: number, vH: number) => {
    vH = vH < 0 ? (vH + 1) : vH > 1 ? (vH - 1) : vH

    if (vH < 1 / 6) {
      return v1 + (v2 - v1) * 6 * vH
    }
    if (vH < 1 / 2) {
      return v2
    }
    if (vH < 2 / 3) {
      return v1 + (v2 - v1) * (2 / 3 - vH) * 6
    }
    return v1
  }

  if (s === 0) {
    red = green = blue = l
  } else {
    const v2 = l <= 0.5 ? l * (s + 1) : (l + s) - (l * s)
    const v1 = l * 2 - v2

    red = hueTorgb(v1, v2, h + 1 / 3)
    green = hueTorgb(v1, v2, h)
    blue = hueTorgb(v1, v2, h - 1 / 3)
  }

  return {
    r: Math.round(red * 255),
    g: Math.round(green * 255),
    b: Math.round(blue * 255)
  }
}

export const makeRGBA = (rgb: RGBA) => `
  rgba(
    ${rgb.r},
    ${rgb.g},
    ${rgb.b},
    ${rgb?.a ?? 1}
  )
`

export const drawHSLPalette = (ctx: CanvasRenderingContext2D, hue: number) => {
  const draw = (direction: 'row' | 'column') => {
    let gradient: CanvasGradient | null = null

    if (direction == 'row') {
      gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0)  
      gradient.addColorStop(0, 'white')
      gradient.addColorStop(1, `hsl(${hue}, 100%, 50%)`)
    } else {
      gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(1, 'black')
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  draw('row')
  draw('column')
}

export const calculateHue = (e: MouseEvent, el: HTMLDivElement) => {
  const rect = el.getBoundingClientRect()
  const hue = Math.round(Math.abs(e.clientX - rect.left) / rect.width * 360)

  const inLeftSide = e.clientX - rect.left < 0
  const inRightSide = e.clientX > rect.left && e.clientX - rect.left > rect.width

  if (inLeftSide) return 0
  if (inRightSide) return 360
  return hue
}

export const calculateAlpha = (e: MouseEvent, el: HTMLDivElement) => {
  const rect = el.getBoundingClientRect()
  const temp = Math.round((e.clientX - rect.left) / rect.width * 100)
  const alpha = Number((temp / 100).toFixed(2))

  return alpha > 1
    ? 1
    : alpha < 0
    ? 0
    : alpha
}

export const calculateRGB = (e: MouseEvent, el: HTMLCanvasElement) => {
  const rect = el.getBoundingClientRect();

  const getRGB = (x: number, y: number) => {
    x = Math.max(0, Math.min(x * (el.width / rect.width), el.width - 1));
    y = Math.max(0, Math.min(y * (el.height / rect.height), el.height - 1));

    const ctx = el.getContext("2d");
    const [r, g, b] = ctx!.getImageData(x, y, 1, 1).data;
    return { r, g, b };
  };

  const relativeX = e.clientX - rect.left;
  const relativeY = e.clientY - rect.top;

  return getRGB(relativeX, relativeY);
};

interface Mouse$ {
  [key: string]: {
    el: HTMLElement | Document
    mousedown?: (e: MouseEvent) => void
    mousemove?: (e: MouseEvent) => void
    mouseup?: (e: MouseEvent) => void
  }
}
export const getMouse$ = (props: Mouse$) => {
  const keys = Object.keys(props)
  const streams: Observable<MouseEvent>[] = []

  keys.forEach(key => {
    const {
      el,
      mousedown = noop,
      mousemove = noop,
      mouseup = noop
    } = props[key]

    streams.push(fromEvent<MouseEvent>(el, 'mousedown').pipe(
      tap(mousedown)
    ))
    streams.push(fromEvent<MouseEvent>(el, 'mousemove').pipe(
      throttleTime(16),
      tap(mousemove)
    ))
    streams.push(fromEvent<MouseEvent>(el, 'mouseup').pipe(
      tap(mouseup)
    ))
  })

  return merge(...streams)
}