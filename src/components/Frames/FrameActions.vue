<script setup lang="ts">
import AddFrameIcon from "@/assets/icons/add-frame.svg";
import PauseIcon from "@/assets/icons/pause.svg";
import PlayFirstIcon from "@/assets/icons/play-first.svg";
import PlayLastIcon from "@/assets/icons/play-last.svg";
import PlayNextIcon from "@/assets/icons/play-next.svg";
import PlayPrevIcon from "@/assets/icons/play-prev.svg";
import PlayIcon from "@/assets/icons/play.svg";
import { useFramesStore } from "@/store";
import { storeToRefs } from "pinia";
import { PixelBorderUltimate } from "../PixelBorder";

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
<div class='flex justify-start items-start'>
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
</template>