import {
  describe,
  expect,
  it
} from "vitest";

import {
  expandRegion
} from "./expand-region.js";

describe(
  "expandRegion",
  () => {
    it(
      "expands a region by padding",
      () => {
        expect(
          expandRegion(
            {
              x: 100,
              y: 100,
              width: 200,
              height: 100
            },
            {
              top: 20,
              right: 30,
              bottom: 40,
              left: 10
            },
            {
              width: 500,
              height: 500
            }
          )
        ).toEqual({
          x: 90,
          y: 80,
          width: 240,
          height: 160
        });
      }
    );

    it(
      "clamps the expanded region to frame bounds",
      () => {
        expect(
          expandRegion(
            {
              x: 10,
              y: 20,
              width: 180,
              height: 160
            },
            {
              top: 50,
              right: 50,
              bottom: 50,
              left: 50
            },
            {
              width: 200,
              height: 200
            }
          )
        ).toEqual({
          x: 0,
          y: 0,
          width: 200,
          height: 200
        });
      }
    );
  }
);