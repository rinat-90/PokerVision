import { describe, expect, it } from "vitest";

import type {
  Card,
  Player
} from "@poker-vision/poker-engine";

import {
  settleShowdown
} from "@poker-vision/poker-engine";

describe("split pot showdown integration", () => {
  it(
    "splits a pot evenly when players tie",
    () => {
      const players: Player[] = [
        {
          id: "hero",
          name: "Hero",
          position: "BTN",
          stack: 0,
          status: "all_in",
          holeCards: [
            {
              rank: "A",
              suit: "spades"
            },
            {
              rank: "K",
              suit: "spades"
            }
          ]
        },
        {
          id: "villain",
          name: "Villain",
          position: "BB",
          stack: 0,
          status: "all_in",
          holeCards: [
            {
              rank: "A",
              suit: "hearts"
            },
            {
              rank: "K",
              suit: "hearts"
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
            hero: 20,
            villain: 20
          }
        );

      expect(
        result.pots[0]?.winnerIds
      ).toEqual([
        "hero",
        "villain"
      ]);

      expect(
        result.payouts
      ).toEqual({
        hero: 20,
        villain: 20
      });
    }
  );

  it(
    "assigns an odd chip when a tied pot cannot be divided evenly",
    () => {
      const players: Player[] = [
        {
          id: "hero",
          name: "Hero",
          position: "BTN",
          stack: 0,
          status: "all_in",
          holeCards: [
            {
              rank: "A",
              suit: "spades"
            },
            {
              rank: "K",
              suit: "spades"
            }
          ]
        },
        {
          id: "villain",
          name: "Villain",
          position: "BB",
          stack: 0,
          status: "all_in",
          holeCards: [
            {
              rank: "A",
              suit: "hearts"
            },
            {
              rank: "K",
              suit: "hearts"
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
            hero: 21,
            villain: 20
          }
        );

      expect(
        result.pots[0]?.winnerIds
      ).toEqual([
        "hero",
        "villain"
      ]);

      expect(
        result.payouts
      ).toEqual({
        hero: 21,
        villain: 20
      });
    }
  );
});