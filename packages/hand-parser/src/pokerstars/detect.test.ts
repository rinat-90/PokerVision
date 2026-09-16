import {
  describe,
  expect,
  it
} from "vitest";

import {
  detectHandHistoryFormat
} from "./detect.js";

describe(
  "detectHandHistoryFormat",
  () => {
    it(
      "detects PokerStars",
      () => {
        const input =
          "PokerStars Hand #123456789: Hold'em";

        expect(
          detectHandHistoryFormat(
            input
          )
        ).toBe("pokerstars");
      }
    );

    it(
      "detects GGPoker",
      () => {
        const input =
          "GGPoker Hand #123456789";

        expect(
          detectHandHistoryFormat(
            input
          )
        ).toBe("ggpoker");
      }
    );

    it(
      "detects PartyPoker",
      () => {
        const input =
          "PartyPoker Hand #123456789";

        expect(
          detectHandHistoryFormat(
            input
          )
        ).toBe("partypoker");
      }
    );

    it(
      "returns unknown for unsupported input",
      () => {
        const input =
          "Some random poker hand";

        expect(
          detectHandHistoryFormat(
            input
          )
        ).toBe("unknown");
      }
    );

    it(
      "returns unknown for empty input",
      () => {
        expect(
          detectHandHistoryFormat(
            ""
          )
        ).toBe("unknown");
      }
    );
  }
);