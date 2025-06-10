<script setup lang="ts">
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
      <div
        v-show='displayFrameAction && enableDelete'
        class='absolute top-0 right-0 cursor-pointer text-[10px]'
        @click.stop='emit("delete")'
      >del
      </div>
      <div
        v-show='displayFrameAction'
        class='absolute bottom-0 right-0 cursor-pointer text-[10px]'
        @click.stop='emit("copy")'
      >copy
      </div>
    </div>
  </PixelBorderSecondary>
</template>