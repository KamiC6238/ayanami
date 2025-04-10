<script setup lang="ts">
import {
	Canvas,
	ColorPicker,
	Palette,
	PixelBorderSecondary,
	Toolbar,
	TrafficLights,
} from "@/components";
import { generatePixelBorder } from "@/utils";
import { ColumnResizer, VerticalResizer } from "./layout";

generatePixelBorder(4, 3);
</script>

<template>
  <div class='relative w-full h-full flex items-center justify-center'>
    <div class="absolute w-full h-full bg-[#7d929e] z-[-2] bg-[#d4cbbe]"></div>
    <div class='flex w-[1000px] h-[600px]'>
      <PixelBorderSecondary
        content-cls='bg-[#7d929e] p-2.5 flex flex-col justify-between'
        background='bg-[#7d929e]'
      >
        <div class='border-b-3 border-solid border-black pb-2.5'>
          <TrafficLights />
        </div>
        <ColumnResizer class='w-full flex-1'>
          <template v-slot:left>
            <VerticalResizer class='h-full'>
              <template v-slot:top>
                <div class='w-10 h-10 pt-2.5 pb-2.5'></div>
                <Palette />
              </template>
              <template v-slot:bottom>
                <ColorPicker />
              </template>
            </VerticalResizer>
          </template>
          <template v-slot:right>
            <div class='w-10 h-10 pt-2.5 pb-2.5'></div>
            <PixelBorderSecondary wrapper-height="!h-[calc(100%-40px)]">
              <Canvas />
            </PixelBorderSecondary>
          </template>
        </ColumnResizer>
      </PixelBorderSecondary>
      <Toolbar />
    </div>
  </div>
</template>