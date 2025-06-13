import {
  CornerParamWithDefault,
  getPathArgsForCorner,
  getPathFromPathArgs,
  rectangle,
  roundedRectangle,
  CornerRadius,
} from "./draw";

export type SquircleArgs = {
  cornerRadius?: number | CornerParamWithDefault;
  cornerSmoothing?: number;
  width: number;
  height: number;
};

function positiveLimit(number: number) {
  return Math.max(0, number);
}
function roundToDecimalPlaces(number: number, place: number) {
  const factor = Math.pow(10, place);
  return Math.round(number * factor) / factor;
}

export function getSquirclePath({
  cornerRadius = 0,
  cornerSmoothing: smoothing = 0.6,
  width,
  height,
}: SquircleArgs) {
  height = Math.round(positiveLimit(height));
  width = Math.round(positiveLimit(width));
  if (height === 0 || width === 0) return "";
  smoothing = positiveLimit(Math.min(1, smoothing));

  if (typeof cornerRadius === "object") {
    let radius: CornerRadius = {
      topLeft: Math.round(
        positiveLimit(cornerRadius.topLeft ?? cornerRadius.default ?? 0)
      ),
      topRight: Math.round(
        positiveLimit(cornerRadius.topRight ?? cornerRadius.default ?? 0)
      ),
      bottomLeft: Math.round(
        positiveLimit(cornerRadius.bottomLeft ?? cornerRadius.default ?? 0)
      ),
      bottomRight: Math.round(
        positiveLimit(cornerRadius.bottomRight ?? cornerRadius.default ?? 0)
      ),
    };
    const heightCalc = () => {
      const leftDiameter = radius.bottomLeft + radius.topLeft;
      const rightDiameter = radius.topRight + radius.bottomRight;
      if (height <= leftDiameter) {
        radius.topLeft = roundToDecimalPlaces(
          (radius.topLeft / leftDiameter) * height,
          4
        );
        radius.bottomLeft = roundToDecimalPlaces(
          (radius.bottomLeft / leftDiameter) * height,
          4
        );
      }
      if (height <= rightDiameter) {
        radius.topRight = roundToDecimalPlaces(
          (radius.topRight / rightDiameter) * height,
          4
        );
        radius.bottomRight = roundToDecimalPlaces(
          (radius.bottomRight / rightDiameter) * height,
          4
        );
      }
    };
    const widthCalc = () => {
      const topDiameter = radius.topLeft + radius.topRight;
      const bottomDiameter = radius.bottomRight + radius.bottomLeft;
      if (width <= topDiameter) {
        radius.topLeft = roundToDecimalPlaces(
          (radius.topLeft / topDiameter) * width,
          4
        );
        radius.topRight = roundToDecimalPlaces(
          (radius.topRight / topDiameter) * width,
          4
        );
      }
      if (width <= bottomDiameter) {
        radius.bottomRight = roundToDecimalPlaces(
          (radius.bottomRight / bottomDiameter) * width,
          4
        );
        radius.bottomLeft = roundToDecimalPlaces(
          (radius.bottomLeft / bottomDiameter) * width,
          4
        );
      }
    };
    if (width > height) {
      heightCalc();
      widthCalc();
    } else {
      widthCalc();
      heightCalc();
    }
    if (
      radius.topLeft === 0 &&
      radius.topRight === 0 &&
      radius.bottomRight === 0 &&
      radius.bottomLeft === 0
    )
      return rectangle(height, width);
    if (
      height === width &&
      radius.topLeft === width / 2 &&
      radius.topLeft === radius.topRight &&
      radius.topRight === radius.bottomRight &&
      radius.bottomRight === radius.bottomLeft
    )
      return `M ${width / 2} 0 a ${radius.topLeft} ${
        radius.topLeft
      } 0 0 0 0 ${height} a ${radius.topLeft} ${
        radius.topLeft
      } 0 0 0 0 ${-height} Z`;
    if (smoothing === 0) return roundedRectangle(height, width, radius);

    const topSpace = width - radius.topLeft - radius.topRight;
    const rightSpace = height - radius.topRight - radius.bottomRight;
    const bottomSpace = width - radius.bottomLeft - radius.bottomRight;
    const leftSpace = height - radius.topLeft - radius.bottomLeft;
    const topMerged = topSpace <= 0;
    const rightMerged = rightSpace <= 0;
    const bottomMerged = bottomSpace <= 0;
    const leftMerged = leftSpace <= 0;
    return getPathFromPathArgs({
      width,
      height,
      topLeftPathArgs: getPathArgsForCorner({
        radius: radius.topLeft,
        smoothing,
        verticalSpace: leftSpace / 2,
        horizontalSpace: topSpace / 2,
      }),
      topRightPathArgs: getPathArgsForCorner({
        radius: radius.topRight,
        smoothing,
        verticalSpace: rightSpace / 2,
        horizontalSpace: topSpace / 2,
      }),
      bottomRightPathArgs: getPathArgsForCorner({
        radius: radius.bottomRight,
        smoothing,
        verticalSpace: rightSpace / 2,
        horizontalSpace: bottomSpace / 2,
      }),
      bottomLeftPathArgs: getPathArgsForCorner({
        radius: radius.bottomLeft,
        smoothing,
        verticalSpace: leftSpace / 2,
        horizontalSpace: bottomSpace / 2,
      }),
      topSpace,
      rightSpace,
      bottomSpace,
      leftSpace,
      topMerged,
      rightMerged,
      bottomMerged,
      leftMerged,
    });
  } else {
    const verticalLimit = height / 2;
    const horizontalLimit = width / 2;
    const maxRadius = Math.min(verticalLimit, horizontalLimit);
    const radius = Math.round(positiveLimit(Math.min(cornerRadius, maxRadius)));

    if (radius === 0) return rectangle(height, width);
    if (radius === verticalLimit && radius === horizontalLimit)
      return `M ${
        width / 2
      } 0 a ${radius} ${radius} 0 0 0 0 ${height} a ${radius} ${radius} 0 0 0 0 ${-height} Z`;
    if (smoothing === 0) return roundedRectangle(height, width, radius);

    const pathArgs = getPathArgsForCorner({
      radius: radius,
      smoothing,
      verticalSpace: verticalLimit - radius,
      horizontalSpace: horizontalLimit - radius,
    });
    const verticalMerged = horizontalLimit <= radius;
    const horizontalMerged = verticalLimit <= radius;
    const verticalSpace = height - radius * 2;
    const horizontalSpace = width - radius * 2;
    return getPathFromPathArgs({
      width,
      height,
      topLeftPathArgs: pathArgs,
      topRightPathArgs: pathArgs,
      bottomLeftPathArgs: pathArgs,
      bottomRightPathArgs: pathArgs,
      topMerged: verticalMerged,
      rightMerged: horizontalMerged,
      bottomMerged: verticalMerged,
      leftMerged: horizontalMerged,
      topSpace: horizontalSpace,
      bottomSpace: horizontalSpace,
      leftSpace: verticalSpace,
      rightSpace: verticalSpace,
    });
  }
}
