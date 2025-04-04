<script setup lang="ts">
import { Canvas, ColorPicker, Palette, Toolbar } from "@/components";
import { ColumnResizer, VerticalResizer } from "./layout";
</script>

<template>
  <div class="flex items-content justify-content w-full h-full border-10 border-solid border-[#7d929e]">
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
</template>