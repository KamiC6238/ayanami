<script setup lang="ts">
import {
	Canvas,
	ColorPicker,
	Palette,
	PixelBorderSecondary,
	Toolbar,
} from "@/components";
import { generatePixelBorder } from "@/utils";
import { ColumnResizer, VerticalResizer } from "./layout";

generatePixelBorder(4, 3);
</script>

<template>
  <div class='relative w-full h-full flex items-center justify-center'>
    <div class="absolute w-full h-full bg-[#7d929e] z-[-2] bg-[#d4cbbe]"></div>
    <div class='flex w-[1000px] h-[600px]'>
      <PixelBorderSecondary content-cls='bg-[#7d929e] p-2.5 flex' background='bg-[#7d929e]'>
        <ColumnResizer class='w-full'>
          <template v-slot:left>
            <VerticalResizer class='h-full'>
              <template v-slot:top>
                <Palette />
              </template>
              <template v-slot:bottom>
                <ColorPicker />
              </template>
            </VerticalResizer>
          </template>
          <template v-slot:right>
            <PixelBorderSecondary>
              <Canvas />
            </PixelBorderSecondary>
          </template>
        </ColumnResizer>
      </PixelBorderSecondary>
      <Toolbar />
    </div>
  </div>
</template>