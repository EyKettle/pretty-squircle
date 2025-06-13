export type CornerRadius =
  | number
  | {
      default?: number;
      topLeft?: number;
      topRight?: number;
      bottomRight?: number;
      bottomLeft?: number;
    };

type CornerPosition = "topLeft" | "topRight" | "bottomRight" | "bottomLeft";

type CornerPathArgs = {
  cornerRadius: number;
  arcMovementLength: number;
  lengthD: number;
  lengthC: number;
  verticalLengthB: number;
  horizontalLengthB: number;
  verticalLengthA: number;
  horizontalLengthA: number;
  verticalSpace: number;
  horizontalSpace: number;
  maxTransitionLength: number;
  verticalTransitionLength: number;
  horizontalTransitionLength: number;
};

type CornerParams = {
  cornerRadius: number;
  cornerSmoothing: number;
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
  topMerged: boolean;
  rightMerged: boolean;
  bottomMerged: boolean;
  leftMerged: boolean;
};

export function getPathArgsForCorner({
  cornerRadius,
  cornerSmoothing,
  verticalSpace,
  horizontalSpace,
}: CornerParams): CornerPathArgs {
  const maxTransitionLength = (1 + cornerSmoothing) * cornerRadius;
  const verticalTransitionLength = Math.min(
    maxTransitionLength,
    cornerRadius + verticalSpace
  );
  const horizontalTransitionLength = Math.min(
    maxTransitionLength,
    cornerRadius + horizontalSpace
  );

  const halfStandardArcAngle = 45 * (1 - cornerSmoothing);
  const arcMovementLength =
    Math.sin(toRadians(halfStandardArcAngle)) * cornerRadius * Math.sqrt(2);

  const halfComAngle = (45 - halfStandardArcAngle) / 2;
  const distance34 = cornerRadius * Math.tan(toRadians(halfComAngle));
  const transitionRadians = toRadians(45 * cornerSmoothing);
  const lengthD = distance34 * Math.sin(transitionRadians);
  const lengthC = distance34 * Math.cos(transitionRadians);

  const verticalLengthB =
    (verticalTransitionLength - arcMovementLength - lengthC - lengthD) / 3;
  const verticalLengthA = 2 * verticalLengthB;
  const horizontalLengthB =
    (horizontalTransitionLength - arcMovementLength - lengthC - lengthD) / 3;
  const horizontalLengthA = 2 * horizontalLengthB;

  return {
    cornerRadius,
    arcMovementLength,
    lengthC,
    lengthD,
    verticalLengthA,
    horizontalLengthA,
    verticalLengthB,
    horizontalLengthB,
    verticalSpace,
    horizontalSpace,
    maxTransitionLength,
    verticalTransitionLength,
    horizontalTransitionLength,
  };
}

export function getPathFromPathArgs({
  width,
  height,
  topLeftPathArgs,
  topRightPathArgs,
  bottomLeftPathArgs,
  bottomRightPathArgs,
  topMerged,
  rightMerged,
  bottomMerged,
  leftMerged,
}: SVGPathInput) {
  function adjustTransition(
    delta: number,
    horizontal: boolean,
    args: CornerPathArgs
  ) {
    // `- LengthB / 3` For a closer shape to semicircle
    const deltaLen =
      (horizontal
        ? args.horizontalLengthA - args.horizontalLengthB / 2
        : args.verticalLengthA - args.verticalLengthB / 2) *
      Math.pow(1 - delta, 3);
    horizontal
      ? ((args.horizontalLengthA -= deltaLen),
        (args.horizontalLengthB += deltaLen))
      : ((args.verticalLengthA -= deltaLen),
        (args.verticalLengthB += deltaLen));
  }
  if (
    topLeftPathArgs.horizontalTransitionLength +
      topRightPathArgs.horizontalTransitionLength ===
    width
  ) {
    const fullTransitionLength =
      topLeftPathArgs.maxTransitionLength +
      topRightPathArgs.maxTransitionLength -
      topLeftPathArgs.cornerRadius -
      topRightPathArgs.cornerRadius;
    const delta =
      (topLeftPathArgs.horizontalSpace + topRightPathArgs.horizontalSpace) /
      fullTransitionLength;
    adjustTransition(delta, true, topLeftPathArgs);
    adjustTransition(delta, true, topRightPathArgs);
  }
  if (
    bottomRightPathArgs.verticalTransitionLength +
      topRightPathArgs.verticalTransitionLength ===
    height
  ) {
    const fullTransitionLength =
      bottomRightPathArgs.maxTransitionLength +
      topRightPathArgs.maxTransitionLength -
      bottomRightPathArgs.cornerRadius -
      topRightPathArgs.cornerRadius;
    const delta =
      (bottomRightPathArgs.verticalSpace + topRightPathArgs.verticalSpace) /
      fullTransitionLength;
    adjustTransition(delta, false, bottomRightPathArgs);
    adjustTransition(delta, false, topRightPathArgs);
  }
  if (
    bottomRightPathArgs.horizontalTransitionLength +
      bottomLeftPathArgs.horizontalTransitionLength ===
    width
  ) {
    const fullTransitionLength =
      bottomRightPathArgs.maxTransitionLength +
      bottomLeftPathArgs.maxTransitionLength -
      bottomRightPathArgs.cornerRadius -
      bottomLeftPathArgs.cornerRadius;
    const delta =
      (bottomRightPathArgs.horizontalSpace +
        bottomLeftPathArgs.horizontalSpace) /
      fullTransitionLength;
    adjustTransition(delta, true, bottomRightPathArgs);
    adjustTransition(delta, true, bottomLeftPathArgs);
  }
  if (
    topLeftPathArgs.verticalTransitionLength +
      bottomLeftPathArgs.verticalTransitionLength ===
    height
  ) {
    const fullTransitionLength =
      topLeftPathArgs.maxTransitionLength +
      bottomLeftPathArgs.maxTransitionLength -
      topLeftPathArgs.cornerRadius -
      bottomLeftPathArgs.cornerRadius;
    const delta =
      (topLeftPathArgs.verticalSpace + bottomLeftPathArgs.verticalSpace) /
      fullTransitionLength;
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
  cornerPosition: CornerPosition,
  {
    cornerRadius,
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
  if (cornerRadius === 0) return "";
  switch (cornerPosition) {
    case "topLeft":
      return rounded`${
        verticalMerged
          ? ""
          : `c 0 ${-verticalLengthA}
          0 ${-verticalLengthA - verticalLengthB}
          ${lengthD} ${-verticalLengthA - verticalLengthB - lengthC}`
      }
        a ${cornerRadius} ${cornerRadius} 0 0 1
        ${
          verticalMerged && horizontalMerged
            ? cornerRadius
            : horizontalMerged
            ? horizontalTransitionLength - lengthD
            : arcMovementLength + (verticalMerged ? lengthD : 0)
        }
        ${-(verticalMerged && horizontalMerged
          ? cornerRadius
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
        a ${cornerRadius} ${cornerRadius} 0 0 1
        ${
          verticalMerged && horizontalMerged
            ? cornerRadius
            : horizontalMerged
            ? horizontalTransitionLength - lengthD
            : arcMovementLength + (verticalMerged ? lengthD : 0)
        }
        ${
          verticalMerged && horizontalMerged
            ? cornerRadius
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
        a ${cornerRadius} ${cornerRadius} 0 0 1
        ${-(verticalMerged && horizontalMerged
          ? cornerRadius
          : horizontalMerged
          ? horizontalTransitionLength - lengthD
          : arcMovementLength + (verticalMerged ? lengthD : 0))}
        ${
          verticalMerged && horizontalMerged
            ? cornerRadius
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
        a ${cornerRadius} ${cornerRadius} 0 0 1
        ${-(verticalMerged && horizontalMerged
          ? cornerRadius
          : horizontalMerged
          ? horizontalTransitionLength - lengthD
          : arcMovementLength + (verticalMerged ? lengthD : 0))}
        ${-(verticalMerged && horizontalMerged
          ? cornerRadius
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

export function rectangle(height: number, width: number) {
  return rounded`M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`;
}

export function roundedRectangle(
  height: number,
  width: number,
  radius: CornerRadius
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
  return (degrees * Math.PI) / 180;
}

function rounded(
  strings: TemplateStringsArray,
  ...values: (number | string)[]
): string {
  return strings.reduce((acc, str, i) => {
    const value = values[i];

    if (typeof value === "number") {
      return acc + str + value.toFixed(4);
    } else {
      return acc + str + (value ?? "");
    }
  }, "");
}
