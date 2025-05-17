<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from "vue";
import { PixelBorderSecondary } from "./PixelBorder";

interface Props {
	visible: boolean;
	title: string;
	width: string;
	height: string;
}

type Emits = (event: "close") => void;

const emit = defineEmits<Emits>();
const props = defineProps<Props>();

const dialogRef = useTemplateRef("dialog");

watch(
	() => props.visible,
	(visible) => {
		if (visible) {
			nextTick(() => dialogRef.value?.focus());
		}
	},
);
</script>
<template>
  <teleport v-if='visible' to='body'>
    <div
      tabindex='0'
      ref='dialog'
      class='absolute z-[9999] top-0 left-0 right-0 bottom-0 flex justify-center items-center'
      @keydown.esc="emit('close')"
    >
      <PixelBorderSecondary
        :wrapper-width="width"
        :wrapper-height="height"
        content-cls="bg-[#6e8f8b] flex flex-col justify-between p-2.5"
        background='bg-[#6e8f8b]'
      >
        <div class='text-sm flex items-center justify-between'>
          <span>{{ title }}</span>
          <div class='cursor-pointer text-[12px]' @click="emit('close')">X</div>
        </div>
        <div>
          <slot />
        </div>
      </PixelBorderSecondary>
    </div>
  </teleport>
</template>