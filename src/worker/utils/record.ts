import type {
	BroomRecord,
	BucketRecord,
	CanvasType,
	CircleRecord,
	EraserRecord,
	LineRecord,
	OpRecord,
	PencilRecord,
	RecordMessagePayload,
	RedoOrUndoMessagePayload,
	SquareRecord,
} from "@/types";
import { ToolTypeEnum } from "@/types";
import { useRecords, useRender } from "../signals";
import * as frameUtils from "./frame";
import * as renderUtils from "./render";

interface ReplayRecordsConfig {
	tabId: string;
	canvasType?: CanvasType;
}

const {
	getColor,
	getColorIndex,
	getFrameIndex,
	getFrameIdWhenUndoRedo,
	getPencilRecordPoints,
	getEraserRecordPoints,
	addRecordToUndoStack,
	clearRedoStack,
	clearRecordPoints,
	getRecordsWithFrameId,
	popRedoStack,
	popUndoStack,
	addRecordToRedoStack,
} = useRecords();

const { resetColorPositionMap, clearVisited } = useRender();

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
	return [toolType, frameIndex, colorIndex, pixelSize, [...pencilRecordPoints]];
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
		frameIndex,
		colorIndex,
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
		frameIndex,
		colorIndex,
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
		frameIndex,
		colorIndex,
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
		frameIndex,
		colorIndex,
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

	// Redo stack represents a possible future. If a new record occurs, that future is no longer valid — like a time paradox.
	clearRedoStack(tabId);
	addRecordToUndoStack(tabId, record);
	return true;
};

const _undoOrRedo = (
	payload: RedoOrUndoMessagePayload,
	config: {
		isUndo: boolean;
	},
) => {
	const { isUndo } = config;
	const { tabId, frameId } = payload;
	const record = isUndo ? popUndoStack(tabId) : popRedoStack(tabId);
	if (!record) return;

	let _frameId = getFrameIdWhenUndoRedo(frameId, { tabId, isUndo, record });

	if (isUndo) {
		addRecordToRedoStack(tabId, record);
	} else {
		addRecordToUndoStack(tabId, record);
	}

	resetColorPositionMap();
	clearVisited();
	replayRecords(getRecordsWithFrameId(tabId, _frameId), { tabId });
	frameUtils.generateSnapshot({ tabId, frameId: _frameId });

	if (!isUndo && record.returnFrameId) {
		_frameId = record.returnFrameId;
		replayRecords(getRecordsWithFrameId(tabId, _frameId), { tabId });
		frameUtils.generateSnapshot({ tabId, frameId: _frameId });
	}

	self.postMessage({
		type: "updateFrameId",
		payload: {
			tabId,
			frameId: _frameId,
		},
	});
};

export const redo = (payload: RedoOrUndoMessagePayload) => {
	_undoOrRedo(payload, { isUndo: false });
};

export const undo = (payload: RedoOrUndoMessagePayload) => {
	_undoOrRedo(payload, { isUndo: true });
};

export const replayRecords = (
	records: OpRecord[],
	config: ReplayRecordsConfig,
) => {
	renderUtils.clearAllPixels({ canvasType: "main" });

	for (const record of records) {
		const [toolType] = record;

		switch (toolType) {
			case ToolTypeEnum.Pencil:
				replayPencilRecord(record as PencilRecord, config);
				break;
			case ToolTypeEnum.Eraser:
				replayEraserRecord(record as EraserRecord, config);
				break;
			case ToolTypeEnum.Line:
				replayLineRecord(record as LineRecord, config);
				break;
			case ToolTypeEnum.Square:
				replaySquareRecord(record as SquareRecord, config);
				break;
			case ToolTypeEnum.Circle:
				replayCircleRecord(record as CircleRecord, config);
				break;
			case ToolTypeEnum.Ellipse:
				replayCircleRecord(record as CircleRecord, config);
				break;
			case ToolTypeEnum.Bucket:
				replayBucketRecord(record as BucketRecord, config);
				break;
			case ToolTypeEnum.Broom:
				replayClearAllPixelsRecord();
				break;
		}

		clearVisited();
	}
};

const replayPencilRecord = (
	record: PencilRecord,
	config: ReplayRecordsConfig,
) => {
	const [_, __, colorIndex, pixelSize, points] = record;
	const { tabId, canvasType = "main" } = config;
	for (const [x, y, drawCounts] of points) {
		for (let i = 0; i < drawCounts; i++) {
			renderUtils.fillRect({
				toolType: ToolTypeEnum.Pencil,
				position: { x, y },
				canvasType,
				pixelSize,
				pixelColor: getColor(tabId, colorIndex),
				isReplay: true,
			});
		}
	}
};

const replayEraserRecord = (
	record: EraserRecord,
	config: ReplayRecordsConfig,
) => {
	const [_, __, pixelSize, points] = record;
	const { canvasType = "main" } = config;
	for (const [x, y] of points) {
		renderUtils.clearRect({
			toolType: ToolTypeEnum.Eraser,
			position: { x, y },
			canvasType,
			pixelSize,
			isReplay: true,
		});
	}
};

const replayLineRecord = (record: LineRecord, config: ReplayRecordsConfig) => {
	const [_, __, colorIndex, pixelSize, points] = record;
	const { tabId, canvasType = "main" } = config;
	const [startPoint, endPoint] = points;
	const [startX, startY] = startPoint;
	const [endX, endY] = endPoint;

	renderUtils.drawBresenhamLine({
		toolType: ToolTypeEnum.Line,
		canvasType,
		lineStartPosition: { x: startX, y: startY },
		lineEndPosition: { x: endX, y: endY },
		pixelColor: getColor(tabId, colorIndex),
		pixelSize,
	});
};

const replaySquareRecord = (
	record: SquareRecord,
	config: ReplayRecordsConfig,
) => {
	const [_, __, colorIndex, pixelSize, points] = record;
	const { tabId, canvasType = "main" } = config;
	const [startPoint, endPoint] = points;
	const [startX, startY] = startPoint;
	const [endX, endY] = endPoint;

	renderUtils.drawSquare({
		canvasType,
		squareStartPosition: { x: startX, y: startY },
		squareEndPosition: { x: endX, y: endY },
		pixelSize,
		pixelColor: getColor(tabId, colorIndex),
	});
};

const replayCircleRecord = (
	record: CircleRecord,
	config: ReplayRecordsConfig,
) => {
	const [toolType, __, colorIndex, pixelSize, points] = record;
	const { tabId, canvasType = "main" } = config;
	const [startPoint, endPoint] = points;
	const [startX, startY] = startPoint;
	const [endX, endY] = endPoint;

	renderUtils.drawCircle({
		toolType,
		canvasType,
		circleStartPosition: { x: startX, y: startY },
		circleEndPosition: { x: endX, y: endY },
		pixelSize,
		pixelColor: getColor(tabId, colorIndex),
	});
};

const replayBucketRecord = (
	record: BucketRecord,
	config: ReplayRecordsConfig,
) => {
	const [_, __, colorIndex, pixelSize, point] = record;
	const { tabId, canvasType = "main" } = config;
	const [x, y] = point;

	renderUtils.fillBucket({
		canvasType,
		replacementColor: getColor(tabId, colorIndex),
		pixelSize,
		position: { x, y },
	});
};

const replayClearAllPixelsRecord = () => {
	renderUtils.clearAllPixels({ canvasType: "main" });
};
