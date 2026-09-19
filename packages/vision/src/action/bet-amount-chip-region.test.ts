import {
  describe,
  expect,
  it
} from "vitest";

import {
  createBetAmountRegionFromChip
} from "./bet-amount-chip-region.js";

describe(
  "createBetAmountRegionFromChip",
  () => {
    it(
      "translates a local chip region into global frame coordinates",
      () => {
        const result =
          createBetAmountRegionFromChip(
            {
              x: 20,
              y: 10,
              width: 10,
              height: 8
            },
            {
              seatIndex: 2,
              x: 100,
              y: 200,
              width: 180,
              height: 60
            },
            1920,
            1080,
            {
              horizontalPadding: 0,
              verticalPadding: 0,
              widthMultiplier: 1,
              heightMultiplier: 1
            }
          );

        expect(
          result
        ).toEqual({
          seatIndex: 2,
          x: 120,
          y: 210,
          width: 10,
          height: 8
        });
      }
    );

    it(
      "creates a tight region around the selected chip",
      () => {
        const result =
          createBetAmountRegionFromChip(
            {
              x: 40,
              y: 20,
              width: 20,
              height: 10
            },
            {
              seatIndex: 4,
              x: 500,
              y: 600,
              width: 180,
              height: 60
            },
            1920,
            1080
          );

        expect(
          result.seatIndex
        ).toBe(4);

        expect(
          result.x
        ).toBeLessThanOrEqual(
          540
        );

        expect(
          result.y
        ).toBeLessThanOrEqual(
          620
        );

        expect(
          result.x +
          result.width
        ).toBeGreaterThanOrEqual(
          560
        );

        expect(
          result.y +
          result.height
        ).toBeGreaterThanOrEqual(
          630
        );

        expect(
          result.width
        ).toBeLessThan(180);

        expect(
          result.height
        ).toBeLessThan(60);
      }
    );

    it(
      "clamps the region to the frame bounds",
      () => {
        const result =
          createBetAmountRegionFromChip(
            {
              x: 0,
              y: 0,
              width: 20,
              height: 10
            },
            {
              seatIndex: 5,
              x: 0,
              y: 0,
              width: 180,
              height: 60
            },
            1920,
            1080
          );

        expect(
          result.x
        ).toBeGreaterThanOrEqual(0);

        expect(
          result.y
        ).toBeGreaterThanOrEqual(0);

        expect(
          result.x +
          result.width
        ).toBeLessThanOrEqual(1920);

        expect(
          result.y +
          result.height
        ).toBeLessThanOrEqual(1080);
      }
    );
  }
);