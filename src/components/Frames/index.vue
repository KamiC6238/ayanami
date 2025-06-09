<script setup lang="ts">
import ActiveFrameIcon from "@/assets/icons/active-frame.svg";
import AddFrameIcon from "@/assets/icons/add-frame.svg";
import PauseIcon from "@/assets/icons/pause.svg";
import PlayFirstIcon from "@/assets/icons/play-first.svg";
import PlayLastIcon from "@/assets/icons/play-last.svg";
import PlayNextIcon from "@/assets/icons/play-next.svg";
import PlayPrevIcon from "@/assets/icons/play-prev.svg";
import PlayIcon from "@/assets/icons/play.svg";
import { useFramesStore } from "@/store";
import { storeToRefs } from "pinia";
import { PixelBorderSecondary, PixelBorderUltimate } from "../PixelBorder";
import Frame from "./frame.vue";

const framesStore = useFramesStore();
const { frames, currentFrameId, isFramesPlaying } = storeToRefs(framesStore);

const frameIcons = [
	PlayFirstIcon,
	PlayPrevIcon,
	PlayIcon,
	PlayNextIcon,
	PlayLastIcon,
];

const getIcon = (icon: string) => {
	if (icon === PlayIcon) {
		return isFramesPlaying.value ? PauseIcon : PlayIcon;
	}
	return icon;
};

const getFirstFrameId = () => {
	return Object.keys(frames.value)[0];
};

const getLastFrameId = () => {
	const frameIds = Object.keys(frames.value);
	return frameIds[frameIds.length - 1];
};

const getCurrentFrameIndex = () => {
	const frameIds = Object.keys(frames.value);
	return frameIds.indexOf(currentFrameId.value);
};

const getPrevFrameId = (currentIndex: number) => {
	const frameIds = Object.keys(frames.value);
	return currentIndex === 0
		? frameIds[frameIds.length - 1]
		: frameIds[currentIndex - 1];
};

const getNextFrameId = (currentIndex: number) => {
	const frameIds = Object.keys(frames.value);
	return currentIndex === frameIds.length - 1
		? frameIds[0]
		: frameIds[currentIndex + 1];
};

const onFramesActionsHandler = (icon: string) => {
	switch (icon) {
		case PlayFirstIcon: {
			const frameId = getFirstFrameId();
			framesStore.onFrameAction("switchFrame", { frameId });
			break;
		}
		case PlayPrevIcon: {
			const currentIndex = getCurrentFrameIndex();
			const prevFrameId = getPrevFrameId(currentIndex);
			framesStore.onFrameAction("switchFrame", { frameId: prevFrameId });
			break;
		}
		case PlayIcon:
			framesStore.setIsFramesPlaying(!isFramesPlaying.value);
			break;
		case PlayNextIcon: {
			const currentIndex = getCurrentFrameIndex();
			const nextFrameId = getNextFrameId(currentIndex);
			framesStore.onFrameAction("switchFrame", { frameId: nextFrameId });
			break;
		}
		case PlayLastIcon: {
			const frameId = getLastFrameId();
			framesStore.onFrameAction("switchFrame", { frameId });
			break;
		}
	}

	if (icon !== PlayIcon) {
		framesStore.setIsFramesPlaying(false);
	}
};
</script>
<template>
  <div class='h-[600px] mr-2'>
    <PixelBorderSecondary
      wrapper-cls='mb-2.5'
      wrapper-height='h-[53px]'
      background='bg-[#6e8f8b]'
    >
      <div class='flex justify-center items-center'>
        <PixelBorderUltimate
          v-for='(icon, index) in frameIcons'
          :key='index'
          @click='() => onFramesActionsHandler(icon)'
        >
          <component :is="getIcon(icon)" class='w-6 h-6' />
        </PixelBorderUltimate>
        <PixelBorderUltimate
          class='w-8.5 h-8.5 ml-2.5'
          @click='() => framesStore.onFrameAction("createFrame")'
        >
          <AddFrameIcon class='w-6 h-6' />
        </PixelBorderUltimate>
      </div>
    </PixelBorderSecondary>
    <PixelBorderSecondary
      wrapper-width='w-[240px]'
      wrapper-height='h-[536px]'
      content-cls='flex flex-col items-center pt-2.5 pb-2.5'
      background='bg-[#6e8f8b]'
    >
      <div v-for='frameId of Object.keys(frames)' class='relative' :key='frameId'>
        <Frame
          class='mb-2'
          :snapshot='frames[frameId].snapshot ?? ""'
          :active='currentFrameId === frameId'
          :enable-delete='Object.keys(frames).length > 1'
          @click='() => framesStore.onFrameAction("switchFrame", { frameId })'
          @delete='() => framesStore.onFrameAction("deleteFrame", { frameId })'
          @copy='() => framesStore.onFrameAction("copyFrame", { frameId })'
        >
        </Frame>
        <ActiveFrameIcon
          v-show='currentFrameId === frameId'
          class='w-8 h-8 absolute top-[50%] left-[-35px] translate-y-[-50%]'
        />
      </div>
    </PixelBorderSecondary>
  </div>
</template>