export type CornerRadiusParam =
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
  arcMovementLength: number;
  verticalLengthB: number;
  horizontalLengthB: number;
  verticalLengthA: number;
  horizontalLengthA: number;
};

type CornerParams = {
  radius: number;
  halfStandardArcAngle: number;
  lengthC: number;
  lengthD: number;
  verticalTransitionLength: number;
  horizontalTransitionLength: number;
};

type SVGPathInput = {
  radius: number;
  height: number;
  width: number;
  lengthC: number;
  lengthD: number;
  cornerArgs: CornerPathArgs;
  maxTransitionLength: number;
  verticalTransitionLength: number;
  horizontalTransitionLength: number;
  verticalMerged: boolean;
  horizontalMerged: boolean;
};

export function getPathArgsForCorner({
  radius,
  halfStandardArcAngle,
  lengthC,
  lengthD,
  verticalTransitionLength,
  horizontalTransitionLength,
}: CornerParams): CornerPathArgs {
  const arcMovementLength =
    Math.sin(toRadians(halfStandardArcAngle)) * radius * Math.sqrt(2);

  const verticalLengthB =
    (verticalTransitionLength - arcMovementLength - lengthC - lengthD) / 3;
  const verticalLengthA = 2 * verticalLengthB;
  const horizontalLengthB =
    (horizontalTransitionLength - arcMovementLength - lengthC - lengthD) / 3;
  const horizontalLengthA = 2 * horizontalLengthB;

  return {
    arcMovementLength,
    verticalLengthA,
    horizontalLengthA,
    verticalLengthB,
    horizontalLengthB,
  };
}

export function getPathFromPathArgs({
  radius,
  width,
  height,
  lengthC,
  lengthD,
  cornerArgs: cornerPathArgs,
  maxTransitionLength,
  verticalTransitionLength,
  horizontalTransitionLength,
  verticalMerged: verticalSemicircle,
  horizontalMerged: horizontalSemicircle,
}: SVGPathInput) {
  let horizontalPathArgs = { ...cornerPathArgs };
  function adjustTransition(
    delta: number,
    horizontal: boolean,
    {
      horizontalLengthA,
      horizontalLengthB,
      verticalLengthA,
      verticalLengthB,
    }: CornerPathArgs
  ) {
    // `- LengthB / 3` For a closer shape to semicircle
    const deltaLen =
      (horizontal
        ? horizontalLengthA - horizontalLengthB / 3
        : verticalLengthA - verticalLengthB / 3) * Math.pow(1 - delta, 3);
    horizontal
      ? ((horizontalLengthA -= deltaLen), (horizontalLengthB += deltaLen))
      : ((verticalLengthA -= deltaLen), (verticalLengthB += deltaLen));
  }
  if (verticalTransitionLength >= height / 2) {
    const delta =
      (verticalTransitionLength - radius) / (maxTransitionLength - radius);
    adjustTransition(delta, false, cornerPathArgs);
  }
  if (horizontalTransitionLength >= width / 2) {
    const delta =
      (horizontalTransitionLength - radius) / (maxTransitionLength - radius);
    adjustTransition(delta, true, horizontalPathArgs);
  }
  return rounded`
    M ${
      verticalSemicircle
        ? `${width} ${horizontalTransitionLength}`
        : `${width - horizontalTransitionLength} 0`
    }
    ${
      verticalSemicircle || horizontalSemicircle
        ? ""
        : drawCornerPath("topRight", radius, lengthC, lengthD, cornerPathArgs)
    }
    ${
      horizontalSemicircle
        ? drawSemicircle(
            "right",
            height,
            width,
            radius,
            lengthC,
            lengthD,
            cornerPathArgs
          )
        : `L ${width} ${height - verticalTransitionLength}`
    }
    ${
      verticalSemicircle || horizontalSemicircle
        ? ""
        : drawCornerPath(
            "bottomRight",
            radius,
            lengthC,
            lengthD,
            cornerPathArgs
          )
    }
    ${
      verticalSemicircle
        ? drawSemicircle(
            "bottom",
            height,
            width,
            radius,
            lengthC,
            lengthD,
            cornerPathArgs
          )
        : `L ${horizontalTransitionLength} ${height}`
    }
    ${
      verticalSemicircle || horizontalSemicircle
        ? ""
        : drawCornerPath("bottomLeft", radius, lengthC, lengthD, cornerPathArgs)
    }
    ${
      horizontalSemicircle
        ? drawSemicircle(
            "left",
            height,
            width,
            radius,
            lengthC,
            lengthD,
            cornerPathArgs
          )
        : `L 0 ${verticalTransitionLength}`
    }
    ${
      verticalSemicircle || horizontalSemicircle
        ? ""
        : drawCornerPath("topLeft", radius, lengthC, lengthD, cornerPathArgs)
    }
    ${
      verticalSemicircle
        ? drawSemicircle(
            "top",
            height,
            width,
            radius,
            lengthC,
            lengthD,
            cornerPathArgs
          )
        : ""
    }
    Z
  `
    .replace(/[\t\s\n]+/g, " ")
    .trim();
}

function drawCornerPath(
  cornerPosition: CornerPosition,
  radius: number,
  lengthC: number,
  lengthD: number,
  {
    verticalLengthA,
    verticalLengthB,
    horizontalLengthA,
    horizontalLengthB,
    arcMovementLength,
  }: CornerPathArgs
) {
  switch (cornerPosition) {
    case "topLeft":
      return rounded`
        c 0 ${-verticalLengthA}
          0 ${-verticalLengthA - verticalLengthB}
          ${lengthD} ${-verticalLengthA - verticalLengthB - lengthC}
        a ${radius} ${radius} 0 0 1 ${arcMovementLength} ${-arcMovementLength}
        c ${lengthC} ${-lengthD}
          ${lengthC + horizontalLengthB} ${-lengthD}
          ${lengthC + horizontalLengthB + horizontalLengthA} ${-lengthD}`;
    case "topRight":
      return rounded`
        c ${horizontalLengthA} 0
          ${horizontalLengthA + horizontalLengthB} 0
          ${horizontalLengthA + horizontalLengthB + lengthC} ${lengthD}
        a ${radius} ${radius} 0 0 1 ${arcMovementLength} ${arcMovementLength}
        c ${lengthD} ${lengthC}
          ${lengthD} ${lengthC + verticalLengthB}
          ${lengthD} ${lengthC + verticalLengthB + verticalLengthA}`;
    case "bottomRight":
      return rounded`
        c 0 ${verticalLengthA}
          0 ${verticalLengthA + verticalLengthB}
          ${-lengthD} ${verticalLengthA + verticalLengthB + lengthC}
        a ${radius} ${radius} 0 0 1 ${-arcMovementLength} ${arcMovementLength}
        c ${-lengthC} ${lengthD}
          ${-lengthC - horizontalLengthB} ${lengthD}
          ${-lengthC - horizontalLengthB - horizontalLengthA} ${lengthD}`;
    case "bottomLeft":
      return rounded`
        c ${-horizontalLengthA} 0
          ${-horizontalLengthA - horizontalLengthB} 0
          ${-horizontalLengthA - horizontalLengthB - lengthC} ${-lengthD}
        a ${radius} ${radius} 0 0 1 ${-arcMovementLength} ${-arcMovementLength}
        c ${-lengthD} ${-lengthC}
          ${-lengthD} ${-lengthC - verticalLengthB}
          ${-lengthD} ${-lengthC - verticalLengthB - verticalLengthA}`;
  }
}

function drawSemicircle(
  position: "left" | "top" | "right" | "bottom",
  height: number,
  width: number,
  radius: number,
  lengthC: number,
  lengthD: number,
  {
    verticalLengthA,
    verticalLengthB,
    horizontalLengthA,
    horizontalLengthB,
  }: CornerPathArgs
) {
  switch (position) {
    case "left":
      return rounded`
        c ${-horizontalLengthA} 0
          ${-horizontalLengthA - horizontalLengthB} 0
          ${-horizontalLengthA - horizontalLengthB - lengthC} ${-lengthD}
        a ${radius} ${radius} 0 0 1 0 ${-(height - 2 * lengthD)}
        c ${lengthC} ${-lengthD}
          ${lengthC + horizontalLengthB} ${-lengthD}
          ${lengthC + horizontalLengthB + horizontalLengthA} ${-lengthD}`;
    case "top":
      return rounded`
        c 0 ${-verticalLengthA}
          0 ${-verticalLengthA - verticalLengthB}
          ${lengthD} ${-verticalLengthA - verticalLengthB - lengthC}
        a ${radius} ${radius} 0 0 1 ${width - 2 * lengthD} 0
        c ${lengthD} ${lengthC}
          ${lengthD} ${lengthC + verticalLengthB}
          ${lengthD} ${lengthC + verticalLengthB + verticalLengthA}`;
    case "right":
      return rounded`
        c ${horizontalLengthA} 0
          ${horizontalLengthA + horizontalLengthB} 0
          ${horizontalLengthA + horizontalLengthB + lengthC} ${lengthD}
        a ${radius} ${radius} 0 0 1 0 ${height - 2 * lengthD}
        c ${-lengthC} ${lengthD}
          ${-lengthC - horizontalLengthB} ${lengthD}
          ${-lengthC - horizontalLengthB - horizontalLengthA} ${lengthD}`;
    case "bottom":
      return rounded`
        c 0 ${verticalLengthA}
          0 ${verticalLengthA + verticalLengthB}
          ${-lengthD} ${verticalLengthA + verticalLengthB + lengthC}
        a ${radius} ${radius} 0 0 1 ${-(width - 2 * lengthD)} 0
        c ${-lengthD} ${-lengthC}
          ${-lengthD} ${-lengthC - verticalLengthB}
          ${-lengthD} ${-lengthC - verticalLengthB - verticalLengthA}`;
  }
}

export function rectangle(height: number, width: number) {
  return rounded`M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`;
}

export function roundedRectangle(
  height: number,
  width: number,
  radius: number
) {
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

export function toRadians(degrees: number) {
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
