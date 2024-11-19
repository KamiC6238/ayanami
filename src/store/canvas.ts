import { defineStore } from 'pinia'

interface CanvasStoreState {
  canvas: HTMLCanvasElement | null
}

export const useCanvasStore = defineStore('canvas', {
  state: (): CanvasStoreState => ({
    canvas: null
  }),
  getters: {
    canvasContext: state => {
      return state.canvas?.getContext('2d')
    }
  },
  actions: {
    setCanvas(canvas: HTMLCanvasElement) {
      this.canvas = canvas
    }
  }
})