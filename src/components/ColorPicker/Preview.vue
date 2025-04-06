<script setup lang="ts">
import AddIcon from "@/assets/icons/add.svg";
import { PixelBorder } from "@/components";
import { useColorPickerStore } from "@/store";
import { storeToRefs } from "pinia";

const colorPickerStore = useColorPickerStore();
const { pickedColor } = storeToRefs(colorPickerStore);
</script>
<template>
  <div class='flex items-center mt-2'>
    <div class="relative w-full h-full">
      <PixelBorder
        :style='{ background: pickedColor }'
        class='!absolute inset-0 !w-full !h-[25px] z-2'
      >
      </PixelBorder>
      <PixelBorder class='!absolute inset-0 !w-full !h-[25px] z-1'>
        <div class="!w-full !h-[25px] bg-[url(@/assets/alpha-background.png)] bg-cover"></div>
      </PixelBorder>
    </div>
    <AddIcon @click='() => colorPickerStore.setPickedPalette(pickedColor)' class='w-6 h-6 cursor-pointer' />
  </div>
</template>