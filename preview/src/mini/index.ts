import {
  getPathArgsForCorner,
  getPathFromPathArgs,
  rectangle,
  roundedRectangle,
  toRadians,
} from "./draw";

export type SquircleArgs = {
  cornerRadius?: number;
  cornerSmoothing?: number;
  width: number;
  height: number;
};

function positiveLimit(number: number) {
  return Math.max(0, number);
}

export function getSquirclePath({
  cornerRadius: radius = 0,
  cornerSmoothing: smoothing = 0.6,
  width,
  height,
}: SquircleArgs) {
  height = positiveLimit(height);
  width = positiveLimit(width);
  if (height === 0 || width === 0) return "";
  smoothing = positiveLimit(Math.min(1, smoothing));

  const verticalLimit = height / 2;
  const horizontalLimit = width / 2;
  const maxRadius = Math.min(verticalLimit, horizontalLimit);
  radius = positiveLimit(Math.min(radius, maxRadius));

  if (radius === 0) return rectangle(height, width);
  if (radius === verticalLimit && radius === horizontalLimit)
    return `M ${
      width / 2
    } 0 a ${radius} ${radius} 0 0 0 0 ${height} a ${radius} ${radius} 0 0 0 0 ${-height} Z`;
  if (smoothing === 0) return roundedRectangle(height, width, radius);
  const maxTransitionLength = (1 + smoothing) * radius;
  let verticalTransitionLength = Math.min(verticalLimit, maxTransitionLength);
  let horizontalTransitionLength = Math.min(
    horizontalLimit,
    maxTransitionLength
  );

  const halfStandardArcAngle = 45 * (1 - smoothing);
  const halfComAngle = (45 - halfStandardArcAngle) / 2;
  const distance34 = radius * Math.tan(toRadians(halfComAngle));
  const transitionRadians = toRadians(45 * smoothing);
  const lengthD = distance34 * Math.sin(transitionRadians);
  const lengthC = distance34 * Math.cos(transitionRadians);

  const cornerArgs = getPathArgsForCorner({
    radius,
    halfStandardArcAngle,
    lengthC,
    lengthD,
    verticalTransitionLength,
    horizontalTransitionLength,
  });
  return getPathFromPathArgs({
    radius,
    width,
    height,
    lengthC,
    lengthD,
    cornerArgs,
    maxTransitionLength,
    verticalTransitionLength,
    horizontalTransitionLength,
    verticalMerged: radius === horizontalLimit,
    horizontalMerged: radius === verticalLimit,
  });
}
