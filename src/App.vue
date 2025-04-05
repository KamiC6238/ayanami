<script setup lang="ts">
import { Canvas, ColorPicker, Palette, Toolbar } from "@/components";
import { ColumnResizer, VerticalResizer } from "./layout";
</script>

<template>
  <div class='relative w-full h-full'>
    <div class="absolute w-full h-full bg-[#7d929e] z-[-2]"></div>
    <div class='flex w-full h-full border-10 border-solid border-[#7d929e]'>
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