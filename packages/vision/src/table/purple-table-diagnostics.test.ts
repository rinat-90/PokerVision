import { describe, it } from "vitest";

import {
  SharpImageDecoder
} from "../image/sharp-image-decoder.js";

import fs from "node:fs/promises";

describe(
  "Purple table diagnostics",
  () => {
    it(
      "prints purple pixel distribution",
      async () => {
        const data =
          await fs.readFile(
            new URL(
              "../../../video/fixtures/real/table-frame.jpg",
              import.meta.url
            )
          );

        const decoder =
          new SharpImageDecoder();

        const image =
          await decoder.decode(
            new Uint8Array(data)
          );

        const channels =
          image.channels;

        const rows = 20;

        const pixelsPerRow =
          Math.ceil(
            image.height / rows
          );

        for (
          let row = 0;
          row < rows;
          row += 1
        ) {
          const startY =
            row * pixelsPerRow;

          const endY =
            Math.min(
              image.height,
              startY + pixelsPerRow
            );

          let purple = 0;
          let total = 0;

          for (
            let y = startY;
            y < endY;
            y += 1
          ) {
            for (
              let x = 0;
              x < image.width;
              x += 1
            ) {
              const offset =
                (y * image.width + x) *
                channels;

              const r =
                image.data[offset] ?? 0;

              const g =
                image.data[offset + 1] ?? 0;

              const b =
                image.data[offset + 2] ?? 0;

              const max =
                Math.max(r, g, b);

              const min =
                Math.min(r, g, b);

              const saturation =
                max === 0
                  ? 0
                  : (max - min) / max;

              if (
                max > 38 &&
                saturation > 0.2 &&
                r > b * 0.65 &&
                b > g * 1.15 &&
                r > g * 1.15
              ) {
                purple += 1;
              }

              total += 1;
            }
          }

          const percentage =
            (purple / total) * 100;

          console.log(
            `${String(startY).padStart(4)}-${String(endY - 1).padStart(4)}: ${percentage.toFixed(2)}% purple`
          );
        }
      }
    );
  }
);