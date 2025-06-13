import {
  CornerRadius,
  getPathArgsForCorner,
  getPathFromPathArgs,
  rectangle,
  roundedRectangle,
} from "./draw";

export type SquircleArgs = {
  cornerRadius?: CornerRadius;
  cornerSmoothing?: number;
  width: number;
  height: number;
};

function positiveLimit(number: number) {
  return Math.max(0, number);
}

export function getSquirclePath({
  cornerRadius = 0,
  cornerSmoothing = 0.6,
  width,
  height,
}: SquircleArgs) {
  height = Math.round(positiveLimit(height));
  width = Math.round(positiveLimit(width));
  if (height === 0 || width === 0) return "";
  cornerSmoothing = positiveLimit(Math.min(1, cornerSmoothing));

  if (typeof cornerRadius === "object") {
    cornerRadius.topLeft = Math.round(
      positiveLimit(cornerRadius.topLeft ?? cornerRadius.default ?? 0)
    );
    cornerRadius.topRight = Math.round(
      positiveLimit(cornerRadius.topRight ?? cornerRadius.default ?? 0)
    );
    cornerRadius.bottomLeft = Math.round(
      positiveLimit(cornerRadius.bottomLeft ?? cornerRadius.default ?? 0)
    );
    cornerRadius.bottomRight = Math.round(
      positiveLimit(cornerRadius.bottomRight ?? cornerRadius.default ?? 0)
    );
    const topDiameter = cornerRadius.topLeft + cornerRadius.topRight;
    const rightDiameter = cornerRadius.topRight + cornerRadius.bottomRight;
    const bottomDiameter = cornerRadius.bottomRight + cornerRadius.bottomLeft;
    const leftDiameter = cornerRadius.bottomLeft + cornerRadius.topLeft;
    let radiusLimits = {
      topLeft: cornerRadius.topLeft,
      topRight: cornerRadius.topRight,
      rightTop: cornerRadius.topRight,
      rightBottom: cornerRadius.bottomRight,
      bottomRight: cornerRadius.bottomRight,
      bottomLeft: cornerRadius.bottomLeft,
      leftBottom: cornerRadius.bottomLeft,
      leftTop: cornerRadius.topLeft,
    };
    if (width <= topDiameter) {
      radiusLimits.topLeft = Math.round(
        (cornerRadius.topLeft / topDiameter) * width
      );
      radiusLimits.topRight = Math.round(
        (cornerRadius.topRight / topDiameter) * width
      );
    }
    if (height <= rightDiameter) {
      radiusLimits.rightTop = Math.round(
        (cornerRadius.topRight / rightDiameter) * height
      );
      radiusLimits.rightBottom = Math.round(
        (cornerRadius.bottomRight / rightDiameter) * height
      );
    }
    if (width <= bottomDiameter) {
      radiusLimits.bottomRight = Math.round(
        (cornerRadius.bottomRight / bottomDiameter) * width
      );
      radiusLimits.bottomLeft = Math.round(
        (cornerRadius.bottomLeft / bottomDiameter) * width
      );
    }
    if (height <= leftDiameter) {
      radiusLimits.leftTop = Math.round(
        (cornerRadius.topLeft / leftDiameter) * height
      );
      radiusLimits.leftBottom = Math.round(
        (cornerRadius.bottomLeft / leftDiameter) * height
      );
    }
    cornerRadius.topLeft = Math.min(radiusLimits.topLeft, radiusLimits.leftTop);
    cornerRadius.topRight = Math.min(
      radiusLimits.topRight,
      radiusLimits.rightTop
    );
    cornerRadius.bottomRight = Math.min(
      radiusLimits.bottomRight,
      radiusLimits.rightBottom
    );
    cornerRadius.bottomLeft = Math.min(
      radiusLimits.bottomLeft,
      radiusLimits.leftBottom
    );

    if (
      cornerRadius.topLeft === 0 &&
      cornerRadius.topRight === 0 &&
      cornerRadius.bottomRight === 0 &&
      cornerRadius.bottomLeft === 0
    )
      return rectangle(height, width);
    if (
      height === width &&
      cornerRadius.topLeft === width / 2 &&
      cornerRadius.topLeft === cornerRadius.topRight &&
      cornerRadius.topRight === cornerRadius.bottomRight &&
      cornerRadius.bottomRight === cornerRadius.bottomLeft
    )
      return `M ${width / 2} 0 a ${cornerRadius.topLeft} ${
        cornerRadius.topLeft
      } 0 0 0 0 ${height} a ${cornerRadius.topLeft} ${
        cornerRadius.topLeft
      } 0 0 0 0 ${-height} Z`;
    if (cornerSmoothing === 0)
      return roundedRectangle(height, width, cornerRadius);

    const topSpace = width - cornerRadius.topLeft - cornerRadius.topRight;
    const rightSpace =
      height - cornerRadius.topRight - cornerRadius.bottomRight;
    const bottomSpace =
      width - cornerRadius.bottomLeft - cornerRadius.bottomRight;
    const leftSpace = height - cornerRadius.topLeft - cornerRadius.bottomLeft;
    const topMerged = topSpace <= 0;
    const rightMerged = rightSpace <= 0;
    const bottomMerged = bottomSpace <= 0;
    const leftMerged = leftSpace <= 0;
    return getPathFromPathArgs({
      width,
      height,
      topLeftPathArgs: getPathArgsForCorner({
        cornerRadius: cornerRadius.topLeft,
        cornerSmoothing,
        verticalSpace: leftSpace / 2,
        horizontalSpace: topSpace / 2,
      }),
      topRightPathArgs: getPathArgsForCorner({
        cornerRadius: cornerRadius.topRight,
        cornerSmoothing,
        verticalSpace: rightSpace / 2,
        horizontalSpace: topSpace / 2,
      }),
      bottomRightPathArgs: getPathArgsForCorner({
        cornerRadius: cornerRadius.bottomRight,
        cornerSmoothing,
        verticalSpace: rightSpace / 2,
        horizontalSpace: bottomSpace / 2,
      }),
      bottomLeftPathArgs: getPathArgsForCorner({
        cornerRadius: cornerRadius.bottomLeft,
        cornerSmoothing,
        verticalSpace: leftSpace / 2,
        horizontalSpace: bottomSpace / 2,
      }),
      topMerged,
      rightMerged,
      bottomMerged,
      leftMerged,
    });
  } else {
    const verticalLimit = height / 2;
    const horizontalLimit = width / 2;
    const maxRadius = Math.min(verticalLimit, horizontalLimit);
    cornerRadius = Math.round(positiveLimit(Math.min(cornerRadius, maxRadius)));

    if (cornerRadius === 0) return rectangle(height, width);
    if (cornerRadius === verticalLimit && cornerRadius === horizontalLimit)
      return `M ${
        width / 2
      } 0 a ${cornerRadius} ${cornerRadius} 0 0 0 0 ${height} a ${cornerRadius} ${cornerRadius} 0 0 0 0 ${-height} Z`;
    if (cornerSmoothing === 0)
      return roundedRectangle(height, width, cornerRadius);

    const pathArgs = getPathArgsForCorner({
      cornerRadius,
      cornerSmoothing,
      verticalSpace: verticalLimit - cornerRadius,
      horizontalSpace: horizontalLimit - cornerRadius,
    });
    const verticalMerged = horizontalLimit <= cornerRadius;
    const horizontalMerged = verticalLimit <= cornerRadius;
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
    });
  }
}

export class DynamicSquircle {
  public cornerRadius: {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
  };
  private cornerSmoothing: number;
  private height: number;
  private width: number;
  constructor(
    cornerRadius?: CornerRadius,
    cornerSmoothing?: number,
    size?: { height?: number; width?: number }
  ) {
    this.height = size?.height ?? 0;
    this.width = size?.width ?? 0;
    this.cornerSmoothing = cornerSmoothing ?? 0.6;
    if (typeof cornerRadius === "object") {
      const defaultRadius = cornerRadius.default ?? 0;
      this.cornerRadius = {
        topLeft: cornerRadius.topLeft ?? defaultRadius,
        topRight: cornerRadius.topRight ?? defaultRadius,
        bottomRight: cornerRadius.bottomRight ?? defaultRadius,
        bottomLeft: cornerRadius.bottomLeft ?? defaultRadius,
      };
    } else {
      this.cornerRadius = {
        topLeft: cornerRadius ?? 0,
        topRight: cornerRadius ?? 0,
        bottomRight: cornerRadius ?? 0,
        bottomLeft: cornerRadius ?? 0,
      };
    }
  }
  update(
    height?: number,
    width?: number,
    cornerRadius?: CornerRadius,
    cornerSmoothing?: number
  ) {
    if (height) this.height = height;
    if (width) this.width = width;
    if (typeof cornerRadius === "object") {
      if (cornerRadius.topLeft)
        this.cornerRadius.topLeft = cornerRadius.topLeft;
      if (cornerRadius.topRight)
        this.cornerRadius.topRight = cornerRadius.topRight;
      if (cornerRadius.bottomRight)
        this.cornerRadius.bottomRight = cornerRadius.bottomRight;
      if (cornerRadius.bottomLeft)
        this.cornerRadius.bottomLeft = cornerRadius.bottomLeft;
      const defaultRadius = cornerRadius.default ?? 0;
      this.cornerRadius = {
        topLeft: cornerRadius.topLeft ?? defaultRadius,
        topRight: cornerRadius.topRight ?? defaultRadius,
        bottomRight: cornerRadius.bottomRight ?? defaultRadius,
        bottomLeft: cornerRadius.bottomLeft ?? defaultRadius,
      };
    } else if (typeof cornerRadius === "number") {
      this.cornerRadius = {
        topLeft: cornerRadius,
        topRight: cornerRadius,
        bottomRight: cornerRadius,
        bottomLeft: cornerRadius,
      };
    }
  }
  private draw() {
    return getSquirclePath({
      width: this.width,
      height: this.height,
      cornerRadius: this.cornerRadius,
      cornerSmoothing: this.cornerSmoothing,
    });
  }
}
