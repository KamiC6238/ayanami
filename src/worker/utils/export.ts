import { ExportTypeEnum } from "@/types";
import type { Record, SourceFile } from "@/types";

export const exportToPNG = async (canvas: OffscreenCanvas, self: Window) => {
	const blob = await canvas.convertToBlob({
		type: "image/png",
		quality: 1,
	});

	self.postMessage({
		type: "export",
		payload: {
			exportType: ExportTypeEnum.PNG,
			blob,
		},
	});
};

export const exportToSource = async (
	canvas: OffscreenCanvas,
	colorsIndex: string[],
	records: Record[],
	self: Window,
) => {
	const data: SourceFile = {
		width: canvas.width,
		height: canvas.height,
		colorsIndex,
		records,
	};

	const blob = new Blob([JSON.stringify(data)], { type: "application/json" });

	self.postMessage({
		type: "export",
		payload: {
			exportType: ExportTypeEnum.Source,
			blob,
		},
	});
};
