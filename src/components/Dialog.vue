<script setup lang="ts">
import { PixelBorderSecondary } from "./PixelBorder";

interface Props {
	visible: boolean;
	title: string;
	width: string;
	height: string;
}

const props = defineProps<Props>();
</script>
<template>
  <teleport v-if='visible' to='body'>
    <div class='absolute z-[9999] top-0 left-0 right-0 bottom-0 flex justify-center items-center'>
      <PixelBorderSecondary
        :wrapper-width="width"
        :wrapper-height="height"
        content-cls="bg-[#6e8f8b] flex flex-col justify-between p-2.5"
        background='bg-[#6e8f8b]'
      >
        <div class='text-sm'>{{ props.title }}</div>
        <div>
          <slot />
        </div>
      </PixelBorderSecondary>
    </div>
  </teleport>
</template>