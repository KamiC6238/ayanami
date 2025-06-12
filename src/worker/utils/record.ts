import type {
	BroomRecord,
	BucketRecord,
	CanvasType,
	CircleRecord,
	CopyFrameRecord,
	CreateFrameRecord,
	DeleteFrameRecord,
	EraserRecord,
	LineRecord,
	OpRecord,
	PencilRecord,
	RecordMessagePayload,
	RedoOrUndoMessagePayload,
	SquareRecord,
} from "@/types";
import { FrameTypeEnum, ToolTypeEnum } from "@/types";
import { useFrames, useRecords, useRender } from "../signals";
import * as frameUtils from "./frame";
import * as renderUtils from "./render";

interface ReplayRecordsConfig {
	tabId: string;
	canvasType?: CanvasType;
	shouldClear?: boolean;
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
	popRedoStack,
	popUndoStack,
	addRecordToRedoStack,
	getFrameId,
	checkIfFrameRecord,
	getDrawRecordsWithFrameId,
	getRedoStack,
} = useRecords();

const { resetColorPositionMap, clearVisited } = useRender();
const { getFrame, createFrame, deleteFrame, currentFrameId, tabs } =
	useFrames();

const makePencilRecord = (
	payload: RecordMessagePayload,
): PencilRecord | null => {
	const { tabId, frameId, pixelColor, pixelSize } = payload;
	const pencilRecordPoints = getPencilRecordPoints();

	if (!pencilRecordPoints.length || !pixelColor || !pixelSize) {
		return null;
	}

	const colorIndex = getColorIndex(tabId, pixelColor);
	const frameIndex = getFrameIndex(tabId, frameId);
	return [
		ToolTypeEnum.Pencil,
		frameIndex,
		colorIndex,
		pixelSize,
		[...pencilRecordPoints],
	];
};

const makeEraserRecord = (
	payload: RecordMessagePayload,
): EraserRecord | null => {
	const { tabId, frameId, pixelSize } = payload;
	const eraserRecordPoints = getEraserRecordPoints();

	if (!eraserRecordPoints.length || !pixelSize) {
		return null;
	}

	const frameIndex = getFrameIndex(tabId, frameId);
	return [ToolTypeEnum.Eraser, frameIndex, pixelSize, [...eraserRecordPoints]];
};

const makeLineRecord = (payload: RecordMessagePayload): LineRecord | null => {
	const {
		tabId,
		frameId,
		lineStartPosition,
		lineEndPosition,
		pixelColor,
		pixelSize,
	} = payload;

	if (!lineStartPosition || !lineEndPosition || !pixelColor || !pixelSize) {
		return null;
	}

	const colorIndex = getColorIndex(tabId, pixelColor);
	const frameIndex = getFrameIndex(tabId, frameId);
	return [
		ToolTypeEnum.Line,
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
		squareStartPosition,
		squareEndPosition,
		pixelColor,
		pixelSize,
	} = payload;

	if (!squareStartPosition || !squareEndPosition || !pixelColor || !pixelSize) {
		return null;
	}

	const colorIndex = getColorIndex(tabId, pixelColor);
	const frameIndex = getFrameIndex(tabId, frameId);
	return [
		ToolTypeEnum.Square,
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

	if (
		!toolType ||
		!circleStartPosition ||
		!circleEndPosition ||
		!pixelColor ||
		!pixelSize
	) {
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
	const { tabId, frameId, pixelColor, pixelSize, position } = payload;

	if (!position || !pixelColor || !pixelSize) return null;

	const colorIndex = getColorIndex(tabId, pixelColor);
	const frameIndex = getFrameIndex(tabId, frameId);
	return [
		ToolTypeEnum.Bucket,
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

const makeCreateFrameRecord = (
	payload: RecordMessagePayload,
): CreateFrameRecord | null => {
	const { tabId, frameId, prevFrameId } = payload;
	if (!prevFrameId) return null;

	const frameIndex = getFrameIndex(tabId, frameId);
	const previousFrameIndex = getFrameIndex(tabId, prevFrameId);
	return [FrameTypeEnum.Create, frameIndex, previousFrameIndex];
};

const makeDeleteFrameRecord = (
	payload: RecordMessagePayload,
): DeleteFrameRecord | null => {
	const {
		tabId,
		frameId,
		prevFrameId,
		originalIndex,
		shouldSwitchFrame,
		frameToDelete,
	} = payload;

	if (
		!prevFrameId ||
		typeof originalIndex !== "number" ||
		typeof shouldSwitchFrame !== "boolean"
	) {
		return null;
	}

	const frameIndex = getFrameIndex(tabId, frameId);
	const prevFrameIndex = getFrameIndex(tabId, prevFrameId);

	// Use the pre-captured frame information
	const sourceFrameIndex = frameToDelete?.sourceFrameId
		? getFrameIndex(tabId, frameToDelete.sourceFrameId)
		: -1;

	return [
		FrameTypeEnum.Delete,
		frameIndex,
		prevFrameIndex,
		originalIndex,
		shouldSwitchFrame,
		sourceFrameIndex,
	];
};

const makeCopyFrameRecord = (
	payload: RecordMessagePayload,
): CopyFrameRecord | null => {
	const { tabId, frameId, sourceFrameId } = payload;

	if (!tabId || !frameId || !sourceFrameId) {
		return null;
	}

	const frameIndex = getFrameIndex(tabId, frameId);
	const sourceFrameIndex = getFrameIndex(tabId, sourceFrameId);

	return [FrameTypeEnum.Copy, frameIndex, sourceFrameIndex];
};

export const record = (payload: RecordMessagePayload) => {
	const { tabId, toolType, frameType, frameId } = payload;
	let record: OpRecord | null = null;
	const type = frameType || toolType;

	switch (type) {
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
		case FrameTypeEnum.Create:
			record = makeCreateFrameRecord(payload);
			break;
		case FrameTypeEnum.Copy:
			record = makeCopyFrameRecord(payload);
			if (record && frameId) {
				const frame = getFrame(tabId, frameId);
				if (frame?.copyTimestamp) {
					record.copyTimestamp = frame.copyTimestamp;
				}
			}
			break;
		case FrameTypeEnum.Delete:
			record = makeDeleteFrameRecord(payload);
			// Save copy timestamp for copied frames
			if (record && payload.frameToDelete?.copyTimestamp) {
				record.copyTimestamp = payload.frameToDelete.copyTimestamp;
			}
			break;
	}

	clearRecordPoints();

	if (!record) return false;

	// Add timestamp to record
	record.timestamp = Date.now();

	// Redo stack represents a possible future. If a new record occurs, that future is no longer valid — like a time paradox.
	clearRedoStack(tabId);
	addRecordToUndoStack(tabId, record);
	return true;
};

const _undoRedoDrawRecord = (
	record: OpRecord,
	config: {
		tabId: string;
		frameId: string;
		isUndo: boolean;
	},
) => {
	const { tabId, frameId, isUndo } = config;

	let { frameId: _frameId, returnFrameId } = getFrameIdWhenUndoRedo(frameId, {
		tabId,
		isUndo,
		record,
	});

	if (isUndo && returnFrameId) {
		record.returnFrameId = returnFrameId;
	}

	if (isUndo) {
		addRecordToRedoStack(tabId, record);
	} else {
		addRecordToUndoStack(tabId, record);
	}

	resetColorPositionMap();
	clearVisited();

	// If need to switch to different frame, use frameUtils.switchFrame
	if (_frameId !== frameId) {
		frameUtils.switchFrame({ tabId, frameId: _frameId });
	} else {
		// If staying in same frame, manually replay using same logic as switchFrame
		const frame = getFrame(tabId, frameId);
		if (!frame) return;

		// Clear canvas
		renderUtils.clearAllPixels({ canvasType: "main" });

		// Check if it's a copied frame with copy timestamp
		if (frame.copyTimestamp && frame.sourceFrameChain) {
			// Copied frame with timestamp-based record filtering
			const { sourceFrameChain, sourceFrameTimestamps } = frame;

			// Replay drawing records from source frame chain, using different timestamp limits for each frame
			replayFrameChain(tabId, sourceFrameChain, sourceFrameTimestamps);

			// Replay current frame's own drawing records (if any)
			replayCurrentFrameRecords(tabId, frameId);
		} else {
			// Normal frame processing logic
			const { sourceFrameChain = [] } = frame;

			// Replay drawing records from source frame chain
			replayFrameChain(tabId, sourceFrameChain);

			// Replay current frame's drawing records
			replayCurrentFrameRecords(tabId, frameId);
		}

		// Generate snapshot to maintain consistency
		frameUtils.generateSnapshot({ tabId, frameId });
	}

	if (!isUndo && record.returnFrameId) {
		_frameId = record.returnFrameId;
		frameUtils.switchFrame({
			tabId,
			frameId: record.returnFrameId,
		});
	}
};

// Common function to create a copied frame with proper source frame chain and timestamp handling
const createCopiedFrame = (
	tabId: string,
	frameId: string,
	sourceFrameId: string,
	copyTimestamp: number,
) => {
	// Get source frame information
	const sourceFrame = getFrame(tabId, sourceFrameId);
	const sourceFrameChain = sourceFrame?.sourceFrameChain ?? [];

	// Check if source frame has its own drawing records
	const sourceFrameDrawRecords = getDrawRecordsWithFrameId(
		tabId,
		sourceFrameId,
	);
	const hasSourceFrameDrawRecords =
		sourceFrameDrawRecords && sourceFrameDrawRecords.length > 0;

	let newSourceFrameChain: string[] = [];
	let sourceFrameTimestamps: Record<string, number> = {};

	if (hasSourceFrameDrawRecords) {
		// Source frame has drawing records, add source frame to dependency chain
		newSourceFrameChain = [...sourceFrameChain, sourceFrameId];

		// Inherit timestamp limits from source frame
		sourceFrameTimestamps = { ...sourceFrame?.sourceFrameTimestamps };

		// Set timestamp limits for each frame in dependency chain
		for (const chainFrameId of sourceFrameChain) {
			if (!sourceFrameTimestamps[chainFrameId]) {
				sourceFrameTimestamps[chainFrameId] = copyTimestamp;
			}
		}

		// Set timestamp limit for source frame
		sourceFrameTimestamps[sourceFrameId] = copyTimestamp;
	} else {
		// Source frame has no drawing records (pure copied frame), inherit its dependency chain and timestamp constraints
		newSourceFrameChain = sourceFrameChain;
		// Directly inherit timestamp limits from source frame
		sourceFrameTimestamps = { ...sourceFrame?.sourceFrameTimestamps };
	}

	// Create frame with complete copied frame configuration
	createFrame(tabId, {
		frameId,
		isCopiedFrame: true,
		sourceFrameId,
		sourceFrameChain: newSourceFrameChain,
		copyTimestamp: copyTimestamp,
		sourceFrameTimestamps: sourceFrameTimestamps,
	});
};

const _undoRedoFrameRecord = (
	record: OpRecord,
	config: {
		tabId: string;
		isUndo: boolean;
	},
) => {
	const { tabId, isUndo } = config;
	const [
		frameType,
		frameIndex,
		prevFrameIndex,
		originalIndex,
		shouldSwitchFrame,
	] = record;

	const _undoCreateFrame = () => {
		const prevFrameId = getFrameId(tabId, prevFrameIndex);
		const frameId = getFrameId(tabId, frameIndex);
		deleteFrame(tabId, frameId);
		frameUtils.switchFrame({ tabId, frameId: prevFrameId });
	};

	const _redoCreateFrame = () => {
		const frameId = getFrameId(tabId, frameIndex);
		createFrame(tabId, { frameId });
		frameUtils.switchFrame({ tabId, frameId });
	};

	const _undoDeleteFrame = () => {
		const frameId = getFrameId(tabId, frameIndex);
		const _currentFrameId = currentFrameId();
		const [, , , , , sourceFrameIndex] = record as DeleteFrameRecord;

		if (sourceFrameIndex !== -1) {
			// This was a copied frame, recreate it using the common function
			const sourceFrameId = getFrameId(tabId, sourceFrameIndex);
			const copyTimestamp = record.copyTimestamp || Date.now();

			createCopiedFrame(tabId, frameId, sourceFrameId, copyTimestamp);
		} else {
			// This was a regular frame
			createFrame(tabId, { frameId });
		}

		/**
		 * if the originalIndex is valid, it means the frame which is deleted is in the middle of the frames,
		 * so we need to reorder the frames to keep the order of the frames
		 */
		if (typeof originalIndex === "number" && originalIndex >= 0) {
			frameUtils.reorderFrame({ tabId, frameId, targetIndex: originalIndex });
		}

		frameUtils.switchFrame({ tabId, frameId });

		/**
		 * if shouldSwitchFrame is false,
		 * it means the frame which is deleted is not the current frame before the delete operation,
		 * so after the delete operation, we need to switch back to the current frame before the delete operation
		 */
		if (!shouldSwitchFrame) {
			frameUtils.switchFrame({ tabId, frameId: _currentFrameId });
		}
	};

	const _redoDeleteFrame = () => {
		const frameId = getFrameId(tabId, frameIndex);
		const prevFrameId = getFrameId(tabId, prevFrameIndex);
		deleteFrame(tabId, frameId);
		frameUtils.switchFrame({ tabId, frameId: prevFrameId });
	};

	const _undoCopyFrame = () => {
		const frameId = getFrameId(tabId, frameIndex);
		const [, , sourceFrameIndex] = record as CopyFrameRecord;
		const sourceFrameId = getFrameId(tabId, sourceFrameIndex);

		deleteFrame(tabId, frameId);
		frameUtils.switchFrame({ tabId, frameId: sourceFrameId });
	};

	const _redoCopyFrame = () => {
		const frameId = getFrameId(tabId, frameIndex);
		const [, , sourceFrameIndex] = record as CopyFrameRecord;
		const sourceFrameId = getFrameId(tabId, sourceFrameIndex);

		// Use copy timestamp saved in record, fallback to current time if not available
		const copyTimestamp = record.copyTimestamp || Date.now();

		// Create copied frame using the common function
		createCopiedFrame(tabId, frameId, sourceFrameId, copyTimestamp);

		// Reorder: move new frame to position after source frame
		// Use same logic as normal copyFrame - get current frame order from frames object
		const frames = tabs()[tabId]?.frames;
		if (frames) {
			const frameIds = Object.keys(frames);
			const sourcePosition = frameIds.findIndex(
				(id: string) => id === sourceFrameId,
			);

			if (sourcePosition !== -1) {
				// Move new frame to position after source frame
				const targetIndex = sourcePosition + 1;
				frameUtils.reorderFrame({ tabId, frameId, targetIndex });
			}
		}

		frameUtils.switchFrame({
			tabId,
			frameId,
			sourceFrameId,
		});
	};

	isUndo
		? addRecordToRedoStack(tabId, record)
		: addRecordToUndoStack(tabId, record);

	switch (frameType) {
		case FrameTypeEnum.Create:
			isUndo ? _undoCreateFrame() : _redoCreateFrame();
			break;
		case FrameTypeEnum.Delete:
			isUndo ? _undoDeleteFrame() : _redoDeleteFrame();
			break;
		case FrameTypeEnum.Copy:
			isUndo ? _undoCopyFrame() : _redoCopyFrame();
			break;
	}
};

const _undoRedo = (
	payload: RedoOrUndoMessagePayload,
	config: {
		isUndo: boolean;
	},
) => {
	const { isUndo } = config;
	const { tabId, frameId } = payload;
	const record = isUndo ? popUndoStack(tabId) : popRedoStack(tabId);
	if (!record) return;

	const common = { tabId, frameId, isUndo };

	if (checkIfFrameRecord(record)) {
		_undoRedoFrameRecord(record, common);
	} else {
		_undoRedoDrawRecord(record, common);
	}
};

export const redo = (payload: RedoOrUndoMessagePayload) => {
	_undoRedo(payload, { isUndo: false });
};

export const undo = (payload: RedoOrUndoMessagePayload) => {
	_undoRedo(payload, { isUndo: true });
};

// Helper function to replay individual frame records
const replayCurrentFrameRecords = (tabId: string, frameId: string) => {
	const currentFrameDrawRecords = getDrawRecordsWithFrameId(tabId, frameId);
	replayDrawRecords(currentFrameDrawRecords, { tabId, shouldClear: false });
};

// Replay drawing records from frame chain (exported for use by other modules)
export const replayFrameChain = (
	tabId: string,
	frameChain: string[],
	timestampLimits?: Record<string, number>,
	fallbackTimestamp?: number,
) => {
	let isFirstReplay = true;
	for (const chainFrameId of frameChain) {
		const chainDrawRecords = getDrawRecordsWithFrameId(tabId, chainFrameId);

		// Filter records if timestamp limits exist
		let filteredRecords = chainDrawRecords;
		if (timestampLimits || fallbackTimestamp) {
			const timestampLimit =
				timestampLimits?.[chainFrameId] || fallbackTimestamp;
			if (timestampLimit) {
				filteredRecords =
					chainDrawRecords?.filter(
						(record) => !record.timestamp || record.timestamp <= timestampLimit,
					) || [];
			}
		}

		replayDrawRecords(filteredRecords, { tabId, shouldClear: isFirstReplay });
		isFirstReplay = false;
	}
	return !isFirstReplay; // Return whether canvas has been cleared
};

// Replay drawing records of individual frame (exported for use by other modules)
export const replayFrameRecords = (
	tabId: string,
	frameId: string,
	shouldClear: boolean,
) => {
	const frameDrawRecords = getDrawRecordsWithFrameId(tabId, frameId);
	replayDrawRecords(frameDrawRecords, { tabId, shouldClear });
};

export const replayAllRecordsFromImportFile = (tabId: string) => {
	const redoStack = getRedoStack(tabId);
	for (let i = redoStack.length - 1; i >= 0; i--) {
		const record = redoStack[i];
		const [, frameIndex] = record;

		redo({
			tabId,
			frameId: getFrameId(tabId, frameIndex),
		});
	}
};

export const replayDrawRecords = (
	records: OpRecord[],
	config: ReplayRecordsConfig,
) => {
	if (config.shouldClear !== false) {
		renderUtils.clearAllPixels({ canvasType: "main" });
	}

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
