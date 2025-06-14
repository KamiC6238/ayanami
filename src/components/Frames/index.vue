<script setup lang="ts">
import { useFramesStore } from "@/store";
import { cn } from "@/utils";
import { storeToRefs } from "pinia";
import {
	type ComponentPublicInstance,
	nextTick,
	ref,
	useTemplateRef,
	watch,
} from "vue";
import { PixelBorderSecondary } from "../PixelBorder";
import Frame from "./Frame.vue";

const framesStore = useFramesStore();
const { frames, currentFrameId } = storeToRefs(framesStore);

const scrollContainerRef = useTemplateRef<HTMLElement>("scrollContainer");
const currentFrameRef = ref<HTMLElement>();

const getFrameListCls = (currentFrameId: string, frameId: string) => {
	return cn(
		"relative",
		"mb-2",
		currentFrameId === frameId &&
			"w-[105%] flex items-center justify-center bg-[#4c5d5b]",
	);
};

const scrollToCurrentFrame = () => {
	if (!scrollContainerRef.value || !currentFrameRef.value) {
		return;
	}

	const containerRect = scrollContainerRef.value.getBoundingClientRect();
	const frameRect = currentFrameRef.value.getBoundingClientRect();
	const isFullyVisible =
		frameRect.top >= containerRect.top &&
		frameRect.bottom <= containerRect.bottom;

	if (isFullyVisible) return;

	scrollContainerRef.value.scrollTo({
		top: currentFrameRef.value.offsetTop - 15,
		behavior: "smooth",
	});
};

const setCurrentFrameRef = (frameId: string) => {
	return currentFrameId.value === frameId
		? (el: Element | ComponentPublicInstance | null) => {
				currentFrameRef.value = el as HTMLElement;
			}
		: undefined;
};

const onClickFrame = (frameId: string) => {
	framesStore.onFrameAction("switchFrame", { frameId });
	scrollToCurrentFrame();
};

watch(
	currentFrameId,
	async () => {
		await nextTick();
		scrollToCurrentFrame();
	},
	{ immediate: true },
);
</script>

<template>
  <div class='relative flex items-center h-full mr-2'>
    <PixelBorderSecondary
      wrapper-width='w-[135px]'
      wrapper-height='h-[600px]'
      content-cls='flex flex-col items-center pt-2.5 pb-2.5 overflow-auto w-[calc(100%-13px)] left-[3px]'
      background='bg-[#6e8f8b]'
    >
      <div
        ref="scrollContainer"
        class="flex flex-col items-center w-full h-full overflow-auto"
      >
        <div
          v-for='frameId of Object.keys(frames)'
          :ref="setCurrentFrameRef(frameId)"
          :class='getFrameListCls(currentFrameId, frameId)'
          :key='frameId'
        >
          <Frame
            :frame-id='frameId'
            :snapshot='frames[frameId].snapshot ?? ""'
            :active='currentFrameId === frameId'
            :enable-delete='Object.keys(frames).length > 1'
            @click='onClickFrame(frameId)'
            @delete='() => framesStore.onFrameAction("deleteFrame", { frameId })'
            @copy='() => framesStore.onFrameAction("copyFrame", { frameId })'
          >
          </Frame>
        </div>
      </div>
    </PixelBorderSecondary>
  </div>
</template>