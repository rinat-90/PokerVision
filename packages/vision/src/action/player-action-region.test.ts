import {
  describe,
  expect,
  it
} from "vitest";

import {
  createPlayerActionRegions
} from "./player-action-region.js";

describe(
  "createPlayerActionRegions",
  () => {
    it(
      "creates six action regions",
      () => {
        const regions =
          createPlayerActionRegions({
            x: 100,
            y: 200,
            width: 1000,
            height: 400
          });

        expect(
          regions
        ).toHaveLength(6);

        expect(
          regions.map(
            (region) =>
              region.seatIndex
          )
        ).toEqual([
          0,
          1,
          2,
          3,
          4,
          5
        ]);
      }
    );

    it(
      "places action regions around the table center",
      () => {
        const regions =
          createPlayerActionRegions({
            x: 100,
            y: 200,
            width: 1000,
            height: 400
          });

        const [
          top,
          topRight,
          bottomRight,
          bottom,
          bottomLeft,
          topLeft
        ] = regions;

        expect(top).toBeDefined();
        expect(topRight).toBeDefined();
        expect(bottomRight).toBeDefined();
        expect(bottom).toBeDefined();
        expect(bottomLeft).toBeDefined();
        expect(topLeft).toBeDefined();

        if (
          !top ||
          !topRight ||
          !bottomRight ||
          !bottom ||
          !bottomLeft ||
          !topLeft
        ) {
          throw new Error(
            "Expected six action regions"
          );
        }

        expect(
          top.y
        ).toBeLessThan(
          bottom.y
        );

        expect(
          topRight.x
        ).toBeGreaterThan(
          topLeft.x
        );

        expect(
          bottomRight.x
        ).toBeGreaterThan(
          bottomLeft.x
        );
      }
    );

    it(
      "keeps consistent region sizes",
      () => {
        const regions =
          createPlayerActionRegions({
            x: 100,
            y: 200,
            width: 1000,
            height: 400
          });

        expect(
          new Set(
            regions.map(
              (region) =>
                region.width
            )
          ).size
        ).toBe(1);

        expect(
          new Set(
            regions.map(
              (region) =>
                region.height
            )
          ).size
        ).toBe(1);
      }
    );
  }
);