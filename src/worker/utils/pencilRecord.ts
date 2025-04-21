import type {
	PencilPointRecord,
	PencilRecord,
	Position,
	RecordMessagePayload,
} from "@/types";

let pencilRecordPoints: PencilPointRecord[] = [];

export const clearRecordPoints = () => {
	pencilRecordPoints.length = 0;
};

export const makePencilRecord = (
	payload: RecordMessagePayload,
): PencilRecord => {
	const { toolType, pixelColor, pixelSize } = payload;

	return [toolType, pixelColor, pixelSize, [...pencilRecordPoints]];
};

export const updatePencilPointsRecord = (position: Position) => {
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
		pencilRecordPoints.push([position.x, position.y, 1] as PencilPointRecord);
	}
};
