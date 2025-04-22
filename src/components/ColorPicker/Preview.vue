<script setup lang="ts">
import { PixelBorderPrimary, PixelBorderTertiary } from "@/components";
import { useColorPickerStore } from "@/store";
import { storeToRefs } from "pinia";

const colorPickerStore = useColorPickerStore();
const { pickedColor, tintAndShade } = storeToRefs(colorPickerStore);
</script>
<template>
  <div class='flex items-center mt-2 w-full h-7.5 cursor-pointer'>
    <div class="relative w-full h-full">
      <PixelBorderTertiary
        :color='pickedColor'
        :style='{ background: pickedColor }'
        :tint='tintAndShade.tint'
        :shade='tintAndShade.shade'
        class='!absolute inset-0 !w-full !h-[25px] z-2'
        @click='() => colorPickerStore.updatePickedPalette(pickedColor)'
      >
      </PixelBorderTertiary>
      <PixelBorderPrimary class='!absolute inset-0 !w-full !h-[25px] z-1'>
        <div class="!w-full !h-[25px] bg-[url(@/assets/alpha-background.png)] bg-cover"></div>
      </PixelBorderPrimary>
    </div>
  </div>
</template>