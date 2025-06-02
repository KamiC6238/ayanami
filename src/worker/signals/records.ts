import {
	type ClearRectMessagePayload,
	type EraserPointRecord,
	type FillRectMessagePayload,
	type ImportFileConfig,
	type OpRecord,
	type PencilPointRecord,
	type Position,
	type Records,
	ToolTypeEnum,
} from "@/types";
import { signal } from "alien-signals";
import { produce } from "immer";

const records = signal<Records>({});
const pencilRecordPoints = signal<PencilPointRecord[]>([]);
const eraserRecordPoints = signal<EraserPointRecord[]>([]);

export const useRecords = () => {
	const initRecords = (tabId: string) => {
		records(
			produce(records(), (draft) => {
				draft[tabId] = {
					undoStack: [],
					redoStack: [],
					colorsIndex: [],
					framesIndex: [],
					tabId,
				};
			}),
		);
	};

	const getRecords = (tabId: string) => records()[tabId];

	const getPencilRecordPoints = () => pencilRecordPoints();

	const getEraserRecordPoints = () => eraserRecordPoints();

	const getUndoStack = (tabId: string) => records()[tabId].undoStack;

	const getRedoStack = (tabId: string) => records()[tabId].redoStack;

	const getRecordsWithFrameId = (tabId: string, frameId: string) => {
		const undoStack = getUndoStack(tabId);
		return undoStack.filter((record) => {
			const [_, frameIndex] = record;
			const _frameIndex = getFrameIndex(tabId, frameId);
			return _frameIndex === frameIndex;
		});
	};

	const getColor = (tabId: string, colorIndex: number) => {
		const records = getRecords(tabId);

		if (records) {
			return records.colorsIndex[colorIndex];
		}
		return "";
	};

	const getColorsIndex = (tabId: string) => {
		const records = getRecords(tabId);

		if (records) {
			return [...records.colorsIndex];
		}
		return [];
	};

	const getColorIndex = (tabId: string, pixelColor: string) => {
		const colorsIndex = [...getRecords(tabId).colorsIndex];

		let colorIndex = colorsIndex.findIndex((color) => color === pixelColor);
		if (colorIndex === -1) {
			colorsIndex.push(pixelColor);
			colorIndex = colorsIndex.length - 1;
		}

		updateColorsIndex(tabId, colorsIndex);

		return colorIndex;
	};

	const getFrameIndexByRecord = (record: OpRecord) => record[1];

	const getFrameIndex = (tabId: string, frameId: string) => {
		const framesIndex = [...getRecords(tabId).framesIndex];

		let frameIndex = framesIndex.findIndex((color) => color === frameId);
		if (frameIndex === -1) {
			framesIndex.push(frameId);
			frameIndex = framesIndex.length - 1;
		}

		updateFramesIndex(tabId, framesIndex);

		return frameIndex;
	};

	const getFrameId = (tabId: string, frameIndex: number) => {
		const framesIndex = [...getRecords(tabId).framesIndex];
		return framesIndex[frameIndex];
	};

	const getFrameIdWhenUndoRedo = (
		frameId: string,
		{
			tabId,
			isUndo,
			record,
		}: { tabId: string; isUndo: boolean; record: OpRecord },
	) => {
		const recordFrameIndex = getFrameIndexByRecord(record);
		const curFrameIndex = getFrameIndex(tabId, frameId);
		let hasReturnFrameId = false;

		if (
			isUndo &&
			typeof recordFrameIndex === "number" &&
			recordFrameIndex !== curFrameIndex
		) {
			hasReturnFrameId = true;
		}

		return {
			frameId: getFrameId(tabId, recordFrameIndex),
			returnFrameId: hasReturnFrameId ? frameId : "",
		};
	};

	const popUndoStack = (tabId: string) => {
		let record: OpRecord | undefined;

		records(
			produce(records(), (draft) => {
				const _record = draft[tabId].undoStack.pop();
				if (!_record) return;

				/**
				 * Read returnFrameId before JSON.stringify,
				 * because JSON.stringify will clear the returnFrameId
				 */
				const returnFrameId = _record.returnFrameId;
				record = JSON.parse(JSON.stringify(_record)) as OpRecord;

				if (returnFrameId) {
					record.returnFrameId = returnFrameId;
				}
			}),
		);

		return record;
	};

	const popRedoStack = (tabId: string) => {
		let record: OpRecord | undefined;

		records(
			produce(records(), (draft) => {
				const _record = draft[tabId].redoStack.pop();
				if (!_record) return;

				/**
				 * Read returnFrameId before JSON.stringify,
				 * because JSON.stringify will clear the returnFrameId
				 */
				const returnFrameId = _record.returnFrameId;
				record = JSON.parse(JSON.stringify(_record)) as OpRecord;

				if (returnFrameId) {
					record.returnFrameId = returnFrameId;
				}
			}),
		);

		return record;
	};

	const addRecordToUndoStack = (tabId: string, record: OpRecord) => {
		records(
			produce(records(), (draft) => {
				draft[tabId].undoStack.push(record);
			}),
		);
	};

	const addRecordToRedoStack = (tabId: string, record: OpRecord) => {
		records(
			produce(records(), (draft) => {
				draft[tabId].redoStack.push(record);
			}),
		);

		console.log("redoStack", records()[tabId].redoStack);
	};

	const updatePencilPointsRecord = (position: Position) => {
		let saveAsNewPoint = true;

		pencilRecordPoints(
			produce(pencilRecordPoints(), (draft) => {
				for (let i = 0; i < draft.length; i++) {
					const [x, y, drawCounts] = draft[i];
					if (position.x === x && position.y === y) {
						draft[i] = [x, y, drawCounts + 1];
						saveAsNewPoint = false;
						break;
					}
				}

				if (saveAsNewPoint) {
					draft.push([position.x, position.y, 1]);
				}
			}),
		);
	};

	const updateEraserPointsRecord = (position: Position) => {
		let saveAsNewPoint = true;

		eraserRecordPoints(
			produce(eraserRecordPoints(), (draft) => {
				for (let i = 0; i < draft.length; i++) {
					const [x, y] = draft[i];
					if (position.x === x && position.y === y) {
						saveAsNewPoint = false;
						break;
					}
				}

				if (saveAsNewPoint) {
					draft.push([position.x, position.y]);
				}
			}),
		);
	};

	const updatePointsRecord = (
		payload:
			| Pick<FillRectMessagePayload, "toolType" | "position">
			| Pick<ClearRectMessagePayload, "toolType" | "position">,
	) => {
		const { toolType, position } = payload;

		switch (toolType) {
			case ToolTypeEnum.Pencil:
				updatePencilPointsRecord(position);
				break;
			case ToolTypeEnum.Eraser:
				updateEraserPointsRecord(position);
				break;
		}
	};

	const updateColorsIndex = (tabId: string, colorsIndex: string[]) => {
		records(
			produce(records(), (draft) => {
				draft[tabId].colorsIndex = colorsIndex;
			}),
		);
	};

	const updateFramesIndex = (tabId: string, framesIndex: string[]) => {
		records(
			produce(records(), (draft) => {
				draft[tabId].framesIndex = framesIndex;
			}),
		);
	};

	const clearRecordPoints = () => {
		pencilRecordPoints([]);
		eraserRecordPoints([]);
	};

	// TODO: FIXME 这里需要加上 frameId 来清除 redoStack
	const clearRedoStack = (tabId: string) => {
		records(
			produce(records(), (draft) => {
				draft[tabId].redoStack = [];
			}),
		);
	};

	const setRecordsFromImportFile = (
		tabId: string,
		config: ImportFileConfig,
	) => {
		records(
			produce(records(), (draft) => {
				draft[tabId] = {
					redoStack: [],
					undoStack: [...config.undoStack],
					colorsIndex: [...config.colorsIndex],
					framesIndex: [...config.framesIndex],
					tabId,
				};
			}),
		);
	};

	return {
		initRecords,
		getRecords,
		getPencilRecordPoints,
		getEraserRecordPoints,
		getColor,
		getColorIndex,
		getColorsIndex,
		getFrameIndexByRecord,
		getFrameIndex,
		getFrameId,
		getFrameIdWhenUndoRedo,
		getUndoStack,
		getRedoStack,
		getRecordsWithFrameId,
		popUndoStack,
		popRedoStack,
		addRecordToUndoStack,
		addRecordToRedoStack,
		updatePointsRecord,
		updateColorsIndex,
		updateFramesIndex,
		clearRedoStack,
		clearRecordPoints,
		setRecordsFromImportFile,
	};
};
