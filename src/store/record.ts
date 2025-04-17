import { type Position, type Records, ToolTypeEnum } from "@/types";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import { useCanvasStore } from "./canvas";
import { useConfigStore } from "./config";

export const useRecordsStore = defineStore("record", () => {
	const records = ref<Records>({});

	const configStore = useConfigStore();
	const { pixelColor, pixelSize, toolType } = storeToRefs(configStore);

	const canvasStore = useCanvasStore();
	const { currentTabId } = storeToRefs(canvasStore);

	const setRecord = (_: { position: Position }) => {
		const tabId = currentTabId.value;

		if (!tabId) return;

		let saveAsNewRecord = true;

		switch (toolType.value) {
			case ToolTypeEnum.Pencil: {
				records.value = {
					...records.value,
					[tabId]: (records.value[tabId] ?? []).map((record) => {
						const [tool, color, size, points] = record;

						const newPoints = points.map((point) => {
							const [x, y, drawCounts] = point;

							if (
								tool === ToolTypeEnum.Pencil &&
								color === pixelColor.value &&
								size === pixelSize.value &&
								x === _.position.x &&
								y === _.position.y
							) {
								saveAsNewRecord = false;
								return [x, y, drawCounts + 1] as [number, number, number];
							}
							return point;
						});

						return [tool, color, size, newPoints];
					}),
				};

				if (saveAsNewRecord) {
					records.value = {
						...records.value,
						[tabId]: [
							...(records.value[tabId] ?? []),
							[
								toolType.value,
								pixelColor.value,
								pixelSize.value,
								[[_.position.x, _.position.y, 1]],
							],
						],
					};
				}

				break;
			}
		}
	};

	return {
		records,
		setRecord,
	};
});
