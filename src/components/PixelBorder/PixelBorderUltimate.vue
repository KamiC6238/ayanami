<script setup lang="ts">
import { cn } from "@/utils";
import { computed } from "vue";

interface Props {
	active?: boolean;
}

const props = defineProps<Props>();

const cls = computed(() =>
	cn(
		`
  bg-[#c9c9c9] hover:bg-[#c0c0c0] active:bg-[#c3c3c3] cursor-pointer
`,
		props.active ? "bg-[#c6c6c6]" : "bg-[#8c8c8c]",
	),
);
</script>
<template>
  <div class='relative p-[3px] bg-[#c6c6c6] border-2 border-solid border-black'>
    <div :class='cls'>
      <slot />
    </div>
    <div class='absolute w-[3px] h-[3px] bg-[#8c8c8c] left-0 top-0'></div>
    <div class='absolute w-[3px] h-[3px] bg-[#8c8c8c] left-0 bottom-0'></div>
    <div class='absolute w-[3px] h-[3px] bg-[#8c8c8c] right-0 top-0'></div>
    <div class='absolute w-[3px] h-[3px] bg-[#8c8c8c] right-0 bottom-0'></div>
  </div>
</template>