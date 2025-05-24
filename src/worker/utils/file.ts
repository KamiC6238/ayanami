import { ExportTypeEnum } from "@/types";
import type {
	ExportMessagePayload,
	ImportMessagePayload,
	OpRecord,
	SourceFile,
} from "@/types";
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
	framesIndex: string[],
	records: OpRecord[],
	self: Window,
) => {
	const data: SourceFile = {
		width: canvas.width,
		height: canvas.height,
		colorsIndex,
		framesIndex,
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
			const { undoStack, colorsIndex, framesIndex } =
				recordUtils.getUndoAndRedoStack(tabId);
			exportToSource(canvas, colorsIndex, framesIndex, undoStack, self);
			break;
		}
	}
};

export const importFile = (payload: ImportMessagePayload) => {
	const { tabId, file } = payload;
	const reader = new FileReader();

	reader.onload = (e) => {
		try {
			const content = e.target?.result as string;
			const data = JSON.parse(content) as SourceFile;
			const { colorsIndex, framesIndex, records } = data;

			recordUtils.setRecordsFromImportFile(tabId, {
				undoStack: records,
				colorsIndex,
				framesIndex,
			});
			// TODO: FIXME
			renderUtils.replayRecords(records, { tabId, frameId: "" });
		} catch {}
	};

	reader.onerror = () => {
		console.error("Reading file failed.");
	};

	reader.readAsText(file);
};
