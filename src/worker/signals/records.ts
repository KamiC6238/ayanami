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

const records = signal<Records>({});
const pencilRecordPoints = signal<PencilPointRecord[]>([]);
const eraserRecordPoints = signal<EraserPointRecord[]>([]);

export const useRecords = () => {
	const initRecords = (tabId: string) => {
		records({
			...records(),
			[tabId]: {
				undoStack: [],
				redoStack: [],
				colorsIndex: [],
				framesIndex: [],
				tabId,
			},
		});
	};

	const getRecords = (tabId: string) => records()[tabId];

	const getPencilRecordPoints = () => pencilRecordPoints();

	const getEraserRecordPoints = () => eraserRecordPoints();

	const getUndoStack = (tabId: string) => records()[tabId].undoStack;

	const getRedoStack = (tabId: string) => records()[tabId].redoStack;

	const getRecordsWithFrameId = (tabId: string, frameId: string) => {
		const undoStack = getUndoStack(tabId);
		return undoStack.filter((record) => {
			const [toolType] = record;
			const frameIndex =
				toolType === ToolTypeEnum.Eraser ? record[1] : record[2];
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

	const getFrameIndexByRecord = (record: OpRecord) => {
		const [toolType] = record;
		return toolType === ToolTypeEnum.Eraser ? record[1] : record[2];
	};

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

		if (
			isUndo &&
			typeof recordFrameIndex === "number" &&
			recordFrameIndex !== curFrameIndex
		) {
			record.returnFrameId = frameId;
			return getFrameId(tabId, recordFrameIndex);
		}
		return frameId;
	};

	const popUndoStack = (tabId: string) => {
		const undoStack = getUndoStack(tabId);
		const record = undoStack.pop();

		records({
			...records(),
			[tabId]: {
				...records()[tabId],
				undoStack: [...undoStack],
			},
		});

		return record;
	};

	const popRedoStack = (tabId: string) => {
		const redoStack = getRedoStack(tabId);
		const record = redoStack.pop();

		records({
			...records(),
			[tabId]: {
				...records()[tabId],
				redoStack: [...redoStack],
			},
		});

		return record;
	};
	const addRecordToUndoStack = (tabId: string, record: OpRecord) => {
		records({
			...records(),
			[tabId]: {
				...records()[tabId],
				undoStack: [...records()[tabId].undoStack, record],
			},
		});
	};

	const addRecordToRedoStack = (tabId: string, record: OpRecord) => {
		records({
			...records(),
			[tabId]: {
				...records()[tabId],
				redoStack: [...records()[tabId].redoStack, record],
			},
		});
	};

	const updatePencilPointsRecord = (position: Position) => {
		let saveAsNewPoint = true;

		pencilRecordPoints(
			[...pencilRecordPoints()].map((point) => {
				const [x, y, drawCounts] = point;

				if (position.x === x && position.y === y) {
					saveAsNewPoint = false;
					return [x, y, drawCounts + 1];
				}
				return point;
			}),
		);

		if (saveAsNewPoint) {
			pencilRecordPoints([
				...pencilRecordPoints(),
				[position.x, position.y, 1],
			]);
		}
	};

	const updateEraserPointsRecord = (position: Position) => {
		let saveAsNewPoint = true;

		eraserRecordPoints(
			[...eraserRecordPoints()].map((point) => {
				const [x, y] = point;

				if (position.x === x && position.y === y) {
					saveAsNewPoint = false;
					return [x, y];
				}
				return point;
			}),
		);

		if (saveAsNewPoint) {
			eraserRecordPoints([...eraserRecordPoints(), [position.x, position.y]]);
		}
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
		records({
			...records(),
			[tabId]: {
				...records()[tabId],
				colorsIndex,
			},
		});
	};

	const updateFramesIndex = (tabId: string, framesIndex: string[]) => {
		records({
			...records(),
			[tabId]: {
				...records()[tabId],
				framesIndex,
			},
		});
	};

	const clearRecordPoints = () => {
		pencilRecordPoints([]);
		eraserRecordPoints([]);
	};

	// TODO: FIXME 这里需要加上 frameId 来清除 redoStack
	const clearRedoStack = (tabId: string) => {
		records({
			...records(),
			[tabId]: {
				...records()[tabId],
				redoStack: [],
			},
		});
	};

	const setRecordsFromImportFile = (
		tabId: string,
		config: ImportFileConfig,
	) => {
		records({
			...records(),
			[tabId]: {
				redoStack: [],
				undoStack: [...config.undoStack],
				colorsIndex: [...config.colorsIndex],
				framesIndex: [...config.framesIndex],
				tabId,
			},
		});
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
