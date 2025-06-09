<script setup lang="ts">
import CopyIcon from "@/assets/icons/copy.svg";
import TrashIcon from "@/assets/icons/trash.svg";
import type { Frame } from "@/types";
import { ref } from "vue";
import { PixelBorderSecondary } from "../PixelBorder";

const emit = defineEmits<{
	(e: "delete"): void;
	(e: "copy"): void;
}>();

defineProps<
	Frame & {
		active: boolean;
		enableDelete: boolean;
	}
>();

const displayFrameAction = ref(false);
</script>
<template>
  <PixelBorderSecondary
    wrapper-width="w-25"
    wrapper-height="h-25"
  >
    <div
      class='relative w-full h-full'
      @mouseenter='displayFrameAction = true'
      @mouseleave='displayFrameAction = false'
    >
      <img :src="snapshot" />
      <TrashIcon
        v-show='displayFrameAction && enableDelete'
        class='absolute top-0 right-0 w-4 h-4 cursor-pointer'
        @click.stop='emit("delete")'
      />
      <CopyIcon
        v-show='displayFrameAction'
        class='absolute bottom-0 right-0 w-4 h-4 cursor-pointer'
        @click.stop='emit("copy")'
      />
    </div>
  </PixelBorderSecondary>
</template>