// Source: https://github.com/CodeFoodPixels/pixel-corners/blob/main/main.js
// License: MIT
// Copyright (c) CodeFoodPixels

function generateOuterPath(radius, pixelSize) {
	const points = generatePoints(radius, pixelSize);
	const flipped = flipCoords(points);

	return generatePath(flipped);
}

function generateInnerPath(radius, pixelSize, offset, reverse = false) {
	const points = generatePoints(radius, pixelSize);
	const inset =
		offset < radius
			? insetCoords(points, pixelSize, offset)
			: generatePoints(2, pixelSize, offset);
	const flipped = flipCoords(inset);
	const corners = addCorners(flipped);

	return generatePath(corners, reverse);
}

function generatePath(coords, reverse = false) {
	const mirroredCoords = mirrorCoords(coords);

	return (reverse ? mirroredCoords : mirroredCoords.reverse())
		.map((point) => {
			return `${point.x} ${point.y}`;
		})
		.join(",\n    ");
}

function generatePoints(radius, pixelSize, offset = 0) {
	const coords = [];

	const lastCoords = {
		x: -1,
		y: -1,
	};

	for (let i = 270; i > 225; i--) {
		const x =
			Number.parseInt(
				radius * Math.sin((2 * Math.PI * i) / 360) + radius + 0.5,
			) * pixelSize;
		const y =
			Number.parseInt(
				radius * Math.cos((2 * Math.PI * i) / 360) + radius + 0.5,
			) * pixelSize;

		if (x !== lastCoords.x || y !== lastCoords.y) {
			lastCoords.x = x;
			lastCoords.y = y;

			coords.push({
				x: x + offset * pixelSize,
				y: y + offset * pixelSize,
			});
		}
	}

	const mergedCoords = mergeCoords(coords);
	const corners = addCorners(mergedCoords);

	return corners;
}

function flipCoords(coords) {
	return [
		...coords,
		...coords.map(({ x, y }) => ({ x: y, y: x })).reverse(),
	].filter(({ x, y }, i, arr) => {
		return !i || arr[i - 1].x !== x || arr[i - 1].y !== y;
	});
}

function insetCoords(coords, pixelSize, offset) {
	return coords
		.map(({ x, y }) => ({
			x: x + pixelSize * offset,
			y: y + pixelSize * Math.floor(offset / 2),
		}))
		.reduce((ret, item) => {
			if (ret.length > 0 && ret[ret.length - 1].x === ret[ret.length - 1].y) {
				return ret;
			}

			ret.push(item);

			return ret;
		}, []);
}

function mergeCoords(coords) {
	return coords.reduce((result, point, index) => {
		if (
			index !== coords.length - 1 &&
			point.x === 0 &&
			coords[index + 1].x === 0
		) {
			return result;
		}

		if (index !== 0 && point.y === 0 && coords[index - 1].y === 0) {
			return result;
		}

		if (
			index !== 0 &&
			index !== coords.length - 1 &&
			point.x === coords[index - 1].x &&
			point.x === coords[index + 1].x
		) {
			return result;
		}

		result.push(point);
		return result;
	}, []);
}

function addCorners(coords) {
	return coords.reduce((result, point, i) => {
		result.push(point);

		if (
			coords.length > 1 &&
			i < coords.length - 1 &&
			coords[i + 1].x !== point.x &&
			coords[i + 1].y !== point.y
		) {
			result.push({
				x: coords[i + 1].x,
				y: point.y,
			});
		}

		return result;
	}, []);
}

function mirrorCoords(coords, offset = 0) {
	return [
		...coords.map(({ x, y }) => ({
			x: offset ? `${x + offset}px` : `${x}px`,
			y: offset ? `${y + offset}px` : `${y}px`,
		})),
		...coords.map(({ x, y }) => ({
			x: edgeCoord(y, offset),
			y: offset ? `${x + offset}px` : `${x}px`,
		})),
		...coords.map(({ x, y }) => ({
			x: edgeCoord(x, offset),
			y: edgeCoord(y, offset),
		})),
		...coords.map(({ x, y }) => ({
			x: offset ? `${y + offset}px` : `${y}px`,
			y: edgeCoord(x, offset),
		})),
	];
}

function edgeCoord(n, offset) {
	if (offset) {
		return n === 0
			? `calc(100% - ${offset}px)`
			: `calc(100% - ${offset + n}px)`;
	}

	return n === 0 ? "100%" : `calc(100% - ${n}px)`;
}

export const generatePixelBorder = (radius, pixelSize, borderConfig = {}) => {
	const { width: borderWidth = 1, color: borderColor = "#000000" } =
		borderConfig;

	document.documentElement.style.setProperty(
		"--border-width",
		`${borderWidth * pixelSize}px`,
	);

	const outerPath = generateOuterPath(radius, pixelSize);
	const innerPath = generateInnerPath(radius, pixelSize, borderWidth, true);

	const borderPath = `
    ${outerPath},
    0px 50%,
    ${borderWidth * pixelSize}px 50%,
    ${innerPath},
    ${borderWidth * pixelSize}px 50%,
    0px 50%
  `;

	const generatedCSS = `
    .pixel-corners,
    .pixel-corners--wrapper {
      clip-path: polygon(${outerPath});
      position: relative;
    }
    .pixel-corners {
      border: ${borderWidth * pixelSize}px solid transparent;
    }
    .pixel-corners--wrapper {
      width: fit-content;
      height: fit-content;
    }
    .pixel-corners--wrapper .pixel-corners {
      display: block;
      clip-path: polygon(${innerPath});
    }
    .pixel-corners::after,
    .pixel-corners--wrapper::after {
      content: "";
      position: absolute;
      clip-path: polygon(${borderPath});
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background: ${borderColor};
      display: block;
      pointer-events: none;
    }
    .pixel-corners::after {
      margin: -${borderWidth * pixelSize}px;
    }
  `;

	document.head.appendChild(
		Object.assign(document.createElement("style"), {
			textContent: generatedCSS,
		}),
	);
};
