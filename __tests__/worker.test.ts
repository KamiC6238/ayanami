import '@vitest/web-worker'
import CoreWorker from '@/worker?worker'
import { describe, it, expect, vi } from 'vitest'

describe('Worker testing', () => {
  it('should handle worker message communication', () => {
    const worker = new CoreWorker()

    worker.onmessage = (e) => {
      expect(e.data).toEqual({
        type: "clearAllPixels",
        payload: {
          canvasType: "main",
        },
      })
    }

    const postMessage = vi.spyOn(worker, 'postMessage')

    worker.postMessage({
      type: "clearAllPixels",
			payload: {
				canvasType: "main",
			},
    })

    expect(postMessage).toHaveBeenCalledWith({
      type: "clearAllPixels",
      payload: {
        canvasType: "main",
      },
    })
  })
})