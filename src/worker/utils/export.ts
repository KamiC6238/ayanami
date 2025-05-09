import { ExportTypeEnum } from "@/types";
import type { ExportMessagePayload, Record, SourceFile } from "@/types";
import * as recordUtils from "./record";
import * as renderUtils from "./render";

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

export const exportToSource = (
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

export const exportFile = (payload: ExportMessagePayload) => {
	const { exportType, tabId } = payload;
	const canvas = renderUtils.getCanvas("main");
	if (!canvas) return;

	switch (exportType) {
		case ExportTypeEnum.PNG:
			exportToPNG(canvas, self);
			break;
		case ExportTypeEnum.Source: {
			const { undoStack } = recordUtils.getUndoAndRedoStack(tabId);
			exportToSource(canvas, recordUtils.getColorsIndex(), undoStack, self);
			break;
		}
	}
};
