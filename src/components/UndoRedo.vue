<script setup lang="ts">
import RedoIcon from "@/assets/icons/redo.svg";
import UndoIcon from "@/assets/icons/undo.svg";
import { useCanvasStore } from "@/store";
import { PixelBorderUltimate } from "./PixelBorder";

const canvasStore = useCanvasStore();
</script>
<template>
  <div class="flex absolute bottom-2 right-2 gap-2">
    <PixelBorderUltimate @click='canvasStore.undo'>
      <UndoIcon class='w-6 h-6 p-1' />
    </PixelBorderUltimate>
    <PixelBorderUltimate @click='canvasStore.redo'>
      <RedoIcon class='w-6 h-6 p-1' />
    </PixelBorderUltimate>
  </div>
</template>