import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import svgLoader from "vite-svg-loader";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue(), tailwindcss(), svgLoader()],
	resolve: {
		alias: [
			{
				find: "@",
				replacement: path.resolve(__dirname, "src"),
			},
		],
	},
});
