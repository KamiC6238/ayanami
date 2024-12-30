<script lang="ts" setup>
import { onMounted, useTemplateRef, ref } from 'vue';
import { fromEvent, tap } from 'rxjs'

const paletteRef = useTemplateRef('paletteRef')
const hue = ref(0)
const canvasWidth = ref(0)
const canvasHeight = ref(0)

onMounted(() => initCanvas())

const initCanvas = () => {
  const canvas = paletteRef.value

  if (canvas) {
    const ctx = canvas.getContext('2d')
    canvasWidth.value = canvas.width = canvas.offsetWidth;
    canvasHeight.value = canvas.height = canvas.offsetHeight;
    ctx && drawGradient(ctx);

    initCavnasListener()
  }
}

const initCavnasListener = () => {
  const canvas = paletteRef.value

  if (canvas) {
    fromEvent<MouseEvent>(canvas, 'mousedown').pipe(
      tap((event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rgb = getRGBFromPosition(x, y);
        // updateRGBInputs(rgb);
        // updateCursor(x, y);
        console.log(rgb)
      })
    ).subscribe()
  }
}

const getRGBFromPosition = (x: number, y: number) => {
  const ctx = paletteRef.value!.getContext("2d")
  const imageData = ctx!.getImageData(x, y, 1, 1).data
  return { r: imageData[0], g: imageData[1], b: imageData[2] }
}

const drawGradient = (ctx: CanvasRenderingContext2D) => {
  const draw = (direction: 'row' | 'column') => {
    let gradient: CanvasGradient | null = null

    if (direction == 'row') {
      gradient = ctx.createLinearGradient(0, 0, canvasWidth.value, 0)  
      gradient.addColorStop(0, 'white')
      gradient.addColorStop(1, `hsl(${hue.value}, 100%, 50%)`)
    } else {
      gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight.value)
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(1, 'black')
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  }

  draw('row')
  draw('column')
}
</script>
<template>
  <div class="palette-wrapper">
    <canvas class="palette" ref="paletteRef" />
  </div>
</template>
<style scoped>
.palette {
  width: 100px;
  height: 100px;
}
</style>