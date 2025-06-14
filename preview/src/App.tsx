import {
  createEffect,
  createSignal,
  Setter,
  Show,
  type Component,
} from "solid-js";
import { DynamicSquircle, getSquirclePath } from "./debug_squircle";
import { DOMElement } from "solid-js/jsx-runtime";

const App: Component = () => {
  const [draggingTarget, setDraggingTarget] = createSignal<
    HTMLInputElement | undefined
  >(undefined);
  let draggingPosition = 0;
  let draggingBase = 0;
  let draggingSetter: Setter<number> | undefined;

  const [height, setHeight] = createSignal(200);
  const [width, setWidth] = createSignal(400);
  const [smoothing, setSmoothing] = createSignal(0.8);
  const [topLeft, setTopLeft] = createSignal(100);
  const [topRight, setTopRight] = createSignal(100);
  const [bottomRight, setBottomRight] = createSignal(100);
  const [bottomLeft, setBottomLeft] = createSignal(100);
  const dynamicSquircle = new DynamicSquircle(
    {
      topLeft: topLeft(),
      topRight: topRight(),
      bottomLeft: bottomLeft(),
      bottomRight: bottomRight(),
    },
    smoothing(),
    {
      height: height(),
      width: width(),
    }
  );
  const [path, setPath] = createSignal(dynamicSquircle.manualDraw());
  createEffect(() => {
    // setPath(
    //   getSquirclePath({
    //     cornerRadius: {
    //       topLeft: topLeft(),
    //       topRight: topRight(),
    //       bottomLeft: bottomLeft(),
    //       bottomRight: bottomRight(),
    //     },
    //     cornerSmoothing: smoothing(),
    //     width: width(),
    //     height: height(),
    //   })
    // );
    const updated = dynamicSquircle.update(
      height(),
      width(),
      {
        topLeft: topLeft(),
        topRight: topRight(),
        bottomLeft: bottomLeft(),
        bottomRight: bottomRight(),
      },
      smoothing()
    );
    if (updated) setPath(updated);
  });

  const inputLimit = (
    e: Event & { currentTarget: HTMLInputElement },
    setter: Setter<number>
  ) => {
    let value = parseFloat(e.currentTarget.value);
    if (value < 0) {
      e.currentTarget.value = "0";
      value = 0;
    }
    setter(value);
  };

  const handleTarget = (
    e: MouseEvent & {
      currentTarget: SVGSVGElement;
      target: DOMElement;
    },
    setter: Setter<number>
  ) => {
    const icon = e.currentTarget.parentElement!.children[0] as SVGSVGElement;
    icon.style.backgroundColor = "var(--color-back-press)";
    icon.style.fill = "var(--color-text)";
    setDraggingTarget(
      e.currentTarget.parentElement!.children[1] as HTMLInputElement
    );
    draggingPosition = e.x;
    draggingBase = parseFloat(draggingTarget()!.value);
    draggingSetter = setter;
  };
  const handleDragging = (
    e: MouseEvent & {
      currentTarget: HTMLDivElement;
      target: DOMElement;
    }
  ) => {
    const delta = Math.floor(e.x - draggingPosition);
    let value = Math.max(0, draggingBase + delta);
    draggingTarget()!.value = value.toString();
    draggingSetter?.(value);
  };
  const releaseDragging = () => {
    const icon = draggingTarget()?.parentElement?.children[0] as SVGSVGElement;
    icon.style.backgroundColor = "";
    icon.style.fill = "";
    setDraggingTarget(undefined);
  };

  return (
    <div class="full-box">
      <div
        style={{
          display: "grid",
          "place-items": "center",
          "grid-template-columns": "calc(100vw - 26rem) 26rem",
        }}
      >
        <div
          id="svg"
          style={{
            overflow: "visible",
            position: "relative",
            height: height() + "px",
            width: width() + "px",
            filter: "drop-shadow(0 16px 32px #72a6e04d)",
          }}
        >
          <div
            style={{
              position: "absolute",
              height: "100%",
              width: "100%",
              "clip-path": `path("${path()}")`,
            }}
          >
            <div
              style={{
                position: "absolute",
                height: "100%",
                width: "100%",
                "background-color": "white",
              }}
            />
            <div
              style={{
                position: "absolute",
                height: "100%",
                width: "100%",
                "background-color": "#72A6E0",
                "clip-path": `path("${path()}")`,
                translate: "0 1px",
              }}
            />
          </div>
        </div>
        <header
          style={{
            display: "grid",
            height: "100%",
            width: "26rem",
            padding: "1rem",
            "box-sizing": "border-box",
            "grid-template-rows": "auto auto auto 1fr",
            gap: "1.5rem",
            border: "solid var(--color-border-default)",
            "border-width": "0 0 0 1px",
            "background-color": "var(--color-back-main)",
            "box-shadow": "0 0 1.5rem var(--color-shadow)",
            "backdrop-filter": "blur(32px) saturate(120%)",
          }}
        >
          <section
            style={{
              display: "grid",
              "grid-template-rows": "auto auto",
              "grid-template-columns": "1fr 1fr",
              gap: "1rem",
            }}
          >
            <h1 style={{ "grid-column": "1/3" }}>Size</h1>
            <div class="input-wrapper">
              <svg class="icon" onMouseDown={(e) => handleTarget(e, setWidth)}>
                <use href="#icon-Width" />
              </svg>
              <input
                type="number"
                min={0}
                value={width()}
                onChange={(e) => inputLimit(e, setWidth)}
              />
            </div>
            <div class="input-wrapper">
              <svg
                class="icon"
                style={{ rotate: "90deg" }}
                onMouseDown={(e) => handleTarget(e, setHeight)}
              >
                <use href="#icon-Width" />
              </svg>
              <input
                type="number"
                min={0}
                value={height()}
                onChange={(e) => inputLimit(e, setHeight)}
              />
            </div>
          </section>
          <section
            style={{
              display: "grid",
              "grid-template-rows": "auto auto auto auto auto",
              "grid-template-columns": "1fr 1fr",
              gap: "1rem",
            }}
          >
            <h1 style={{ "grid-column": "1/3" }}>Radius</h1>
            <h2>TopLeft</h2>
            <h2>TopRight</h2>
            <div class="input-wrapper">
              <svg
                class="icon"
                onMouseDown={(e) => handleTarget(e, setTopLeft)}
              >
                <use href="#icon-Radius" />
              </svg>
              <input
                type="number"
                min={0}
                value={topLeft()}
                onChange={(e) => inputLimit(e, setTopLeft)}
              />
            </div>
            <div class="input-wrapper">
              <svg
                class="icon"
                style={{ rotate: "90deg" }}
                onMouseDown={(e) => handleTarget(e, setTopRight)}
              >
                <use href="#icon-Radius" />
              </svg>
              <input
                type="number"
                min={0}
                value={topRight()}
                onChange={(e) => inputLimit(e, setTopRight)}
              />
            </div>
            <h2>BottomLeft</h2>
            <h2>BottomRight</h2>
            <div class="input-wrapper">
              <svg
                class="icon"
                style={{ rotate: "-90deg" }}
                onMouseDown={(e) => handleTarget(e, setBottomLeft)}
              >
                <use href="#icon-Radius" />
              </svg>
              <input
                type="number"
                min={0}
                value={bottomLeft()}
                onChange={(e) => inputLimit(e, setBottomLeft)}
              />
            </div>
            <div class="input-wrapper">
              <svg
                class="icon"
                style={{ rotate: "180deg" }}
                onMouseDown={(e) => handleTarget(e, setBottomRight)}
              >
                <use href="#icon-Radius" />
              </svg>
              <input
                type="number"
                min={0}
                value={bottomRight()}
                onChange={(e) => inputLimit(e, setBottomRight)}
              />
            </div>
          </section>
          <section
            style={{
              display: "flex",
              "flex-direction": "column",
              gap: "0.5rem",
            }}
          >
            <Switch label="Show Points" onSwitch={() => {}} />
            <div
              style={{
                display: "grid",
                "grid-template-columns": "1fr auto",
                "margin-top": "0.5rem",
              }}
            >
              <h2>Corner Smoothing</h2>
              <h2>{Math.round(smoothing() * 100) + "%"}</h2>
            </div>
            <input
              type="range"
              value={Math.round(smoothing() * 100)}
              min={0}
              max={100}
              onInput={(e) => {
                let value = parseFloat(e.currentTarget.value) / 100;
                if (value < 0) {
                  e.currentTarget.value = "0";
                  value = 0;
                }
                setSmoothing(value);
              }}
            />
          </section>
          <section
            style={{
              display: "flex",
              "flex-direction": "column",
              gap: "1rem",
            }}
          >
            <button onClick={() => navigator.clipboard.writeText(path() ?? "")}>
              Copy Path
            </button>
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  `<svg id="squircle" height="${height()}" width="${width()}" xmlns="http://www.w3.org/2000/svg"><path d="${path()}" fill="#72a6e0"></path></svg>`
                )
              }
            >
              Copy SVG
            </button>
            <button
              onClick={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.textContent = "Running Test";
                el.style.pointerEvents = "none";
                // const prevSmoothing = smoothing();
                // const prevHeight = height();
                // const prevWidth = width();
                // const prevTopLeft = topLeft();
                // const prevTopRight = topRight();
                // const prevBottomRight = bottomRight();
                // const prevBottomLeft = bottomLeft();
                const startTime = Date.now();
                new Promise<void>((resolve) => {
                  // const squircle = new DynamicSquircle(
                  //   {
                  //     topLeft: Math.random() * 2000,
                  //     topRight: Math.random() * 2000,
                  //     bottomRight: Math.random() * 2000,
                  //     bottomLeft: Math.random() * 2000,
                  //   },
                  //   Math.random(),
                  //   {
                  //     height: Math.random() * 2000,
                  //     width: Math.random() * 2000,
                  //   }
                  // );
                  for (let index = 0; index < 10000; index++) {
                    // squircle.update(
                    //   Math.random() * 2000,
                    //   Math.random() * 2000,
                    //   {
                    //     topLeft: Math.random() * 2000,
                    //     topRight: Math.random() * 2000,
                    //     bottomRight: Math.random() * 2000,
                    //     bottomLeft: Math.random() * 2000,
                    //   },
                    //   Math.random()
                    // );
                    getSquirclePath({
                      cornerRadius: {
                        topLeft: Math.random() * 2000,
                        topRight: Math.random() * 2000,
                        bottomRight: Math.random() * 2000,
                        bottomLeft: Math.random() * 2000,
                      },
                      cornerSmoothing: Math.random(),
                      height: Math.random() * 2000,
                      width: Math.random() * 2000,
                    });
                    // setSmoothing(Math.random());
                    // setHeight(Math.random() * 2000);
                    // setWidth(Math.random() * 2000);
                    // setTopLeft(Math.random() * 2000);
                    // setTopRight(Math.random() * 2000);
                    // setBottomRight(Math.random() * 2000);
                    // setBottomLeft(Math.random() * 2000);
                  }
                  resolve();
                }).then(() => {
                  el.textContent = Date.now() - startTime + "ms";
                  el.style.pointerEvents = "";
                  // setSmoothing(prevSmoothing);
                  // setHeight(prevHeight);
                  // setWidth(prevWidth);
                  // setTopLeft(prevTopLeft);
                  // setTopRight(prevTopRight);
                  // setBottomRight(prevBottomRight);
                  // setBottomLeft(prevBottomLeft);
                });
              }}
            >
              Stress Test
            </button>
          </section>
        </header>
      </div>
      <Show when={draggingTarget()}>
        <div
          onMouseMove={handleDragging}
          onMouseUp={() => releaseDragging()}
          onMouseLeave={() => releaseDragging()}
          style={{
            position: "absolute",
            inset: 0,
            cursor: "w-resize",
          }}
        />
      </Show>
    </div>
  );
};

interface SwitchProps {
  label: string;
  onSwitch: () => void;
}

const Switch: Component<SwitchProps> = ({ label }) => {
  return (
    <div
      class="switch"
      style={{
        "user-select": "none",
      }}
      onClick={(e) => {
        const checkbox = e.currentTarget.children[0] as HTMLInputElement;
        checkbox.checked = !checkbox.checked;
      }}
    >
      <input type="checkbox" id={label} />
      <label for={label}>{label}</label>
    </div>
  );
};

export default App;
