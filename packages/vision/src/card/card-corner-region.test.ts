import {
  describe,
  expect,
  it
} from "vitest";

import {
  createCardCornerRegion
} from "./card-corner-region.js";

describe(
  "createCardCornerRegion",
  () => {
    it(
      "creates a top-left corner region",
      () => {
        expect(
          createCardCornerRegion({
            x: 100,
            y: 50,
            width: 100,
            height: 140
          })
        ).toEqual({
          x: 100,
          y: 50,
          width: 40,
          height: 77
        });
      }
    );

    it(
      "creates a corner for a real board card size",
      () => {
        expect(
          createCardCornerRegion({
            x: 120,
            y: 16,
            width: 104,
            height: 143
          })
        ).toEqual({
          x: 120,
          y: 16,
          width: 42,
          height: 79
        });
      }
    );

    it(
      "preserves the card top-left position",
      () => {
        const card = {
          x: 341,
          y: 16,
          width: 105,
          height: 143
        };

        const corner =
          createCardCornerRegion(
            card
          );

        expect(corner.x)
          .toBe(card.x);

        expect(corner.y)
          .toBe(card.y);
      }
    );
  }
);