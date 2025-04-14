import type { RecordConfig } from "@/types";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";

interface OperationRecords {
	[tabId: string]: RecordConfig;
}

export const useOperationRecordStore = defineStore("record", () => {
	const operationRecords = ref<OperationRecords>({});

	return {};
});
