import type { HSL, RGBA } from "@/types";
import {
	type Observable,
	fromEvent,
	merge,
	noop,
	tap,
	throttleTime,
} from "rxjs";

export const rgbToHsl = (rgb: RGBA) => {
	let { r, g, b } = rgb;
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const diff = max - min;
	const sum = max + min;

	let h = 0;
	let s = 0;
	const l = sum / 2;

	if (diff) {
		s = l > 0.5 ? diff / (2 - sum) : diff / sum;
		switch (max) {
			case r:
				h = (g - b) / diff + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / diff + 2;
				break;
			case b:
				h = (r - g) / diff + 4;
				break;
		}
		h /= 6;
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100),
	};
};

export const hslToRgb = (hsl: HSL) => {
	let { h, s, l } = hsl;
	h = h / 360;
	s = s / 100;
	l = l / 100;

	let red: number;
	let green: number;
	let blue: number;

	const hueToRgb = (v1: number, v2: number, vH: number) => {
		const _vH = vH < 0 ? vH + 1 : vH > 1 ? vH - 1 : vH;

		if (_vH < 1 / 6) {
			return v1 + (v2 - v1) * 6 * _vH;
		}
		if (_vH < 1 / 2) {
			return v2;
		}
		if (_vH < 2 / 3) {
			return v1 + (v2 - v1) * (2 / 3 - _vH) * 6;
		}
		return v1;
	};

	if (s === 0) {
		red = green = blue = l;
	} else {
		const v2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
		const v1 = l * 2 - v2;

		red = hueToRgb(v1, v2, h + 1 / 3);
		green = hueToRgb(v1, v2, h);
		blue = hueToRgb(v1, v2, h - 1 / 3);
	}

	return {
		r: Math.round(red * 255),
		g: Math.round(green * 255),
		b: Math.round(blue * 255),
	};
};

export const makeRGBA = (rgb: RGBA) =>
	`rgba(${rgb.r},${rgb.g},${rgb.b},${rgb?.a ?? 1})`;

export const drawHSLPalette = (ctx: CanvasRenderingContext2D, hue: number) => {
	const draw = (direction: "row" | "column") => {
		let gradient: CanvasGradient | null = null;

		if (direction === "row") {
			gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
			gradient.addColorStop(0, "white");
			gradient.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
		} else {
			gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
			gradient.addColorStop(0, "transparent");
			gradient.addColorStop(1, "black");
		}

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	};

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	draw("row");
	draw("column");
};

export const calculateHue = (e: MouseEvent, el: HTMLDivElement) => {
	const rect = el.getBoundingClientRect();
	const hue = Math.round((Math.abs(e.clientX - rect.left) / rect.width) * 360);

	const inLeftSide = e.clientX - rect.left < 0;
	const inRightSide =
		e.clientX > rect.left && e.clientX - rect.left > rect.width;

	if (inLeftSide) return 0;
	if (inRightSide) return 360;
	return hue;
};

export const calculateAlpha = (e: MouseEvent, el: HTMLDivElement) => {
	const rect = el.getBoundingClientRect();
	const temp = Math.round(((e.clientX - rect.left) / rect.width) * 100);
	const alpha = Number((temp / 100).toFixed(2));

	return alpha > 1 ? 1 : alpha < 0 ? 0 : alpha;
};

export const calculateRGB = (e: MouseEvent, el: HTMLCanvasElement) => {
	const rect = el.getBoundingClientRect();

	const relativeX = e.clientX - rect.left;
	const relativeY = e.clientY - rect.top;

	const x = Math.max(
		0,
		Math.min(relativeX * (el.width / rect.width), el.width - 1),
	);
	const y = Math.max(
		0,
		Math.min(relativeY * (el.height / rect.height), el.height - 1),
	);

	const ctx = el.getContext("2d");

	const [r, g, b] = ctx?.getImageData(x, y, 1, 1).data ?? [0, 0, 0];
	return { r, g, b };
};

interface Mouse$ {
	[key: string]: {
		el: HTMLElement | Document;
		mousedown?: (e: MouseEvent) => void;
		mousemove?: (e: MouseEvent) => void;
		mouseup?: (e: MouseEvent) => void;
	};
}
export const getMouse$ = (props: Mouse$) => {
	const keys = Object.keys(props);
	const streams: Observable<MouseEvent>[] = [];

	for (const key of keys) {
		const {
			el,
			mousedown = noop,
			mousemove = noop,
			mouseup = noop,
		} = props[key];

		streams.push(fromEvent<MouseEvent>(el, "mousedown").pipe(tap(mousedown)));
		streams.push(
			fromEvent<MouseEvent>(el, "mousemove").pipe(
				throttleTime(16),
				tap(mousemove),
			),
		);
		streams.push(fromEvent<MouseEvent>(el, "mouseup").pipe(tap(mouseup)));
	}

	return merge(...streams);
};

export const rgbToHex = (rgba: RGBA) => {
	const { r, g, b, a } = rgba;
	const alpha = Math.round(a ?? 1 * 255);
	const toHex = (n: number) => n.toString(16).padStart(2, "0");

	return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
};

export const generateTintAndShade = (hsl: HSL): { tint: RGBA; shade: RGBA } => {
	const { h, s, l } = hsl;

	const tintLightness = Math.min(l + (100 - l) * 0.2, 100);
	const tint: HSL = { h, s, l: Math.round(tintLightness) };

	const shadeLightness = Math.max(l - l * 0.2, 0);
	const shade: HSL = { h, s, l: Math.round(shadeLightness) };

	return {
		tint: hslToRgb(tint),
		shade: hslToRgb(shade),
	};
};

export const blendHexColors = (baseHex: string, topHex: string): string => {
	const parseHex = (hex: string) => {
		let _hex = hex;
		if (hex.startsWith("#")) _hex = hex.slice(1);
		if (_hex.length !== 8) throw new Error("Invalid color format");
		const r = Number.parseInt(_hex.slice(0, 2), 16);
		const g = Number.parseInt(_hex.slice(2, 4), 16);
		const b = Number.parseInt(_hex.slice(4, 6), 16);
		const a = Number.parseInt(_hex.slice(6, 8), 16) / 255;
		return { r, g, b, a };
	};

	const blendChannel = (
		top: number,
		topA: number,
		base: number,
		baseA: number,
	) => {
		return Math.round(
			(top * topA + base * baseA * (1 - topA)) / (topA + baseA * (1 - topA)),
		);
	};

	const base = parseHex(baseHex);
	const top = parseHex(topHex);

	const outA = top.a + base.a * (1 - top.a);

	if (outA === 0) {
		return "#00000000";
	}

	const outR = blendChannel(top.r, top.a, base.r, base.a);
	const outG = blendChannel(top.g, top.a, base.g, base.a);
	const outB = blendChannel(top.b, top.a, base.b, base.b);

	// 转成16进制
	const toHex = (v: number) => v.toString(16).padStart(2, "0");
	const outAlpha = Math.round(outA * 255);

	return `#${toHex(outR)}${toHex(outG)}${toHex(outB)}${toHex(outAlpha)}`;
};

export const getTextColorFromRGB = (rgba: RGBA) => {
	const { r, g, b, a = 1 } = rgba;
	const _r = Math.round(r * a + 255 * (1 - a));
	const _g = Math.round(g * a + 255 * (1 - a));
	const _b = Math.round(b * a + 255 * (1 - a));
	const brightness = 0.299 * _r + 0.587 * _g + 0.114 * _b;

	return brightness > 128 ? "black" : "white";
};
