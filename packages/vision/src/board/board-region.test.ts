import {
  describe,
  expect,
  it
} from "vitest";

import {
  createBoardRegion
} from "./board-region.js";

describe(
  "createBoardRegion",
  () => {
    it(
      "creates a centered region inside the table",
      () => {
        const region =
          createBoardRegion({
            x: 100,
            y: 200,
            width: 1000,
            height: 400
          });

        expect(region)
          .toEqual({
            x: 350,
            y: 310,
            width: 500,
            height: 180
          });
      }
    );

    it(
      "creates the expected region for the real poker table",
      () => {
        const region =
          createBoardRegion({
            x: 189,
            y: 232,
            width: 1514,
            height: 464
          });

        expect(region)
          .toEqual({
            x: 568,
            y: 360,
            width: 757,
            height: 209
          });
      }
    );
  }
);