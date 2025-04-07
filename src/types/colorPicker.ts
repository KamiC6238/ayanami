import type { Position } from "./common";

export interface RGBA {
	r: number;
	g: number;
	b: number;
	a?: number;
}

export interface HSL {
	h: number;
	s: number;
	l: number;
}

export type PickedPalette = Record<
	string,
	{
		pos: Position;
		tint: string;
		shade: string;
	}
>;
