// pixel
export const DEFAULT_PIXEL_SIZE = 5;
export const GRID_SIZE = DEFAULT_PIXEL_SIZE;
export const DEFAULT_PIXEL_COLOR = "#000000";
export const DEFAULT_HOVERED_PIXEL_COLOR = "rgba(200, 200, 200, 0.5)";

// localStorage
export const STORAGE_KEY_FOR_COLOR_PALETTE = "ayanami__color-palette";
export const STORAGE_KEY_FOR_LAST_PICKED_COLOR = "ayanami__last-picked-color";
export const STORAGE_KEY_FOR_LAST_USED_PIXEL_SIZE =
	"ayanami__last-used-pixel-size";

export const DEFAULT_LAST_PICKED_COLOR = {
	alpha: 0.94,
	hsl: { h: 240, s: 54, l: 48 },
	hslPalettePos: { x: 151, y: 29 },
	pickedColor: "rgba(56,56,188,0.94)",
};

export const DEFAULT_COLOR_PALETTE = {
	"rgba(56,56,188,0.94)": {
		pos: { x: 151, y: 29 },
		shade: "rgba(45,45,149,0.94)",
		tint: "rgba(90,90,206,0.94)",
	},
};
