<script setup lang="ts">
import AddIcon from "@/assets/icons/add.svg";
import { useColorPickerStore } from "@/store";
import { storeToRefs } from "pinia";

const colorPickerStore = useColorPickerStore();
const { pickedColor } = storeToRefs(colorPickerStore);
</script>
<template>
  <div class='flex items-center mt-2'>
    <div class="relative w-full">
      <div class="absolute w-full h-full z-[-1] bg-[url(@/assets/alpha-background.png)] bg-cover"></div>
      <div
        :style='{ background: pickedColor }'
        class="w-full h-5 box-border border-2 border-solid border-black"
      >
      </div>
    </div>
    <AddIcon @click='colorPickerStore.setPickedPalette(pickedColor)' class='w-6 h-6' />
  </div>
</template>