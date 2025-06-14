<script setup lang="ts">
import RangeInput from "@/components/RangeInput.vue";
import { MAX_SCALE } from "@/constants";

defineProps<{
	value: number;
}>();

const emit = defineEmits<(e: "scale-change", scale: number) => void>();

const onScaleChange = (e: Event) => {
	const scale = Number((e.target as HTMLInputElement).value);
	emit("scale-change", scale);
};
</script>
<template>
  <RangeInput
    class='ml-4'
    :value="value"
    :min="32"
    :max="MAX_SCALE"
    :step="32"
    unit="px (Scale)"
    @value-change="onScaleChange"
  />
</template>