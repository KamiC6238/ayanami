<script setup lang="ts">
import { generateTintAndShade, hslToRgb, makeRGBA } from "@/utils";
import { PixelBorderTertiary } from "./PixelBorder";

const trafficLights = [
	{ h: 3, s: 100, l: 67 },
	{ h: 42, s: 100, l: 59 },
	{ h: 132, s: 69, l: 47 },
]
	.map((hsl) => ({
		rgb: hslToRgb(hsl),
		...generateTintAndShade(hsl),
	}))
	.map(({ rgb, tint, shade }) => ({
		color: makeRGBA(rgb),
		tint: makeRGBA(tint),
		shade: makeRGBA(shade),
	}));
</script>
<template>
  <div class='flex'>
    <PixelBorderTertiary
      v-for='({ color, tint, shade }, index) of trafficLights'
      :key='index'
      class='cursor-pointer mr-2 !w-5 !h-5'
      :color='color'
      :tint="tint"
      :shade="shade"
    >
      <div class='h-full' :style='{ background: color }'></div>
    </PixelBorderTertiary>
  </div>
</template>