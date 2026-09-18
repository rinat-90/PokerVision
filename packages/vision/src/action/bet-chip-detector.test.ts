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
      "detects blue chip pixels",
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
      }
    );

    it(
      "returns zero for an empty frame",
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
          matchingPixelRatio: 0
        });
      }
    );
  }
);