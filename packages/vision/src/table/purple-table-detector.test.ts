import { describe, expect, it } from "vitest";

import {
  SharpImageDecoder
} from "../image/sharp-image-decoder.js";

import {
  PurpleTableDetector
} from "./purple-table-detector.js";

import type {
  VideoFrame
} from "@poker-vision/video";

import fs from "node:fs/promises";

describe(
  "PurpleTableDetector",
  () => {
    it(
      "detects the purple poker table",
      async () => {
        const data =
          await fs.readFile(
            new URL(
              "../../../video/fixtures/real/table-frame.jpg",
              import.meta.url
            )
          );

        const detector =
          new PurpleTableDetector(
            new SharpImageDecoder()
          );

        const frame: VideoFrame = {
          index: 0,
          timestampSeconds: 0,
          data: new Uint8Array(data),
          width: 1892,
          height: 928
        };

        const result =
          await detector.detect(frame);

        console.log(
          "TABLE DETECTION:",
          result
        );

        expect(result.found).toBe(true);
        expect(result.region).toBeDefined();
      }
    );
  }
);