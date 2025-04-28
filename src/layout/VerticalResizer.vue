<script setup lang='ts'>
import { ColumnResizer } from "@column-resizer/core";
import { onMounted, useTemplateRef } from "vue";

const resizerRef = useTemplateRef("vertical-resizer-container");

onMounted(() => {
	if (resizerRef.value) {
		const resizer = new ColumnResizer({ vertical: true });
		resizer.init(resizerRef.value);
	}
});
</script>
<template>
  <div ref="vertical-resizer-container">
    <div data-item-type='SECTION' :style="{
        minHeight: '300px',
        maxHeight: '100%',
      }"
    >
      <slot name='top' />
    </div>
    <div data-item-type='BAR' class='cursor-row-resize bg-[#6e8f8b]' />
    <div data-item-type='SECTION' :style="{
        minHeight: '180px',
        maxHeight: '100%',
      }"
    >
      <slot name='bottom' />
    </div>
  </div>
</template>