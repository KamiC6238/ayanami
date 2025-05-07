import { DEFAULT_PIXEL_SIZE } from "@/constants";
import { useCanvasStore } from "@/store";
import { type Position, ToolTypeEnum } from "@/types";
import { getPixelPosition } from "@/utils";

interface PointsDisconnected {
	position: Position | null;
	prePosition: Position | null;
}

export function useToolsCommon() {
	const canvasStore = useCanvasStore();

	const getMousePosition = (event: MouseEvent, pixelSize?: number) => {
		const canvas = canvasStore.getCanvas("preview");
		if (!canvas) return;

		return getPixelPosition(canvas, event, pixelSize);
	};

	const _pointsDisconnectedHandler = (
		toolType: ToolTypeEnum,
		config: PointsDisconnected,
	) => {
		const { position, prePosition } = config;
		if (!position || !prePosition) return;

		const { x: curX, y: curY } = position;
		const { x: preX, y: preY } = prePosition;

		if (
			Math.abs(curX - preX) > DEFAULT_PIXEL_SIZE ||
			Math.abs(curY - preY) > DEFAULT_PIXEL_SIZE
		) {
			canvasStore.drawLine({
				toolType,
				canvasType: "main",
				lineStartPosition: { ...position },
				lineEndPosition: { ...prePosition },
			});
		}
	};

	const drawLineIfPointsDisconnected = (
		position: Position | null,
		prePosition: Position | null,
	) => {
		_pointsDisconnectedHandler(ToolTypeEnum.Pencil, {
			position,
			prePosition,
		});
	};

	const eraseLineIfPointsDisconnected = (
		position: Position | null,
		prePosition: Position | null,
	) => {
		_pointsDisconnectedHandler(ToolTypeEnum.Eraser, {
			position,
			prePosition,
		});
	};

	return {
		getMousePosition,
		drawLineIfPointsDisconnected,
		eraseLineIfPointsDisconnected,
	};
}
