import { type Record, type Records, ToolTypeEnum } from "@/types";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import { useCanvasStore } from "./canvas";
import { useConfigStore } from "./config";

export const useRecordsStore = defineStore("record", () => {
	const records = ref<Records>({});

	const configStore = useConfigStore();
	const { toolType } = storeToRefs(configStore);

	const canvasStore = useCanvasStore();
	const { currentTabId } = storeToRefs(canvasStore);

	const setRecord = (record: Record) => {
		const tabId = currentTabId.value;

		if (!tabId) return;

		switch (toolType.value) {
			case ToolTypeEnum.Pencil: {
				if (records.value[tabId]) {
					records.value[tabId].push(record);
				} else {
					records.value[tabId] = [record];
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
