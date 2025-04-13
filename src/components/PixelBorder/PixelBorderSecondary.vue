<script setup lang="ts">
import { cn } from "@/utils";
import PixelBorderPrimary from "./PixelBorderPrimary.vue";

interface Props {
	wrapperHeight?: string;
	contentCls?: string;
	background?: string;
}

defineProps<Props>();
</script>
<template>
  <div :class="cn('relative !w-full', wrapperHeight ?? '!h-full')">
    <PixelBorderPrimary class='!absolute inset-0 z-0 !w-full !h-full bg-black' />
    <PixelBorderPrimary :class="cn(
      '!w-[calc(100%-7px)] !h-[calc(100%-7px)] !absolute inset-0 z-1',
      background ?? 'bg-[#635561]'
    )" />
    <div
      :class="cn(
        'absolute inset-0 z-2 w-full h-full left-1.5 top-1.5',
        'w-[calc(100%-19px)]',
        'h-[calc(100%-19px)]',
        contentCls
      )">
      <slot />
    </div>
  </div>
</template>
