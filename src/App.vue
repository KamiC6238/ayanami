<script setup lang="ts">
import { Canvas, ColorPicker, Palette, Toolbar } from "@/components";
import { generatePixelBorder } from "@/utils";
import { ColumnResizer, VerticalResizer } from "./layout";

generatePixelBorder(4, 3);
</script>

<template>
  <div class='relative w-full h-full flex items-center justify-center'>
    <div class="absolute w-full h-full bg-[#7d929e] z-[-2]"></div>
    <div class='flex border-10 border-solid border-[#7d929e] w-[1000px] h-[600px]'>
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
          <Canvas />
        </template>
      </ColumnResizer>
      <Toolbar />
    </div>
  </div>
</template>