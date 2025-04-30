<script setup lang="ts">
import {
	Canvas,
	ColorPicker,
	Palette,
	PixelBorderSecondary,
	SocialMedia,
	Toolbar,
	TopToolbar,
	TrafficLights,
	UndoRedo,
} from "@/components";
import { generatePixelBorder } from "@/utils";
import { ColumnResizer, VerticalResizer } from "./layout";

generatePixelBorder(4, 3);
</script>

<template>
  <div class='relative w-full h-full flex items-center justify-center'>
    <div class="absolute w-full h-full bg-[#6e8f8b] z-[-2] bg-[#d8c6a1]"></div>
    <div class='flex w-[800px] h-[600px]'>
      <PixelBorderSecondary
        content-cls='bg-[#6e8f8b] flex flex-col justify-between pt-2.5 pb-2.5 pl-2.5'
        background='bg-[#6e8f8b]'
      >
        <div class='flex justify-between border-b-3 border-solid border-black pb-2.5 mr-2.5'>
          <TrafficLights />
          <SocialMedia />
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
            <TopToolbar />
            <div class='flex w-full h-[calc(100%-40px)]'>
              <PixelBorderSecondary>
                <Canvas />
                <UndoRedo />
              </PixelBorderSecondary>
              <Toolbar />
            </div>
          </template>
        </ColumnResizer>
      </PixelBorderSecondary>
    </div>
  </div>
</template>