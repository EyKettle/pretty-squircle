import {
  calcLengthAB,
  CornerParam,
  CornerParamWithDefault,
  getPathArgsForCorner,
  getPathFromPathArgs,
  horizontalLengthAB,
  rectangle,
  roundedRectangle,
  CornerRadius,
  verticalLengthAB,
  CornerPathArgs,
} from "./draw";

export type SquircleArgs = {
  cornerRadius?: number | CornerParamWithDefault;
  cornerSmoothing?: number;
  width: number;
  height: number;
};

type Direction = "top" | "right" | "bottom" | "left";

function positiveLimit(number: number) {
  return Math.max(0, number);
}
function roundToDecimalPlaces(number: number, place: number) {
  const factor = Math.pow(10, place);
  return Math.round(number * factor) / factor;
}

function normalizeRadius(
  cornerRadius: CornerParamWithDefault,
  height: number,
  width: number
) {
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
  return radius;
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
    const radius = normalizeRadius(cornerRadius, height, width);
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

export class DynamicSquircle {
  private radius: CornerRadius = {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0,
  };
  private actualRadius: CornerRadius;
  private smoothing: number;
  private height: number;
  private width: number;
  private topLeft: CornerPathArgs;
  private topRight: CornerPathArgs;
  private bottomRight: CornerPathArgs;
  private bottomLeft: CornerPathArgs;
  private halfTopSpace!: number;
  private halfRightSpace!: number;
  private halfBottomSpace!: number;
  private halfLeftSpace!: number;
  private topMerged = false;
  private rightMerged = false;
  private bottomMerged = false;
  private leftMerged = false;

  constructor(
    cornerRadius?: number | CornerParamWithDefault,
    cornerSmoothing?: number,
    size?: { height?: number; width?: number }
  ) {
    this.height = size?.height ?? 0;
    this.width = size?.width ?? 0;
    this.smoothing = cornerSmoothing ?? 0.6;

    if (typeof cornerRadius === "object") {
      const defaultRadius = cornerRadius.default ?? 0;
      this.radius.topLeft = cornerRadius.topLeft ?? defaultRadius;
      this.radius.topRight = cornerRadius.topRight ?? defaultRadius;
      this.radius.bottomRight = cornerRadius.bottomRight ?? defaultRadius;
      this.radius.bottomLeft = cornerRadius.bottomLeft ?? defaultRadius;
    } else {
      this.radius.topLeft = cornerRadius ?? 0;
      this.radius.topRight = cornerRadius ?? 0;
      this.radius.bottomRight = cornerRadius ?? 0;
      this.radius.bottomLeft = cornerRadius ?? 0;
    }
    this.actualRadius = normalizeRadius(this.radius, this.height, this.width);
    this._refreshSpace("top");
    this._refreshSpace("right");
    this._refreshSpace("bottom");
    this._refreshSpace("left");
    this.topLeft = getPathArgsForCorner({
      radius: this.actualRadius.topLeft,
      smoothing: this.smoothing,
      verticalSpace: this.halfLeftSpace,
      horizontalSpace: this.halfTopSpace,
    });
    this.topRight = getPathArgsForCorner({
      radius: this.actualRadius.topRight,
      smoothing: this.smoothing,
      verticalSpace: this.halfRightSpace,
      horizontalSpace: this.halfTopSpace,
    });
    this.bottomRight = getPathArgsForCorner({
      radius: this.actualRadius.bottomRight,
      smoothing: this.smoothing,
      verticalSpace: this.halfRightSpace,
      horizontalSpace: this.halfBottomSpace,
    });
    this.bottomLeft = getPathArgsForCorner({
      radius: this.actualRadius.bottomLeft,
      smoothing: this.smoothing,
      verticalSpace: this.halfLeftSpace,
      horizontalSpace: this.halfBottomSpace,
    });
    this.adjustTransition("top");
    this.adjustTransition("right");
    this.adjustTransition("bottom");
    this.adjustTransition("left");
  }
  update(
    height?: number,
    width?: number,
    radius?: number | CornerParam,
    smoothing?: number
  ) {
    if (height === this.height) height = undefined;
    if (width === this.width) width = undefined;
    if (typeof radius === "object") {
      if (radius.topLeft === this.radius.topLeft) radius.topLeft = undefined;
      if (radius.topRight === this.radius.topRight) radius.topRight = undefined;
      if (radius.bottomRight === this.radius.bottomRight)
        radius.bottomRight = undefined;
      if (radius.bottomLeft === this.radius.bottomLeft)
        radius.bottomLeft = undefined;
    } else {
      radius = {
        topLeft: this.radius.topLeft === radius ? undefined : radius,
        topRight: this.radius.topRight === radius ? undefined : radius,
        bottomRight: this.radius.bottomRight === radius ? undefined : radius,
        bottomLeft: this.radius.bottomLeft === radius ? undefined : radius,
      };
    }
    if (smoothing === this.smoothing) smoothing = undefined;

    // 更新数据
    const willUpdate = this.update_args(height, width, radius, smoothing);
    // 绘图检查
    if (!willUpdate) return;
    const checkResult = this.checkpoint();
    if (checkResult !== undefined) {
      return checkResult;
    }
    // 更新过渡
    this.update_data(
      height !== undefined,
      width !== undefined,
      {
        topLeft: this.topLeft.radius !== this.actualRadius.topLeft,
        topRight: this.topRight.radius !== this.actualRadius.topRight,
        bottomRight: this.bottomRight.radius !== this.actualRadius.bottomRight,
        bottomLeft: this.bottomLeft.radius !== this.actualRadius.bottomLeft,
      },
      smoothing !== undefined
    );
    return this.draw();
  }
  read(): Readonly<DynamicSquircle> {
    return { ...this };
  }
  manualDraw() {
    const checkResult = this.checkpoint();
    if (checkResult !== undefined) {
      return checkResult;
    }
    return this.draw();
  }
  private draw() {
    return getPathFromPathArgs({
      width: this.width,
      height: this.height,
      topLeftPathArgs: this.topLeft,
      topRightPathArgs: this.topRight,
      bottomRightPathArgs: this.bottomRight,
      bottomLeftPathArgs: this.bottomLeft,
      topSpace: this.halfTopSpace * 2,
      rightSpace: this.halfRightSpace * 2,
      bottomSpace: this.halfBottomSpace * 2,
      leftSpace: this.halfLeftSpace * 2,
      topMerged: this.topMerged,
      rightMerged: this.rightMerged,
      bottomMerged: this.bottomMerged,
      leftMerged: this.leftMerged,
    });
  }
  private update_args(
    height?: number,
    width?: number,
    radius?: CornerParam,
    smoothing?: number
  ): boolean {
    let willUpdate = false;
    if (smoothing !== undefined) {
      willUpdate = true;
      this.smoothing = smoothing;
    }
    if (height !== undefined) {
      willUpdate = true;
      this.height = height;
    }
    if (width !== undefined) {
      willUpdate = true;
      this.width = width;
    }
    if (
      radius !== undefined &&
      !(
        radius.topLeft === undefined &&
        radius.topRight === undefined &&
        radius.bottomRight === undefined &&
        radius.bottomLeft === undefined
      )
    ) {
      willUpdate = true;
      if (radius.topLeft !== undefined) this.radius.topLeft = radius.topLeft;
      if (radius.topRight !== undefined) this.radius.topRight = radius.topRight;
      if (radius.bottomRight !== undefined)
        this.radius.bottomRight = radius.bottomRight;
      if (radius.bottomLeft !== undefined)
        this.radius.bottomLeft = radius.bottomLeft;
      this.actualRadius = normalizeRadius(this.radius, this.height, this.width);
    } else if (height !== undefined || width !== undefined) {
      this.actualRadius = normalizeRadius(this.radius, this.height, this.width);
    }
    return willUpdate;
  }
  private checkpoint() {
    if (
      this.actualRadius.topLeft === 0 &&
      this.actualRadius.topRight === 0 &&
      this.actualRadius.bottomRight === 0 &&
      this.actualRadius.bottomLeft === 0
    ) {
      this.halfTopSpace = this.halfBottomSpace = this.width / 2;
      this.halfLeftSpace = this.halfRightSpace = this.height / 2;
      return rectangle(this.height, this.width);
    }
    if (
      this.height === this.width &&
      this.actualRadius.topLeft === this.width / 2 &&
      this.actualRadius.topLeft === this.actualRadius.topRight &&
      this.actualRadius.topRight === this.actualRadius.bottomRight &&
      this.actualRadius.bottomRight === this.actualRadius.bottomLeft
    ) {
      this.halfTopSpace =
        this.halfRightSpace =
        this.halfBottomSpace =
        this.halfLeftSpace =
          0;
      return `M ${this.width / 2} 0 a ${this.actualRadius.topLeft} ${
        this.actualRadius.topLeft
      } 0 0 0 0 ${this.height} a ${this.actualRadius.topLeft} ${
        this.actualRadius.topLeft
      } 0 0 0 0 ${-this.height} Z`;
    }
    if (this.smoothing === 0) {
      this.halfTopSpace =
        (this.width - this.actualRadius.topLeft - this.actualRadius.topRight) /
        2;
      this.halfRightSpace =
        (this.height -
          this.actualRadius.topRight -
          this.actualRadius.bottomRight) /
        2;
      this.halfBottomSpace =
        (this.width -
          this.actualRadius.bottomRight -
          this.actualRadius.bottomLeft) /
        2;
      this.halfLeftSpace =
        (this.height -
          this.actualRadius.topLeft -
          this.actualRadius.bottomLeft) /
        2;
      return roundedRectangle(this.height, this.width, this.actualRadius);
    }
    return undefined;
  }
  private update_data(
    height: boolean,
    width: boolean,
    radius: {
      topLeft: boolean;
      topRight: boolean;
      bottomRight: boolean;
      bottomLeft: boolean;
    },
    smoothing: boolean
  ) {
    let spaceUpdates = {
      top: width ? true : false,
      right: height ? true : false,
      bottom: width ? true : false,
      left: height ? true : false,
    };
    if (smoothing) {
      spaceUpdates = { top: true, right: true, bottom: true, left: true };
      this.topLeft.maxTransitionLength =
        (1 + this.smoothing) * this.actualRadius.topLeft;
      this.topRight.maxTransitionLength =
        (1 + this.smoothing) * this.actualRadius.topRight;
      this.bottomRight.maxTransitionLength =
        (1 + this.smoothing) * this.actualRadius.bottomRight;
      this.bottomLeft.maxTransitionLength =
        (1 + this.smoothing) * this.actualRadius.bottomLeft;
      radius.topLeft = true;
      radius.topRight = true;
      radius.bottomRight = true;
      radius.bottomLeft = true;
    } else {
      if (radius.topLeft) spaceUpdates.top = spaceUpdates.left = true;
      if (radius.topRight) spaceUpdates.top = spaceUpdates.right = true;
      if (radius.bottomRight) spaceUpdates.bottom = spaceUpdates.right = true;
      if (radius.bottomLeft) spaceUpdates.bottom = spaceUpdates.left = true;
    }

    if (spaceUpdates.top) this._refreshSpace("top");
    if (spaceUpdates.right) this._refreshSpace("right");
    if (spaceUpdates.bottom) this._refreshSpace("bottom");
    if (spaceUpdates.left) this._refreshSpace("left");

    if (!radius.topLeft) {
      this.topLeft.verticalTransitionLength = Math.min(
        this.topLeft.maxTransitionLength,
        this.actualRadius.topLeft + this.halfLeftSpace
      );
      const lengthAB = calcLengthAB(
        {
          transitionLength: this.topLeft.verticalTransitionLength,
          ...this.topLeft,
        },
        this.halfLeftSpace < 0,
        false,
        this.topLeft.arcMovementLength +
          this.topLeft.lengthC +
          this.topLeft.lengthD
      ) as verticalLengthAB;
      this.topLeft.verticalLengthA = lengthAB.verticalLengthA;
      this.topLeft.verticalLengthB = lengthAB.verticalLengthB;
    }
    if (!radius.bottomLeft) {
      this.bottomLeft.verticalTransitionLength = Math.min(
        this.bottomLeft.maxTransitionLength,
        this.actualRadius.bottomLeft + this.halfLeftSpace
      );
      const lengthAB = calcLengthAB(
        {
          transitionLength: this.bottomLeft.verticalTransitionLength,
          ...this.bottomLeft,
        },
        this.halfLeftSpace < 0,
        false,
        this.bottomLeft.arcMovementLength +
          this.bottomLeft.lengthC +
          this.bottomLeft.lengthD
      ) as verticalLengthAB;
      this.bottomLeft.verticalLengthA = lengthAB.verticalLengthA;
      this.bottomLeft.verticalLengthB = lengthAB.verticalLengthB;
    }
    if (!radius.topRight) {
      this.topRight.verticalTransitionLength = Math.min(
        this.topRight.maxTransitionLength,
        this.actualRadius.topRight + this.halfRightSpace
      );
      const lengthAB = calcLengthAB(
        {
          transitionLength: this.topRight.verticalTransitionLength,
          ...this.topRight,
        },
        this.halfRightSpace < 0,
        false,
        this.topRight.arcMovementLength +
          this.topRight.lengthC +
          this.topRight.lengthD
      ) as verticalLengthAB;
      this.topRight.verticalLengthA = lengthAB.verticalLengthA;
      this.topRight.verticalLengthB = lengthAB.verticalLengthB;
    }
    if (!radius.bottomRight) {
      this.bottomRight.verticalTransitionLength = Math.min(
        this.bottomRight.maxTransitionLength,
        this.actualRadius.bottomRight + this.halfRightSpace
      );
      const lengthAB = calcLengthAB(
        {
          transitionLength: this.bottomRight.verticalTransitionLength,
          ...this.bottomRight,
        },
        this.halfRightSpace < 0,
        false,
        this.bottomRight.arcMovementLength +
          this.bottomRight.lengthC +
          this.bottomRight.lengthD
      ) as verticalLengthAB;
      this.bottomRight.verticalLengthA = lengthAB.verticalLengthA;
      this.bottomRight.verticalLengthB = lengthAB.verticalLengthB;
    }
    if (!radius.topLeft) {
      this.topLeft.horizontalTransitionLength = Math.min(
        this.topLeft.maxTransitionLength,
        this.actualRadius.topLeft + this.halfTopSpace
      );
      const lengthAB = calcLengthAB(
        {
          transitionLength: this.topLeft.horizontalTransitionLength,
          ...this.topLeft,
        },
        this.halfTopSpace < 0,
        true,
        this.topLeft.arcMovementLength +
          this.topLeft.lengthC +
          this.topLeft.lengthD
      ) as horizontalLengthAB;
      this.topLeft.horizontalLengthA = lengthAB.horizontalLengthA;
      this.topLeft.horizontalLengthB = lengthAB.horizontalLengthB;
    }
    if (!radius.topRight) {
      this.topRight.horizontalTransitionLength = Math.min(
        this.topRight.maxTransitionLength,
        this.actualRadius.topRight + this.halfTopSpace
      );
      const lengthAB = calcLengthAB(
        {
          transitionLength: this.topRight.horizontalTransitionLength,
          ...this.topRight,
        },
        this.halfTopSpace < 0,
        true,
        this.topRight.arcMovementLength +
          this.topRight.lengthC +
          this.topRight.lengthD
      ) as horizontalLengthAB;
      this.topRight.horizontalLengthA = lengthAB.horizontalLengthA;
      this.topRight.horizontalLengthB = lengthAB.horizontalLengthB;
    }
    if (!radius.bottomLeft) {
      this.bottomLeft.horizontalTransitionLength = Math.min(
        this.bottomLeft.maxTransitionLength,
        this.actualRadius.bottomLeft + this.halfBottomSpace
      );
      const lengthAB = calcLengthAB(
        {
          transitionLength: this.bottomLeft.horizontalTransitionLength,
          ...this.bottomLeft,
        },
        this.halfBottomSpace < 0,
        true,
        this.bottomLeft.arcMovementLength +
          this.bottomLeft.lengthC +
          this.bottomLeft.lengthD
      ) as horizontalLengthAB;
      this.bottomLeft.horizontalLengthA = lengthAB.horizontalLengthA;
      this.bottomLeft.horizontalLengthB = lengthAB.horizontalLengthB;
    }
    if (!radius.bottomRight) {
      this.bottomRight.horizontalTransitionLength = Math.min(
        this.bottomRight.maxTransitionLength,
        this.actualRadius.bottomRight + this.halfBottomSpace
      );
      const lengthAB = calcLengthAB(
        {
          transitionLength: this.bottomRight.horizontalTransitionLength,
          ...this.bottomRight,
        },
        this.halfBottomSpace < 0,
        true,
        this.bottomRight.arcMovementLength +
          this.bottomRight.lengthC +
          this.bottomRight.lengthD
      ) as horizontalLengthAB;
      this.bottomRight.horizontalLengthA = lengthAB.horizontalLengthA;
      this.bottomRight.horizontalLengthB = lengthAB.horizontalLengthB;
    }

    if (radius.topLeft)
      this.update_corner("topLeft", this.halfLeftSpace, this.halfTopSpace);
    if (radius.topRight)
      this.update_corner("topRight", this.halfRightSpace, this.halfTopSpace);
    if (radius.bottomRight)
      this.update_corner(
        "bottomRight",
        this.halfRightSpace,
        this.halfBottomSpace
      );
    if (radius.bottomLeft)
      this.update_corner(
        "bottomLeft",
        this.halfLeftSpace,
        this.halfBottomSpace
      );

    if (smoothing) {
      this.adjustTransition("top");
      this.adjustTransition("right");
      this.adjustTransition("bottom");
      this.adjustTransition("left");
    } else {
      let transitionUpdates = {
        top: false,
        right: false,
        bottom: false,
        left: false,
      };
      if (radius.topLeft) transitionUpdates.top = transitionUpdates.left = true;
      if (radius.topRight)
        transitionUpdates.top = transitionUpdates.right = true;
      if (radius.bottomRight)
        transitionUpdates.bottom = transitionUpdates.right = true;
      if (radius.bottomLeft)
        transitionUpdates.bottom = transitionUpdates.left = true;
      if (transitionUpdates.top) this.adjustTransition("top");
      if (transitionUpdates.right) this.adjustTransition("right");
      if (transitionUpdates.bottom) this.adjustTransition("bottom");
      if (transitionUpdates.left) this.adjustTransition("left");
    }
  }
  private _refreshSpace(direction: Direction) {
    switch (direction) {
      case "top":
        this.halfTopSpace =
          (this.width -
            (this.actualRadius.topLeft + this.actualRadius.topRight)) /
          2;
        this.topMerged = this.halfTopSpace <= 0;
        break;
      case "right":
        this.halfRightSpace =
          (this.height -
            (this.actualRadius.topRight + this.actualRadius.bottomRight)) /
          2;
        this.rightMerged = this.halfRightSpace <= 0;
        break;
      case "bottom":
        this.halfBottomSpace =
          (this.width -
            (this.actualRadius.bottomRight + this.actualRadius.bottomLeft)) /
          2;
        this.bottomMerged = this.halfBottomSpace <= 0;
        break;
      case "left":
        this.halfLeftSpace =
          (this.height -
            (this.actualRadius.bottomLeft + this.actualRadius.topLeft)) /
          2;
        this.leftMerged = this.halfLeftSpace <= 0;
        break;
    }
  }
  private _refreshTransitionLength(
    position: keyof CornerRadius,
    horizontal: boolean,
    space: number
  ) {
    this[position][
      horizontal ? "horizontalTransitionLength" : "verticalTransitionLength"
    ] = Math.min(
      this[position].maxTransitionLength,
      this.actualRadius[position] + space
    );
  }
  private update_corner(
    position: keyof CornerRadius,
    verticalSpace: number,
    horizontalSpace: number
  ) {
    this[position] = getPathArgsForCorner({
      radius: this.actualRadius[position],
      smoothing: this.smoothing,
      verticalSpace,
      horizontalSpace,
    });
  }
  private adjustTransition(direction: Direction) {
    switch (direction) {
      case "top":
        this._refreshTransitionLength("topLeft", true, this.halfTopSpace);
        this._refreshTransitionLength("topRight", true, this.halfTopSpace);
        break;
      case "right":
        this._refreshTransitionLength("topRight", false, this.halfRightSpace);
        this._refreshTransitionLength(
          "bottomRight",
          false,
          this.halfRightSpace
        );
        break;
      case "bottom":
        this._refreshTransitionLength("bottomLeft", true, this.halfBottomSpace);
        this._refreshTransitionLength(
          "bottomRight",
          true,
          this.halfBottomSpace
        );
        break;
      case "left":
        this._refreshTransitionLength("topLeft", false, this.halfLeftSpace);
        this._refreshTransitionLength("bottomLeft", false, this.halfLeftSpace);
        break;
    }
  }
}
