import { describe, it } from "vitest";

import {
  SharpImageDecoder
} from "../image/sharp-image-decoder.js";

import fs from "node:fs/promises";

describe(
  "Purple table X diagnostics",
  () => {
    it(
      "prints purple pixel distribution by column",
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

        const startY = 232;
        const endY = 696;

        const segments = 20;
        const segmentWidth =
          Math.ceil(
            image.width / segments
          );

        for (
          let segment = 0;
          segment < segments;
          segment += 1
        ) {
          const startX =
            segment * segmentWidth;

          const endX =
            Math.min(
              image.width,
              startX + segmentWidth
            );

          let purple = 0;
          let total = 0;

          for (
            let y = startY;
            y < endY;
            y += 1
          ) {
            for (
              let x = startX;
              x < endX;
              x += 1
            ) {
              const offset =
                (y * image.width + x) *
                channels;

              const r =
                (image.data[offset] ?? 0) / 255;

              const g =
                (image.data[offset + 1] ?? 0) / 255;

              const b =
                (image.data[offset + 2] ?? 0) / 255;

              const max =
                Math.max(r, g, b);

              const min =
                Math.min(r, g, b);

              const saturation =
                max === 0
                  ? 0
                  : (max - min) / max;

              if (
                max > 0.15 &&
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
            `${String(startX).padStart(4)}-${String(endX - 1).padStart(4)}: ${percentage.toFixed(2)}% purple`
          );
        }
      }
    );
  }
);