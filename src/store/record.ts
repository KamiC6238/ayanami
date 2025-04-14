import type { RecordConfig } from "@/types";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import { useCanvasStore } from "./canvas";

interface OperationRecords {
	[tabId: string]: Array<RecordConfig>;
}

export const useOperationRecordStore = defineStore("record", () => {
	const operationRecords = ref<OperationRecords>({});

	const canvasStore = useCanvasStore();
	const { currentTabId } = storeToRefs(canvasStore);

	const setRecord = (record: RecordConfig) => {
		const records = operationRecords.value;
		const tabId = currentTabId.value;

		operationRecords.value = {
			...records,
			[tabId]: [...records[tabId], record],
		};
	};

	return {
		operationRecords,
		setRecord,
	};
});
