<script lang="ts" setup>
import { useTemplateRef } from 'vue';

const hueRef = useTemplateRef('hueRef')
</script>
<template>
  <div class="hue" ref="hueRef" />
</template>
<style scoped>
.hue {
  width: 100px;
  height: 10px;
  background: linear-gradient(
    to right,
    hsl(0,100%,50%),
    hsl(60,100%,50%),
    hsl(120,100%,50%),
    hsl(180,100%,50%),
    hsl(240,100%,50%),
    hsl(300,100%,50%),
    hsl(360,100%,50%)
  )
}
</style>