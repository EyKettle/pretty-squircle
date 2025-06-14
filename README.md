# Pretty Squircle

[![Stable Release](https://img.shields.io/npm/v/pretty-squircle)](https://npm.im/pretty-squircle) [![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

Figma squircle but pretty prefect.
There's a [website](https://squircle.eykettle.top) to get a preview.

This project is refactor from `figma-squircle`.
See [this](https://github.com/phamfoo/figma-squircle) to learn what's it.

## Installation

```sh
npm i pretty-squircle
```

## Usage

```jsx
import { getSquirclePath } from "pretty-squircle";

const svgPath = getSquirclePath({
  width: 200,
  height: 200,
  cornerRadius: 24,
  cornerSmoothing: 0.8, // From 0 to 1
});

const svgPath = getSquirclePath({
  width: 200,
  height: 200,
  cornerRadius: {
    default: 24,
    topLeft: 48,
  }, // Also use a object to set radius individually
  cornerSmoothing: 0.8,
});

// The result is a svg path you can use it to create svg element
function PinkSquircle() {
  return (
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <path d={svgPath} fill="pink" />
    </svg>
  );
}

// Or with the clip-path CSS property
function ProfilePicture() {
  return (
    <div
      style={{
        width: 200,
        height: 200,
        clipPath: `path('${svgPath}')`,
      }}
    >
      ...
    </div>
  );
}
```

## Mini Version

There's also a mini version for uniform corner squircle.

```jsx
import { getSquirclePath } from "pretty-squircle/mini";

const svgPath = getSquirclePath({
  width: 200,
  height: 200,
  cornerRadius: 24, // Only support `number`
  cornerSmoothing: 0.8,
});
```

## Attention

I deleted `preserveSmoothing` because there's no need to use it to get a better shape.

## Thanks

- Figma team's [article](https://www.figma.com/blog/desperately-seeking-squircles/) as the original ideas.
- [`figma-squircle`](https://github.com/phamfoo/figma-squircle) as the original project.
