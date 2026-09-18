import {
  describe,
  expect,
  it
} from "vitest";

import {
  parsePlayerActionLabel
} from "./player-action-label-parser.js";

describe(
  "parsePlayerActionLabel",
  () => {
    it(
      "parses known action labels",
      () => {
        expect(
          parsePlayerActionLabel(
            "Check"
          )
        ).toBe("check");

        expect(
          parsePlayerActionLabel(
            "Call"
          )
        ).toBe("call");

        expect(
          parsePlayerActionLabel(
            "Fold"
          )
        ).toBe("fold");

        expect(
          parsePlayerActionLabel(
            "Place Bet"
          )
        ).toBe("placeBet");
      }
    );

    it(
      "normalizes whitespace and case",
      () => {
        expect(
          parsePlayerActionLabel(
            "  CHECK  "
          )
        ).toBe("check");

        expect(
          parsePlayerActionLabel(
            "Place   Bet"
          )
        ).toBe("placeBet");
      }
    );

    it(
      "accepts place bet without whitespace",
      () => {
        expect(
          parsePlayerActionLabel(
            "PlaceBet"
          )
        ).toBe("placeBet");
      }
    );

    it(
      "rejects unknown text",
      () => {
        expect(
          parsePlayerActionLabel(
            ""
          )
        ).toBeNull();

        expect(
          parsePlayerActionLabel(
            "Raise"
          )
        ).toBeNull();

        expect(
          parsePlayerActionLabel(
            "hello"
          )
        ).toBeNull();
      }
    );

    it(
      "parses observed OCR variants",
      () => {
        expect(
          parsePlayerActionLabel(
            "NECK"
          )
        ).toBe("check");

        expect(
          parsePlayerActionLabel(
            "Ca"
          )
        ).toBe("call");
      }
    );

  }
);