const SQRT2 = Math.sqrt(2);
const PI = Math.PI;

export type CornerParamWithDefault = {
  default?: number;
  topLeft?: number;
  topRight?: number;
  bottomRight?: number;
  bottomLeft?: number;
};
export type CornerParam = {
  topLeft?: number;
  topRight?: number;
  bottomRight?: number;
  bottomLeft?: number;
};
export type CornerRadius = {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
};

export type CornerPathArgs = {
  radius: number;
  arcMovementLength: number;
  lengthD: number;
  lengthC: number;
  verticalLengthB: number;
  horizontalLengthB: number;
  verticalLengthA: number;
  horizontalLengthA: number;
  maxTransitionLength: number;
  verticalTransitionLength: number;
  horizontalTransitionLength: number;
};

export type verticalLengthAB = {
  verticalLengthA: number;
  verticalLengthB: number;
};
export type horizontalLengthAB = {
  horizontalLengthA: number;
  horizontalLengthB: number;
};

type CornerParams = {
  radius: number;
  smoothing: number;
  verticalSpace: number;
  horizontalSpace: number;
};

type SVGPathInput = {
  height: number;
  width: number;
  topRightPathArgs: CornerPathArgs;
  bottomRightPathArgs: CornerPathArgs;
  bottomLeftPathArgs: CornerPathArgs;
  topLeftPathArgs: CornerPathArgs;
  topSpace: number;
  rightSpace: number;
  bottomSpace: number;
  leftSpace: number;
  topMerged: boolean;
  rightMerged: boolean;
  bottomMerged: boolean;
  leftMerged: boolean;
};

export function getPathArgsForCorner({
  radius,
  smoothing,
  verticalSpace,
  horizontalSpace,
}: CornerParams): CornerPathArgs {
  const maxTransitionLength = (1 + smoothing) * radius;
  const verticalTransitionLength = Math.min(
    maxTransitionLength,
    radius + verticalSpace
  );
  const horizontalTransitionLength = Math.min(
    maxTransitionLength,
    radius + horizontalSpace
  );

  const halfStandardArcAngle = 45 * (1 - smoothing);
  const arcMovementLength =
    Math.sin(toRadians(halfStandardArcAngle)) * radius * SQRT2;

  const halfComAngle = (45 - halfStandardArcAngle) / 2;
  const distance34 = radius * Math.tan(toRadians(halfComAngle));
  const transitionRadians = toRadians(45 * smoothing);
  const lengthD = distance34 * Math.sin(transitionRadians);
  const lengthC = distance34 * Math.cos(transitionRadians);

  const baseLengthCalcVal = arcMovementLength + lengthC + lengthD;
  return {
    radius,
    arcMovementLength,
    lengthC,
    lengthD,
    maxTransitionLength,
    verticalTransitionLength,
    horizontalTransitionLength,
    ...calcLengthAB(
      {
        transitionLength: verticalTransitionLength,
        arcMovementLength,
        lengthC,
        lengthD,
      },
      verticalSpace < 0,
      false,
      baseLengthCalcVal
    ),
    ...calcLengthAB(
      {
        transitionLength: horizontalTransitionLength,
        arcMovementLength,
        lengthC,
        lengthD,
      },
      horizontalSpace < 0,
      true,
      baseLengthCalcVal
    ),
  } as CornerPathArgs;
}

export function getPathFromPathArgs({
  width,
  height,
  topLeftPathArgs,
  topRightPathArgs,
  bottomLeftPathArgs,
  bottomRightPathArgs,
  topSpace,
  rightSpace,
  bottomSpace,
  leftSpace,
  topMerged,
  rightMerged,
  bottomMerged,
  leftMerged,
}: SVGPathInput) {
  function adjustTransition(
    delta: number,
    horizontal: boolean,
    arg: CornerPathArgs
  ) {
    // `- LengthB / 1.9` is a very closer shape to semicircle
    const deltaLen =
      (horizontal
        ? arg.horizontalLengthA - arg.horizontalLengthB / 1.9
        : arg.verticalLengthA - arg.verticalLengthB / 1.9) *
      Math.pow(1 - delta, 3);

    horizontal
      ? ((arg.horizontalLengthA -= deltaLen),
        (arg.horizontalLengthB += deltaLen))
      : ((arg.verticalLengthA -= deltaLen), (arg.verticalLengthB += deltaLen));
  }
  if (
    topLeftPathArgs.horizontalTransitionLength +
      topRightPathArgs.horizontalTransitionLength >=
    width
  ) {
    const fullTransitionLength =
      topLeftPathArgs.maxTransitionLength +
      topRightPathArgs.maxTransitionLength -
      topLeftPathArgs.radius -
      topRightPathArgs.radius;
    const delta = topSpace / fullTransitionLength;
    adjustTransition(delta, true, topLeftPathArgs);
    adjustTransition(delta, true, topRightPathArgs);
  }
  if (
    bottomRightPathArgs.verticalTransitionLength +
      topRightPathArgs.verticalTransitionLength >=
    height
  ) {
    const fullTransitionLength =
      bottomRightPathArgs.maxTransitionLength +
      topRightPathArgs.maxTransitionLength -
      bottomRightPathArgs.radius -
      topRightPathArgs.radius;
    const delta = rightSpace / fullTransitionLength;
    adjustTransition(delta, false, bottomRightPathArgs);
    adjustTransition(delta, false, topRightPathArgs);
  }
  if (
    bottomRightPathArgs.horizontalTransitionLength +
      bottomLeftPathArgs.horizontalTransitionLength >=
    width
  ) {
    const fullTransitionLength =
      bottomRightPathArgs.maxTransitionLength +
      bottomLeftPathArgs.maxTransitionLength -
      bottomRightPathArgs.radius -
      bottomLeftPathArgs.radius;
    const delta = bottomSpace / fullTransitionLength;
    adjustTransition(delta, true, bottomRightPathArgs);
    adjustTransition(delta, true, bottomLeftPathArgs);
  }
  if (
    topLeftPathArgs.verticalTransitionLength +
      bottomLeftPathArgs.verticalTransitionLength >=
    height
  ) {
    const fullTransitionLength =
      topLeftPathArgs.maxTransitionLength +
      bottomLeftPathArgs.maxTransitionLength -
      topLeftPathArgs.radius -
      bottomLeftPathArgs.radius;
    const delta = leftSpace / fullTransitionLength;
    adjustTransition(delta, false, topLeftPathArgs);
    adjustTransition(delta, false, bottomLeftPathArgs);
  }
  return rounded`
    M ${width - topRightPathArgs.horizontalTransitionLength} 0
    ${drawCornerPath("topRight", topRightPathArgs, rightMerged, topMerged)}
    L ${width} ${height - bottomRightPathArgs.verticalTransitionLength}
    ${drawCornerPath(
      "bottomRight",
      bottomRightPathArgs,
      rightMerged,
      bottomMerged
    )}
    L ${bottomLeftPathArgs.horizontalTransitionLength} ${height}
    ${drawCornerPath(
      "bottomLeft",
      bottomLeftPathArgs,
      leftMerged,
      bottomMerged
    )}
    L 0 ${topLeftPathArgs.verticalTransitionLength}
    ${drawCornerPath("topLeft", topLeftPathArgs, leftMerged, topMerged)}
    Z
  `
    .replace(/[\t\s\n]+/g, " ")
    .trim();
}

function drawCornerPath(
  cornerPosition: keyof CornerRadius,
  {
    radius,
    verticalLengthA,
    verticalLengthB,
    horizontalLengthA,
    horizontalLengthB,
    lengthC,
    lengthD,
    arcMovementLength,
    verticalTransitionLength,
    horizontalTransitionLength,
  }: CornerPathArgs,
  verticalMerged: boolean,
  horizontalMerged: boolean
) {
  if (radius === 0) return "";
  switch (cornerPosition) {
    case "topLeft":
      return rounded`${
        verticalMerged
          ? ""
          : `c 0 ${-verticalLengthA}
          0 ${-verticalLengthA - verticalLengthB}
          ${lengthD} ${-verticalLengthA - verticalLengthB - lengthC}`
      }
        a ${radius} ${radius} 0 0 1
        ${
          verticalMerged && horizontalMerged
            ? radius
            : horizontalMerged
            ? horizontalTransitionLength - lengthD
            : arcMovementLength + (verticalMerged ? lengthD : 0)
        }
        ${-(verticalMerged && horizontalMerged
          ? radius
          : verticalMerged
          ? verticalTransitionLength - lengthD
          : arcMovementLength + (horizontalMerged ? lengthD : 0))}
        ${
          horizontalMerged
            ? ""
            : `c ${lengthC} ${-lengthD}
          ${lengthC + horizontalLengthB} ${-lengthD}
          ${lengthC + horizontalLengthB + horizontalLengthA} ${-lengthD}`
        }
      `;
    case "topRight":
      return rounded`${
        horizontalMerged
          ? ""
          : `c ${horizontalLengthA} 0
          ${horizontalLengthA + horizontalLengthB} 0
          ${horizontalLengthA + horizontalLengthB + lengthC} ${lengthD}`
      }
        a ${radius} ${radius} 0 0 1
        ${
          verticalMerged && horizontalMerged
            ? radius
            : horizontalMerged
            ? horizontalTransitionLength - lengthD
            : arcMovementLength + (verticalMerged ? lengthD : 0)
        }
        ${
          verticalMerged && horizontalMerged
            ? radius
            : verticalMerged
            ? verticalTransitionLength - lengthD
            : arcMovementLength + (horizontalMerged ? lengthD : 0)
        }
        ${
          verticalMerged
            ? ""
            : `c ${lengthD} ${lengthC}
          ${lengthD} ${lengthC + verticalLengthB}
          ${lengthD} ${lengthC + verticalLengthB + verticalLengthA}`
        }`;
    case "bottomRight":
      return rounded`${
        verticalMerged
          ? ""
          : `
        c 0 ${verticalLengthA}
          0 ${verticalLengthA + verticalLengthB}
          ${-lengthD} ${verticalLengthA + verticalLengthB + lengthC}`
      }
        a ${radius} ${radius} 0 0 1
        ${-(verticalMerged && horizontalMerged
          ? radius
          : horizontalMerged
          ? horizontalTransitionLength - lengthD
          : arcMovementLength + (verticalMerged ? lengthD : 0))}
        ${
          verticalMerged && horizontalMerged
            ? radius
            : verticalMerged
            ? verticalTransitionLength - lengthD
            : arcMovementLength + (horizontalMerged ? lengthD : 0)
        }
        ${
          horizontalMerged
            ? ""
            : `c ${-lengthC} ${lengthD}
          ${-lengthC - horizontalLengthB} ${lengthD}
          ${-lengthC - horizontalLengthB - horizontalLengthA} ${lengthD}`
        }`;
    case "bottomLeft":
      return rounded`${
        horizontalMerged
          ? ""
          : `
        c ${-horizontalLengthA} 0
          ${-horizontalLengthA - horizontalLengthB} 0
          ${-horizontalLengthA - horizontalLengthB - lengthC} ${-lengthD}`
      }
        a ${radius} ${radius} 0 0 1
        ${-(verticalMerged && horizontalMerged
          ? radius
          : horizontalMerged
          ? horizontalTransitionLength - lengthD
          : arcMovementLength + (verticalMerged ? lengthD : 0))}
        ${-(verticalMerged && horizontalMerged
          ? radius
          : verticalMerged
          ? verticalTransitionLength - lengthD
          : arcMovementLength + (horizontalMerged ? lengthD : 0))}
        ${
          verticalMerged
            ? ""
            : `c ${-lengthD} ${-lengthC}
          ${-lengthD} ${-lengthC - verticalLengthB}
          ${-lengthD} ${-lengthC - verticalLengthB - verticalLengthA}`
        }`;
  }
}

export function calcLengthAB(
  arg: {
    transitionLength: number;
    arcMovementLength: number;
    lengthC: number;
    lengthD: number;
  },
  noSpace: boolean,
  horizontal: boolean,
  baseLengthCalcVal: number
): verticalLengthAB | horizontalLengthAB {
  if (horizontal) {
    const horizontalLengthB = noSpace
      ? 0
      : (arg.transitionLength - baseLengthCalcVal) / 3;
    return {
      horizontalLengthB,
      horizontalLengthA: noSpace ? 0 : 2 * horizontalLengthB,
    };
  } else {
    const verticalLengthB = noSpace
      ? 0
      : (arg.transitionLength - baseLengthCalcVal) / 3;
    return {
      verticalLengthB,
      verticalLengthA: noSpace ? 0 : 2 * verticalLengthB,
    };
  }
}

export function rectangle(height: number, width: number) {
  return rounded`M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`;
}

export function roundedRectangle(
  height: number,
  width: number,
  radius: number | CornerParamWithDefault
) {
  if (typeof radius === "object") {
    return rounded`M ${width - radius.topRight!} 0
    a ${radius.topRight!} ${radius.topRight!} 0 0 1 ${radius.topRight!} ${radius.topRight!}
    L ${width} ${height - radius.bottomRight!}
    a ${radius.bottomRight!} ${radius.bottomRight!} 0 0 1 ${-radius.bottomRight!} ${radius.bottomRight!}
    L ${radius.bottomLeft!} ${height}
    a ${radius.bottomLeft!} ${radius.bottomLeft!} 0 0 1 ${-radius.bottomLeft!} ${-radius.bottomLeft!}
    L 0 ${radius.topLeft!}
    a ${radius.topLeft!} ${radius.topLeft!} 0 0 1 ${radius.topLeft!} ${-radius.topLeft!}
    Z`
      .replace(/[\t\s\n]+/g, " ")
      .trim();
  } else
    return rounded`M ${width - radius} 0
    a ${radius} ${radius} 0 0 1 ${radius} ${radius}
    L ${width} ${height - radius}
    a ${radius} ${radius} 0 0 1 ${-radius} ${radius}
    L ${radius} ${height}
    a ${radius} ${radius} 0 0 1 ${-radius} ${-radius}
    L 0 ${radius}
    a ${radius} ${radius} 0 0 1 ${radius} ${-radius}
    Z`
      .replace(/[\t\s\n]+/g, " ")
      .trim();
}

function toRadians(degrees: number) {
  return (degrees * PI) / 180;
}

function rounded(
  strings: TemplateStringsArray,
  ...values: (number | string)[]
): string {
  return strings.reduce((acc, str, i) => {
    const value = values[i];

    if (typeof value === "number") {
      return (
        acc +
        str +
        (Number.isInteger(value) ? value.toString() : value.toFixed(4))
      );
    } else {
      return acc + str + (value ?? "");
    }
  }, "");
}
