import { describe, expect, it } from "vitest";

import type { Card, Player } from "@poker-vision/poker-engine";

import {
  settleShowdown
} from "@poker-vision/poker-engine";

describe("side pot showdown integration", () => {
  it(
    "splits main and side pots between different winners",
    () => {
      const players: Player[] = [
        {
          id: "short",
          name: "Short Stack",
          position: "BTN",
          stack: 0,
          status: "all_in",
          holeCards: [
            {
              rank: "A",
              suit: "spades"
            },
            {
              rank: "A",
              suit: "hearts"
            }
          ]
        },
        {
          id: "medium",
          name: "Medium Stack",
          position: "SB",
          stack: 0,
          status: "all_in",
          holeCards: [
            {
              rank: "K",
              suit: "clubs"
            },
            {
              rank: "K",
              suit: "diamonds"
            }
          ]
        },
        {
          id: "deep",
          name: "Deep Stack",
          position: "BB",
          stack: 50,
          status: "active",
          holeCards: [
            {
              rank: "Q",
              suit: "clubs"
            },
            {
              rank: "Q",
              suit: "diamonds"
            }
          ]
        }
      ];

      const board: Card[] = [
        {
          rank: "2",
          suit: "clubs"
        },
        {
          rank: "7",
          suit: "diamonds"
        },
        {
          rank: "9",
          suit: "hearts"
        },
        {
          rank: "3",
          suit: "spades"
        },
        {
          rank: "4",
          suit: "clubs"
        }
      ];

      const totalContributions = {
        short: 20,
        medium: 50,
        deep: 50
      };

      const result =
        settleShowdown(
          players,
          board,
          totalContributions
        );

      expect(
        result.pots
      ).toHaveLength(2);

      expect(
        result.pots[0]
      ).toEqual({
        amount: 60,
        eligiblePlayerIds: [
          "short",
          "medium",
          "deep"
        ],
        winnerIds: [
          "short"
        ]
      });

      expect(
        result.pots[1]
      ).toEqual({
        amount: 60,
        eligiblePlayerIds: [
          "medium",
          "deep"
        ],
        winnerIds: [
          "medium"
        ]
      });

      expect(
        result.payouts
      ).toEqual({
        short: 60,
        medium: 60,
        deep: 0
      });
    }
  );

  it(
    "does not allow a folded player to win a side pot",
    () => {
      const players: Player[] = [
        {
          id: "short",
          name: "Short Stack",
          position: "BTN",
          stack: 0,
          status: "all_in",
          holeCards: [
            {
              rank: "A",
              suit: "spades"
            },
            {
              rank: "A",
              suit: "hearts"
            }
          ]
        },
        {
          id: "medium",
          name: "Medium Stack",
          position: "SB",
          stack: 0,
          status: "folded",
          holeCards: [
            {
              rank: "K",
              suit: "clubs"
            },
            {
              rank: "K",
              suit: "diamonds"
            }
          ]
        },
        {
          id: "deep",
          name: "Deep Stack",
          position: "BB",
          stack: 50,
          status: "active",
          holeCards: [
            {
              rank: "Q",
              suit: "clubs"
            },
            {
              rank: "Q",
              suit: "diamonds"
            }
          ]
        }
      ];

      const board: Card[] = [
        {
          rank: "2",
          suit: "clubs"
        },
        {
          rank: "7",
          suit: "diamonds"
        },
        {
          rank: "9",
          suit: "hearts"
        },
        {
          rank: "3",
          suit: "spades"
        },
        {
          rank: "4",
          suit: "clubs"
        }
      ];

      const result =
        settleShowdown(
          players,
          board,
          {
            short: 20,
            medium: 50,
            deep: 50
          }
        );

      expect(
        result.pots[0]?.winnerIds
      ).toEqual([
        "short"
      ]);

      expect(
        result.pots[1]?.winnerIds
      ).toEqual([
        "deep"
      ]);

      expect(
        result.payouts
      ).toEqual({
        short: 60,
        medium: 0,
        deep: 60
      });
    }
  );
});