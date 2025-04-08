<script setup lang="ts">
import PixelBorderPrimary from "./PixelBorderPrimary.vue";
interface Props {
	contentCls?: string;
	background?: string;
}

defineProps<Props>();
</script>
<template>
  <div class="relative !w-full !h-full">
    <PixelBorderPrimary class='!absolute inset-0 z-0 !w-full !h-full bg-black' />
    <PixelBorderPrimary :class="`!w-[calc(100%-7px)] !h-[calc(100%-7px)] !absolute inset-0 z-1 ${background ?? 'bg-[#635561]'}`" />
    <div :class="`
      slot-wrapper
      absolute
      inset-0
      z-2
      w-full
      h-full
      left-1.5
      top-1.5
      ${contentCls ?? ''}
    `">
      <slot />
    </div>
  </div>
</template>
<style scoped>
.slot-wrapper {
  width: calc(100% - 19px);
  height: calc(100% - 19px);
}
</style>