import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons-ng";
import path from "node:path";

export default defineConfig({
  plugins: [
    solidPlugin(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/icons")],
    }),
  ],
  build: {
    target: "esnext",
  },
});
