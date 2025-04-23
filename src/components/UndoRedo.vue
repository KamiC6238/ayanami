<script setup lang="ts">
import RedoIcon from "@/assets/icons/redo.svg";
import UndoIcon from "@/assets/icons/undo.svg";
import { useCanvasStore } from "@/store";
import { cn } from "@/utils";

const canvasStore = useCanvasStore();

const cls = cn("w-6 h-6 bg-[#c6c6c6] hover:bg-white rounded shadow");
</script>
<template>
  <div class="flex absolute bottom-2 right-2 gap-2">
    <UndoIcon :class="cls" @click='canvasStore.undo' />
    <RedoIcon :class="cls" @click='canvasStore.redo' />
  </div>
</template>