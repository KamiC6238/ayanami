import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ['__tests__/**/*.{test,spec}.ts'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    // ui: true,
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