import {
  describe,
  expect,
  it
} from "vitest";

import {
  serializeHandReview
} from "./serialize-hand-review.js";

import type {
  HandReview
} from "./hand-review.js";

describe(
  "serializeHandReview",
  () => {
    it(
      "serializes a hand review to formatted JSON",
      () => {
        const review = {
          id: "hand-1",
          gameFormat: "cash",
          blinds: {
            smallBlind: 25,
            bigBlind: 50,
            ante: 0
          },
          players: [],
          streets: [],
          decisions: [],
          summary: {
            totalDecisionPoints: 0,
            analyzedDecisionPoints: 0,
            skippedDecisionPoints: 0,
            callDecisions: 0
          }
        } as HandReview;

        const json =
          serializeHandReview(review);

        expect(
          JSON.parse(json)
        ).toEqual(review);

        expect(json).toContain(
          '\n  "id": "hand-1"'
        );
      }
    );
  }
);