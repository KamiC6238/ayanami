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
  <div class="alpha">
    <div class="alpha__background"></div>
    <div class="alpha__gradient" ref="alphaRef" :style="alphaGradientStyle">
      <div class="alpha__indicator" :style="indicatorStyle" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.alpha {
  position: relative;
  width: 100%;
  margin-top: 5px;
  margin-bottom: 5px;
  &__background {
    position: absolute;
    width: 100%;
    height: 20px;
    background-image: url('@/assets/alpha-background.svg');
    z-index: -1;
  }
  &__gradient {
    border: 2px solid black;
    box-sizing: border-box;
    height: 20px;
    cursor: pointer;
  }
  &__indicator {
    position: absolute;
    width: 5px;
    height: 5px;
    border: 1px solid white;
    border-radius: 100%;
    top: 50%;
    transform: translate(-53%, -50%);
    cursor: pointer;
  }
}
</style>