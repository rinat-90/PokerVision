import {
  describe,
  expect,
  it
} from "vitest";

import {
  createSixMaxSeatAnchors
} from "./seat-layout.js";

describe(
  "createSixMaxSeatAnchors",
  () => {
    it(
      "creates six anchors around the table",
      () => {
        const anchors =
          createSixMaxSeatAnchors({
            x: 100,
            y: 200,
            width: 1000,
            height: 400
          });

        expect(anchors)
          .toHaveLength(6);

        expect(anchors)
          .toEqual([
            {
              index: 0,
              x: 600,
              y: 200
            },
            {
              index: 1,
              x: 1100,
              y: 300
            },
            {
              index: 2,
              x: 1100,
              y: 500
            },
            {
              index: 3,
              x: 600,
              y: 600
            },
            {
              index: 4,
              x: 100,
              y: 500
            },
            {
              index: 5,
              x: 100,
              y: 300
            }
          ]);
      }
    );
  }
);