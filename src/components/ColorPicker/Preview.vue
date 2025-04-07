<script setup lang="ts">
import AddIcon from "@/assets/icons/add.svg";
import { PixelBorderPrimary, PixelBorderTertiary } from "@/components";
import { useColorPickerStore } from "@/store";
import { storeToRefs } from "pinia";

const colorPickerStore = useColorPickerStore();
const { pickedColor, tintAndShade } = storeToRefs(colorPickerStore);
</script>
<template>
  <div class='flex items-center mt-2'>
    <div class="relative w-full h-full">
      <PixelBorderTertiary
        :style='{ background: pickedColor }'
        :border-left-top-color='tintAndShade.tint'
        :border-right-bottom-color='tintAndShade.shade'
        class='!absolute inset-0 !w-full !h-[25px] z-2'
      >
      </PixelBorderTertiary>
      <PixelBorderPrimary class='!absolute inset-0 !w-full !h-[25px] z-1'>
        <div class="!w-full !h-[25px] bg-[url(@/assets/alpha-background.png)] bg-cover"></div>
      </PixelBorderPrimary>
    </div>
    <AddIcon @click='() => colorPickerStore.updatePickedPalette(pickedColor)' class='w-6 h-6 cursor-pointer' />
  </div>
</template>