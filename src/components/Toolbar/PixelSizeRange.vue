<script setup lang="ts">
import { DEFAULT_PIXEL_SIZE } from "@/constants";
import { useConfigStore } from "@/store";

const configStore = useConfigStore();

const onPixelSizeChange = (e: Event) => {
	configStore.setPixelSize(Number((e.target as HTMLInputElement).value));
};
</script>
<template>
  <div class='flex items-center h-10 pt-2.5 pb-2.5 text-[10px]'>
    <input
      class='custom-range'
      type="range"
      id='pixelSize'
      :min="DEFAULT_PIXEL_SIZE"
      max="100"
      :value="configStore.pixelSize"
      :step="DEFAULT_PIXEL_SIZE"
      @input="onPixelSizeChange"
    />
    <div class='relative top-[1px]'>
      <span class='ml-2'>{{ configStore.pixelSize }}</span>
      <span class='relative top-[-1.3px] ml-[2px]'>px</span>
    </div>
  </div>
</template>
<style scoped>
.custom-range {
  -webkit-appearance: none;
  width: 50px;
  height: 8px;
  background: #ccc;
  box-shadow: 1.5px 1.5px 0 #000;

}

.custom-range::-webkit-slider-runnable-track {
  height: 8px;
  background: #8c8c8c;
  border: 2px solid #000;
}

.custom-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #8c8c8c;
  cursor: pointer;
  border: 2px solid #000;
  box-shadow: 1.5px 1.5px 0 #000;
  margin-top: -6px;
}

/* Firefox */
.custom-range::-moz-range-track {
  background: #aaa;
  height: 8px;
  border: 2px solid #000;
}

/* Firefox */
.custom-range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #000;
  border: 2px solid #fff;
  cursor: pointer;
  box-shadow: 1.5px 1.5px 0 #000;
}
</style>