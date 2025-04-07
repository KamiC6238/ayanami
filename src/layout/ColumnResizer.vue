<script setup lang='ts'>
import { ColumnResizer } from "@column-resizer/core";
import { onMounted, ref, useTemplateRef } from "vue";

const resizerRef = useTemplateRef("column-resizer-container");
const resizer = ref<ColumnResizer | null>(null);

onMounted(() => {
	if (resizerRef.value) {
		const _resizer = new ColumnResizer({ vertical: false });
		_resizer.init(resizerRef.value);
		resizer.value = _resizer;
	}
});
</script>
<template>
  <div ref="column-resizer-container">
    <div data-item-type='SECTION' :style='{...(resizer?.styles.section({ maxSize: 230, minSize: 130 }) ?? {})}'>
      <slot name='left' />
    </div>
    <div data-item-type='BAR' class='cursor-col-resize bg-[#7d929e]' />
    <div data-item-type='SECTION'>
      <slot name='right' />
    </div>
  </div>
</template>