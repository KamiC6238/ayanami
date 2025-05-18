import type {
	BroomRecord,
	BucketRecord,
	CircleRecord,
	ClearRectMessagePayload,
	EraserPointRecord,
	EraserRecord,
	FillRectMessagePayload,
	ImportFileConfig,
	LineRecord,
	OpRecord,
	PencilPointRecord,
	PencilRecord,
	Position,
	RecordMessagePayload,
	Records,
	SquareRecord,
} from "@/types";
import { ToolTypeEnum } from "@/types";

const records: Records = {};
let pencilRecordPoints: PencilPointRecord[] = [];
let eraserRecordPoints: EraserPointRecord[] = [];

const initRecords = (tabId: string) => {
	records[tabId] = {
		undoStack: [],
		redoStack: [],
		colorsIndex: [],
		framesIndex: [],
		tabId,
	};
};

export const setRecordsFromImportFile = (
	tabId: string,
	config: ImportFileConfig,
) => {
	records[tabId] = {
		redoStack: [],
		undoStack: [...config.undoStack],
		colorsIndex: [...config.colorsIndex],
		framesIndex: [...config.framesIndex],
		tabId,
	};
};

export const getColor = (tabId: string, colorIndex: number) => {
	if (records[tabId]) {
		return records[tabId].colorsIndex[colorIndex];
	}
	return "";
};

export const getColorsIndex = (tabId: string) => {
	if (records[tabId]) {
		return [...records[tabId].colorsIndex];
	}
	return [];
};

const getColorIndex = (tabId: string, pixelColor: string) => {
	if (!records[tabId]) {
		initRecords(tabId);
	}

	const colorsIndex = [...records[tabId].colorsIndex];

	let colorIndex = colorsIndex.findIndex((color) => color === pixelColor);
	if (colorIndex === -1) {
		colorsIndex.push(pixelColor);
		colorIndex = colorsIndex.length - 1;
	}

	records[tabId].colorsIndex = [...colorsIndex];

	return colorIndex;
};

const getFrameIndex = (tabId: string, frameId: string) => {
	if (!records[tabId]) {
		initRecords(tabId);
	}

	const framesIndex = [...records[tabId].framesIndex];

	let frameIndex = framesIndex.findIndex((color) => color === frameId);
	if (frameIndex === -1) {
		framesIndex.push(frameId);
		frameIndex = framesIndex.length - 1;
	}

	records[tabId].framesIndex = [...framesIndex];

	return frameIndex;
};

const clearRecordPoints = () => {
	pencilRecordPoints.length = 0;
	eraserRecordPoints.length = 0;
};

const makePencilRecord = (
	payload: RecordMessagePayload,
): PencilRecord | null => {
	const { tabId, frameId, toolType, pixelColor, pixelSize } = payload;

	console.log(payload);

	if (!pencilRecordPoints.length) {
		return null;
	}

	const colorIndex = getColorIndex(tabId, pixelColor);
	const frameIndex = getFrameIndex(tabId, frameId);
	return [toolType, colorIndex, frameIndex, pixelSize, [...pencilRecordPoints]];
};

const makeEraserRecord = (
	payload: RecordMessagePayload,
): EraserRecord | null => {
	const { tabId, frameId, toolType, pixelSize } = payload;

	if (!eraserRecordPoints.length) {
		return null;
	}

	const frameIndex = getFrameIndex(tabId, frameId);
	return [toolType, frameIndex, pixelSize, [...eraserRecordPoints]];
};

const makeLineRecord = (payload: RecordMessagePayload): LineRecord | null => {
	const {
		tabId,
		frameId,
		toolType,
		lineStartPosition,
		lineEndPosition,
		pixelColor,
		pixelSize,
	} = payload;

	if (!lineStartPosition || !lineEndPosition) {
		return null;
	}

	const colorIndex = getColorIndex(tabId, pixelColor);
	const frameIndex = getFrameIndex(tabId, frameId);
	return [
		toolType,
		colorIndex,
		frameIndex,
		pixelSize,
		[
			[lineStartPosition.x, lineStartPosition.y],
			[lineEndPosition.x, lineEndPosition.y],
		],
	];
};

const makeSquareRecord = (
	payload: RecordMessagePayload,
): SquareRecord | null => {
	const {
		tabId,
		frameId,
		toolType,
		squareStartPosition,
		squareEndPosition,
		pixelColor,
		pixelSize,
	} = payload;

	if (!squareStartPosition || !squareEndPosition) {
		return null;
	}

	const colorIndex = getColorIndex(tabId, pixelColor);
	const frameIndex = getFrameIndex(tabId, frameId);
	return [
		toolType,
		colorIndex,
		frameIndex,
		pixelSize,
		[
			[squareStartPosition.x, squareStartPosition.y],
			[squareEndPosition.x, squareEndPosition.y],
		],
	];
};

const makeCircleRecord = (
	payload: RecordMessagePayload,
): CircleRecord | null => {
	const {
		tabId,
		frameId,
		toolType,
		circleStartPosition,
		circleEndPosition,
		pixelColor,
		pixelSize,
	} = payload;

	if (!circleStartPosition || !circleEndPosition) {
		return null;
	}

	const colorIndex = getColorIndex(tabId, pixelColor);
	const frameIndex = getFrameIndex(tabId, frameId);
	return [
		toolType,
		colorIndex,
		frameIndex,
		pixelSize,
		[
			[circleStartPosition.x, circleStartPosition.y],
			[circleEndPosition.x, circleEndPosition.y],
		],
	];
};

const makeBucketRecord = (
	payload: RecordMessagePayload,
): BucketRecord | null => {
	const { tabId, frameId, toolType, pixelColor, pixelSize, position } = payload;

	if (!position) return null;

	const colorIndex = getColorIndex(tabId, pixelColor);
	const frameIndex = getFrameIndex(tabId, frameId);
	return [
		toolType,
		colorIndex,
		frameIndex,
		pixelSize,
		[position.x, position.y],
	];
};

const makeBroomRecord = (): BroomRecord => {
	return [ToolTypeEnum.Broom];
};

const updatePencilPointsRecord = (position: Position) => {
	let saveAsNewPoint = true;

	pencilRecordPoints = [...pencilRecordPoints].map((point) => {
		const [x, y, drawCounts] = point;

		if (position.x === x && position.y === y) {
			saveAsNewPoint = false;
			return [x, y, drawCounts + 1];
		}
		return point;
	});

	if (saveAsNewPoint) {
		pencilRecordPoints.push([position.x, position.y, 1]);
	}
};

const updateEraserPointsRecord = (position: Position) => {
	let saveAsNewPoint = true;

	eraserRecordPoints = [...eraserRecordPoints].map((point) => {
		const [x, y] = point;

		if (position.x === x && position.y === y) {
			saveAsNewPoint = false;
			return [x, y];
		}
		return point;
	});

	if (saveAsNewPoint) {
		eraserRecordPoints.push([position.x, position.y]);
	}
};

export const updatePointsRecord = (
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

export const getUndoAndRedoStack = (tabId: string) => {
	return (
		records[tabId] ?? {
			undoStack: [],
			redoStack: [],
			framesIndex: [],
		}
	);
};

export const record = (payload: RecordMessagePayload) => {
	const { tabId, toolType } = payload;
	let record: OpRecord | null = null;

	switch (toolType) {
		case ToolTypeEnum.Pencil:
			record = makePencilRecord(payload);
			break;
		case ToolTypeEnum.Eraser:
			record = makeEraserRecord(payload);
			break;
		case ToolTypeEnum.Line:
			record = makeLineRecord(payload);
			break;
		case ToolTypeEnum.Square:
			record = makeSquareRecord(payload);
			break;
		case ToolTypeEnum.Circle:
			record = makeCircleRecord(payload);
			break;
		case ToolTypeEnum.Ellipse:
			record = makeCircleRecord(payload);
			break;
		case ToolTypeEnum.Bucket:
			record = makeBucketRecord(payload);
			break;
		case ToolTypeEnum.Broom:
			record = makeBroomRecord();
			break;
	}

	clearRecordPoints();

	if (!record) return;

	if (!records[tabId]) {
		initRecords(tabId);
	}

	// Redo stack represents a possible future. If a new record occurs, that future is no longer valid — like a time paradox.
	records[tabId].redoStack.length = 0;
	records[tabId].undoStack.push(record);
};
