import type { Position } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export const getMouseDirection = (e: MouseEvent, el: HTMLElement) => {
	const rect = el.getBoundingClientRect();

	return {
		inTopSide: e.clientY < rect.top,
		inLeftSide: e.clientX < rect.left,
		inRightSide: e.clientX > rect.left && e.clientX - rect.left > rect.width,
		inBottomSide: e.clientY > rect.top && e.clientY - rect.top > rect.height,
	};
};

export const calculateMousePosition = (e: MouseEvent, el: HTMLElement) => {
	const rect = el.getBoundingClientRect();
	const { inTopSide, inLeftSide, inRightSide, inBottomSide } =
		getMouseDirection(e, el);

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

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const roughSizeOfObject = (object: any) => {
	const seen = new WeakSet();

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const sizeOf = (obj: any) => {
		if (obj === null) return 0;

		const objType = typeof obj;

		if (objType === "boolean") return 4;
		if (objType === "number") return 8;
		if (objType === "string") return (obj as string).length * 2;
		if (objType === "symbol") return 0;
		if (objType === "function") return 0;
		if (objType === "undefined") return 0;

		if (seen.has(obj)) return 0;
		seen.add(obj);

		let bytes = 0;

		if (Array.isArray(obj)) {
			for (let i = 0; i < obj.length; i++) {
				bytes += sizeOf(obj[i]);
			}
		} else if (objType === "object") {
			for (const key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					bytes += sizeOf(key);
					bytes += sizeOf(obj[key]);
				}
			}
		}

		return bytes;
	};

	const formatSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
		if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
		return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
	};

	return formatSize(sizeOf(object));
};

export const checkIsValidPosition = (
	canvas: HTMLCanvasElement | OffscreenCanvas,
	position: Position,
) => {
	if (!canvas) return false;

	const { width, height } = canvas;
	const styleWidth = width / 2;
	const styleHeight = height / 2;
	const { x, y } = position;

	if (x < 0 || x > styleWidth) return false;
	if (y < 0 || y > styleHeight) return false;
	return true;
};
