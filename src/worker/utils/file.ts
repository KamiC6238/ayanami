import { ExportTypeEnum } from "@/types";
import type {
	ExportMessagePayload,
	ExportOpRecord,
	Frame,
	ImportMessagePayload,
	OpRecord,
	SourceFile,
} from "@/types";
import { useRecords, useRender } from "../signals";
import { useFrames } from "../signals/frames";
import * as recordUtils from "./record";

const { getRecords, setRecordsFromImportFile } = useRecords();
const { getCanvas } = useRender();
const { setFramesFromImportFile } = useFrames();

const convertToExportRecord = (record: OpRecord): ExportOpRecord => {
	const returnFrameId = record.returnFrameId || "";
	const timestamp = record.timestamp || 0;
	const copyTimestamp = record.copyTimestamp || 0;
	return [...record, returnFrameId, timestamp, copyTimestamp];
};

const convertFromExportRecord = (exportRecord: ExportOpRecord): OpRecord => {
	const returnFrameId = exportRecord[exportRecord.length - 3] as string;
	const timestamp = exportRecord[exportRecord.length - 2] as number;
	const copyTimestamp = exportRecord[exportRecord.length - 1] as number;
	const originalRecord = exportRecord.slice(0, -3) as OpRecord;

	if (returnFrameId) {
		originalRecord.returnFrameId = returnFrameId;
	}
	if (timestamp) {
		originalRecord.timestamp = timestamp;
	}
	if (copyTimestamp) {
		originalRecord.copyTimestamp = copyTimestamp;
	}

	return originalRecord;
};

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
	const exportRecords = records.map(convertToExportRecord).reverse();

	const data: SourceFile = {
		width: canvas.width,
		height: canvas.height,
		colorsIndex,
		framesIndex,
		records: exportRecords,
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
	const canvas = getCanvas("main");
	if (!canvas) return;

	switch (exportType) {
		case ExportTypeEnum.PNG:
			exportToPNG(canvas, self);
			break;
		case ExportTypeEnum.Source: {
			const { undoStack, colorsIndex, framesIndex } = getRecords(tabId);
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
			const convertedRecords = records.map(convertFromExportRecord);

			setRecordsFromImportFile(tabId, {
				redoStack: convertedRecords,
				colorsIndex,
				framesIndex,
			});

			setFramesFromImportFile(tabId, {
				[framesIndex[0]]: {} as Frame,
			});

			recordUtils.replayAllRecordsFromImportFile(tabId);
		} catch {}
	};

	reader.onerror = () => {
		console.error("Reading file failed.");
	};

	reader.readAsText(file);
};
