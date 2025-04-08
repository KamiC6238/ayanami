<script setup lang="ts">
import { generateTintAndShade, hslToRgb, makeRGBA } from "@/utils";
import { PixelBorderTertiary } from "./PixelBorder";

const redHSL = { h: 3, s: 100, l: 67 };
const red = hslToRgb(redHSL);
const { tint: redTint, shade: redShade } = generateTintAndShade({
	h: 3,
	s: 100,
	l: 67,
});

const yellowHSL = { h: 42, s: 100, l: 59 };
const yellow = hslToRgb(yellowHSL);
const { tint: yellowTint, shade: yellowShade } = generateTintAndShade({
	h: 42,
	s: 100,
	l: 59,
});

const greenHSL = { h: 132, s: 69, l: 47 };
const green = hslToRgb(greenHSL);
const { tint: greenTint, shade: greenShade } = generateTintAndShade({
	h: 132,
	s: 69,
	l: 47,
});

const trafficLights = [
	{ color: makeRGBA(red), tint: makeRGBA(redTint), shade: makeRGBA(redShade) },
	{
		color: makeRGBA(yellow),
		tint: makeRGBA(yellowTint),
		shade: makeRGBA(yellowShade),
	},
	{
		color: makeRGBA(green),
		tint: makeRGBA(greenTint),
		shade: makeRGBA(greenShade),
	},
];
</script>
<template>
  <div class='flex'>
    <PixelBorderTertiary
      v-for='({ color, tint, shade }, index) of trafficLights'
      :key='index'
      class='mr-2 !w-5 !h-5'
      :border-left-top-color="tint"
      :border-right-bottom-color="shade"
    >
      <div class='h-full' :style='{ background: color }'></div>
    </PixelBorderTertiary>
  </div>
</template>