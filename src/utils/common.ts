export const getMouseDirection = (e: MouseEvent, el: HTMLElement) => {
  const rect = el.getBoundingClientRect()

  return {
    inTopSide: e.clientY < rect.top,
    inLeftSide: e.clientX < rect.left,
    inRightSide: e.clientX > rect.left && e.clientX - rect.left > rect.width,
    inBottomSide: e.clientY > rect.top && e.clientY - rect.top > rect.height,
  }
}

export const calculateMousePosition = (e: MouseEvent, el: HTMLElement) => {
  const rect = el.getBoundingClientRect()
  const { inTopSide, inLeftSide, inRightSide, inBottomSide } = getMouseDirection(e, el)

  const formatPos = (x: number, y: number) => {
    return {
      x: Math.round(Math.abs(x)),
      y: Math.round(Math.abs(y))
    }
  }

  if (inLeftSide && inTopSide) {
    return { x: 0, y: 0 }
  }

  if (inTopSide && !inLeftSide && !inRightSide) {
    return formatPos(e.clientX - rect.left, 0)
  }

  if (inTopSide && inRightSide) {
    return formatPos(rect.width, 0)
  }

  if (inRightSide && !inTopSide && !inBottomSide) {
    return formatPos(rect.width, e.clientY - rect.top)
  }

  if (inBottomSide && inRightSide) {
    return formatPos(rect.width, rect.height)
  }

  if (inBottomSide && !inLeftSide && !inRightSide) {
    return formatPos(e.clientX - rect.left, rect.height)
  }

  if (inBottomSide && inLeftSide) {
    return formatPos(0, rect.height)
    
  }

  if (inLeftSide && !inTopSide) {
    return formatPos(0, e.clientY - rect.top)
  }

  return formatPos(e.clientX - rect.left, e.clientY - rect.top)
}