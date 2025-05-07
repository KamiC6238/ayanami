import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx,vue}'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    ui: true,
  },
  resolve: {
		alias: [
			{
				find: "@",
				replacement: resolve(__dirname, "src"),
			},
		],
  }
}) 