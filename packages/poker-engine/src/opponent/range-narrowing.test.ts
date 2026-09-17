import {
  describe,
  expect,
  it
} from "vitest";

import {
  createRange
} from "../range/range.js";

import {
  narrowOpponentRange
} from "./range-narrowing.js";

describe(
  "narrowOpponentRange",
  () => {
    it(
      "removes combinations containing cards from the board",
      () => {
        const range =
          createRange([
            "AA",
            "KK",
            "QQ"
          ]);

        const result =
          narrowOpponentRange({
            range,
            actionHistory: {
              playerId: "villain",
              actions: []
            },
            board: [
              {
                rank: "A",
                suit: "hearts"
              },
              {
                rank: "K",
                suit: "hearts"
              }
            ],
            street: "flop"
          });

        expect(
          result.originalComboCount
        ).toBe(18);

        expect(
          result.remainingComboCount
        ).toBe(12);

        expect(
          result.removedComboCount
        ).toBe(6);
      }
    );

    it(
      "removes combinations containing known hole cards",
      () => {
        const range =
          createRange([
            "AA",
            "KK",
            "QQ"
          ]);

        const result =
          narrowOpponentRange({
            range,
            actionHistory: {
              playerId: "villain",
              actions: []
            },
            board: [],
            knownCards: [
              {
                rank: "A",
                suit: "hearts"
              },
              {
                rank: "A",
                suit: "diamonds"
              }
            ],
            street: "preflop"
          });

        expect(
          result.originalComboCount
        ).toBe(18);

        expect(
          result.remainingComboCount
        ).toBe(13);

        expect(
          result.removedComboCount
        ).toBe(5);
      }
    );

    it(
      "does not modify combinations when no cards conflict",
      () => {
        const range =
          createRange([
            "AA",
            "KK",
            "QQ"
          ]);

        const result =
          narrowOpponentRange({
            range,
            actionHistory: {
              playerId: "villain",
              actions: []
            },
            board: [
              {
                rank: "2",
                suit: "clubs"
              },
              {
                rank: "7",
                suit: "diamonds"
              },
              {
                rank: "J",
                suit: "spades"
              }
            ],
            street: "flop"
          });

        expect(
          result.originalComboCount
        ).toBe(18);

        expect(
          result.remainingComboCount
        ).toBe(18);

        expect(
          result.removedComboCount
        ).toBe(0);
      }
    );

    it(
      "preserves combo weights",
      () => {
        const range =
          createRange([
            "AA",
            "KK"
          ]);

        const result =
          narrowOpponentRange({
            range,
            actionHistory: {
              playerId: "villain",
              actions: []
            },
            board: [],
            street: "preflop"
          });

        expect(
          result.range.combos
        ).toEqual(
          range.combos
        );
      }
    );
  }
);