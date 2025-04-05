<script setup lang="ts">
import { useColorPickerStore } from "@/store";
import { storeToRefs } from "pinia";

const colorPickerStore = useColorPickerStore();
const { previewColor } = storeToRefs(colorPickerStore);
</script>
<template>
  <div class="relative w-full mt-2">
    <div class="absolute w-full h-full z-[-1] bg-[url(@/assets/alpha-background.png)] bg-cover"></div>
    <div
      :style='{ background: previewColor }'
      class="w-full h-[20px] box-border border-2 border-solid border-black"
    >
    </div>
  </div>
  <button @click='colorPickerStore.setPickedPalette(previewColor)'>add</button>
</template>