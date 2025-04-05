<script setup lang="ts">
import { useColorPickerStore } from "@/store";
import { calculateAlpha, getMouse$ } from "@/utils";
import { storeToRefs } from "pinia";
import type { Subscription } from "rxjs";
import {
	type CSSProperties,
	computed,
	onBeforeUnmount,
	onMounted,
	ref,
	useTemplateRef,
} from "vue";

const isDragging = ref(false);
const mouse$ = ref<Subscription | null>(null);

const alphaRef = useTemplateRef("alphaRef");

const colorPickerStore = useColorPickerStore();
const { rgb, alpha, previewColor } = storeToRefs(colorPickerStore);

const indicatorStyle = computed<CSSProperties>(() => {
	return {
		left: `${alpha.value * 100}%`,
		background: previewColor.value,
	};
});

const alphaGradientStyle = computed<CSSProperties>(() => {
	const { r, g, b } = rgb.value;
	const tmp = `${r}, ${g}, ${b}`;

	return {
		background: `linear-gradient(90deg, rgba(${tmp}, 0), rgb(${tmp}))`,
	};
});

onMounted(() => initMouse$());

onBeforeUnmount(() => mouse$.value?.unsubscribe());

const initMouse$ = () => {
	if (!alphaRef.value) return;

	const mousedown = (e: MouseEvent) => {
		isDragging.value = true;
		setAlpha(e);
	};

	const mousemove = (e: MouseEvent) => {
		if (!isDragging.value) return;
		setAlpha(e);
	};

	mouse$.value = getMouse$({
		alphaRef: {
			el: alphaRef.value as HTMLDivElement,
			mousedown,
			mousemove,
			mouseup: (e) => setAlpha(e),
		},
		doc: {
			el: document,
			mousemove,
			mouseup: () => {
				isDragging.value = false;
			},
		},
	}).subscribe();
};

const setAlpha = (e: MouseEvent) => {
	if (alphaRef.value) {
		colorPickerStore.setAlpha(
			calculateAlpha(e, alphaRef.value as HTMLDivElement),
		);
	}
};
</script>
<template>
  <div class="relative w-full">
    <div class="absolute w-full h-[15px] bg-[url(@/assets/alpha-background.png)] bg-cover z-[-1]"></div>
    <div class="box-border h-[15px] cursor-pointer" ref="alphaRef" :style="alphaGradientStyle">
      <div
        class="alpha__indicator absolute w-[5px] h-[5px] border-1 border-solid border-white rounded-full cursor-pointer"
        :style="indicatorStyle"
      />
    </div>
  </div>
</template>
<style scoped>
.alpha__indicator {
  top: 50%;
  transform: translate(-53%, -50%);
}
</style>