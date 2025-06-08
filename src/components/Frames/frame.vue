<script setup lang="ts">
import type { Frame } from "@/types";
import { PixelBorderSecondary } from "../PixelBorder";

const emit = defineEmits<(e: "delete") => void>();

defineProps<
	Frame & {
		active: boolean;
		enableDelete: boolean;
	}
>();
</script>
<template>
  <PixelBorderSecondary
    wrapper-width="w-25"
    wrapper-height="h-25"
  >
    <div class='relative'>
      <img :src="snapshot" />
      <div
        v-if='enableDelete'
        class='absolute top-0 right-0'
        @click.stop='emit("delete")'
      >d</div>
    </div>
  </PixelBorderSecondary>
</template>