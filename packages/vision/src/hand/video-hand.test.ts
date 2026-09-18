import {
  describe,
  expect,
  it
} from "vitest";

import type {
  VideoHand
} from "./video-hand.js";

describe(
  "VideoHand",
  () => {
    it(
      "represents a partially reconstructed poker hand",
      () => {
        const hand:
          VideoHand = {
            startedAt: 0,
            completedAt: 27,

            players: [
              {
                seatIndex: 0,
                hasCards: true
              },
              {
                seatIndex: 1,
                hasCards: true
              }
            ],

            streets: [
              {
                street:
                  "flop",

                timestampSeconds:
                  12,

                board: [
                  {
                    rank: "2",
                    suit: "hearts",
                    rankConfidence: 1,
                    suitConfidence: 1,
                    confidence: 1
                  },
                  {
                    rank: "6",
                    suit: "hearts",
                    rankConfidence: 1,
                    suitConfidence: 1,
                    confidence: 1
                  },
                  {
                    rank: "5",
                    suit: "hearts",
                    rankConfidence: 1,
                    suitConfidence: 1,
                    confidence: 1
                  }
                ]
              }
            ]
          };

        expect(
          hand.streets[0]?.board
        ).toHaveLength(3);
      }
    );
  }
);