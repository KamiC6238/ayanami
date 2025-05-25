import type {
	BroomRecord,
	BucketRecord,
	CircleRecord,
	EraserRecord,
	LineRecord,
	OpRecord,
	PencilRecord,
	RecordMessagePayload,
	SquareRecord,
} from "@/types";
import { ToolTypeEnum } from "@/types";
import { useRecords } from "../signals";

const {
	getRecords,
	getColorIndex,
	getFrameIndex,
	getPencilRecordPoints,
	getEraserRecordPoints,
	initRecords,
	addRecordToUndoStack,
	clearRedoStack,
	clearRecordPoints,
} = useRecords();

const makePencilRecord = (
	payload: RecordMessagePayload,
): PencilRecord | null => {
	const { tabId, frameId, toolType, pixelColor, pixelSize } = payload;
	const pencilRecordPoints = getPencilRecordPoints();

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
	const eraserRecordPoints = getEraserRecordPoints();

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

const makeBroomRecord = (payload: RecordMessagePayload): BroomRecord => {
	const { tabId, frameId } = payload;
	const frameIndex = getFrameIndex(tabId, frameId);
	return [ToolTypeEnum.Broom, frameIndex];
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
			record = makeBroomRecord(payload);
			break;
	}

	clearRecordPoints();

	if (!record) return false;

	if (!getRecords(tabId)) {
		initRecords(tabId);
	}

	// Redo stack represents a possible future. If a new record occurs, that future is no longer valid — like a time paradox.
	clearRedoStack(tabId);
	addRecordToUndoStack(tabId, record);
	return true;
};
