import {
  describe,
  expect,
  it
} from "vitest";

import {
  BetChipDetector
} from "./bet-chip-detector.js";

describe(
  "BetChipDetector",
  () => {
    it(
      "detects blue chip pixels and returns their region",
      () => {
        const detector =
          new BetChipDetector({
            minimumPixelRatio:
              0.2
          });

        const result =
          detector.detect({
            width: 2,
            height: 1,
            channels: 3,
            data:
              new Uint8Array([
                20,
                80,
                220,

                80,
                70,
                60
              ])
          });

        expect(
          result.present
        ).toBe(true);

        expect(
          result.matchingPixelRatio
        ).toBe(0.5);

        expect(
          result.region
        ).toEqual({
          x: 0,
          y: 0,
          width: 1,
          height: 1
        });
      }
    );

    it(
      "returns the bounding region of one connected blue component",
      () => {
        const detector =
          new BetChipDetector({
            minimumPixelRatio:
              0.2
          });

        const background = [
          80,
          70,
          60
        ];

        const blue = [
          20,
          80,
          220
        ];

        const result =
          detector.detect({
            width: 4,
            height: 3,
            channels: 3,
            data:
              new Uint8Array([
                ...background,
                ...background,
                ...background,
                ...background,

                ...background,
                ...blue,
                ...blue,
                ...background,

                ...background,
                ...blue,
                ...blue,
                ...background
              ])
          });

        expect(
          result.present
        ).toBe(true);

        expect(
          result.region
        ).toEqual({
          x: 1,
          y: 1,
          width: 2,
          height: 2
        });
      }
    );

    it(
      "returns the largest connected blue component instead of combining separate components",
      () => {
        const detector =
          new BetChipDetector({
            minimumPixelRatio:
              0.1
          });

        const background = [
          80,
          70,
          60
        ];

        const blue = [
          20,
          80,
          220
        ];

        const result =
          detector.detect({
            width: 6,
            height: 3,
            channels: 3,
            data:
              new Uint8Array([
                ...blue,
                ...background,
                ...background,
                ...background,
                ...blue,
                ...blue,

                ...background,
                ...background,
                ...background,
                ...background,
                ...blue,
                ...blue,

                ...background,
                ...background,
                ...background,
                ...background,
                ...background,
                ...background
              ])
          });

        expect(
          result.present
        ).toBe(true);

        expect(
          result.matchingPixelRatio
        ).toBeCloseTo(
          5 / 18
        );

        expect(
          result.region
        ).toEqual({
          x: 4,
          y: 0,
          width: 2,
          height: 2
        });
      }
    );

    it(
      "rejects purple table pixels",
      () => {
        const detector =
          new BetChipDetector();

        const result =
          detector.detect({
            width: 2,
            height: 1,
            channels: 3,
            data:
              new Uint8Array([
                120,
                80,
                140,

                100,
                70,
                120
              ])
          });

        expect(
          result.present
        ).toBe(false);

        expect(
          result.region
        ).toBeNull();
      }
    );

    it(
      "rejects white text pixels",
      () => {
        const detector =
          new BetChipDetector();

        const result =
          detector.detect({
            width: 2,
            height: 1,
            channels: 3,
            data:
              new Uint8Array([
                240,
                240,
                240,

                220,
                220,
                220
              ])
          });

        expect(
          result.present
        ).toBe(false);

        expect(
          result.region
        ).toBeNull();
      }
    );

    it(
      "does not expose a region when blue pixels are below the presence threshold",
      () => {
        const detector =
          new BetChipDetector({
            minimumPixelRatio:
              0.75
          });

        const result =
          detector.detect({
            width: 2,
            height: 1,
            channels: 3,
            data:
              new Uint8Array([
                20,
                80,
                220,

                80,
                70,
                60
              ])
          });

        expect(
          result.present
        ).toBe(false);

        expect(
          result.matchingPixelRatio
        ).toBe(0.5);

        expect(
          result.region
        ).toBeNull();
      }
    );

    it(
      "returns zero and no region for an empty frame",
      () => {
        const detector =
          new BetChipDetector();

        const result =
          detector.detect({
            width: 0,
            height: 0,
            channels: 3,
            data:
              new Uint8Array()
          });

        expect(
          result
        ).toEqual({
          present: false,
          matchingPixelRatio: 0,
          region: null
        });
      }
    );
  }
);