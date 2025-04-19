import type { Record, Records } from "@/types";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import { useCanvasStore } from "./canvas";

export const useRecordsStore = defineStore("record", () => {
	const records = ref<Records>({});

	const canvasStore = useCanvasStore();
	const { currentTabId } = storeToRefs(canvasStore);

	const setRecord = (record: Record) => {
		const tabId = currentTabId.value;

		if (!tabId) return;

		if (records.value[tabId]) {
			records.value[tabId].push(record);
		} else {
			records.value[tabId] = [record];
		}
	};

	return {
		records,
		setRecord,
	};
});
