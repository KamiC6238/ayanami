<script setup lang="ts">
import RangeInput from "@/components/RangeInput.vue";
import {
	DEFAULT_PIXEL_SIZE,
	STORAGE_KEY_FOR_LAST_USED_PIXEL_SIZE,
} from "@/constants";
import { useConfigStore } from "@/store";
import { useLocalStorage } from "@vueuse/core";
import { onMounted } from "vue";

const configStore = useConfigStore();
const storage = useLocalStorage(STORAGE_KEY_FOR_LAST_USED_PIXEL_SIZE, 5);

onMounted(() => {
	configStore.setPixelSize(storage.value);
});

const onPixelSizeChange = (e: Event) => {
	const pixelSize = Number((e.target as HTMLInputElement).value);
	configStore.setPixelSize(pixelSize);
	storage.value = pixelSize;
};
</script>
<template>
  <RangeInput
    :min="DEFAULT_PIXEL_SIZE"
    :max="100"
    :value="configStore.pixelSize"
    :step="DEFAULT_PIXEL_SIZE"
    unit="px"
    @value-change="onPixelSizeChange"
  />
</template>
