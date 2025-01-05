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
  const rect = el.getBoundingClientRect();
  const { inTopSide, inLeftSide, inRightSide, inBottomSide } = getMouseDirection(e, el);

  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  if (inLeftSide) {
    x = 0;
  } else if (inRightSide) {
    x = rect.width;
  }

  if (inTopSide) {
    y = 0;
  } else if (inBottomSide) {
    y = rect.height;
  }

  x = Math.max(0, Math.min(x, rect.width));
  y = Math.max(0, Math.min(y, rect.height));

  return {
    x: Math.round(x),
    y: Math.round(y),
  };
};