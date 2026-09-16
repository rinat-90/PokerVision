import {
  describe,
  expect,
  it
} from "vitest";

import type {
  HandHistoryAction
} from "@poker-vision/hand-history";

import {
  parsePokerStarsStreets
} from "./parse-streets.js";

describe(
  "parsePokerStarsStreets",
  () => {
    it(
      "creates preflop, flop, turn and river streets",
      () => {
        const input = `
          *** HOLE CARDS ***
          *** FLOP *** [Ah Kd 7c]
          *** TURN *** [Ah Kd 7c] [2s]
          *** RIVER *** [Ah Kd 7c 2s] [Jh]
          *** SHOW DOWN ***
        `;

        const actions: HandHistoryAction[] = [
          {
            playerId: "seat-1",
            type: "raise",
            amount: 3,
            amountType: "contribution",
            street: "preflop"
          },
          {
            playerId: "seat-2",
            type: "call",
            amount: 3,
            amountType: "contribution",
            street: "preflop"
          },
          {
            playerId: "seat-1",
            type: "bet",
            amount: 5,
            amountType: "contribution",
            street: "flop"
          },
          {
            playerId: "seat-2",
            type: "call",
            amount: 5,
            amountType: "contribution",
            street: "flop"
          },
          {
            playerId: "seat-1",
            type: "check",
            amount: 0,
            amountType: "contribution",
            street: "turn"
          },
          {
            playerId: "seat-2",
            type: "bet",
            amount: 10,
            amountType: "contribution",
            street: "turn"
          },
          {
            playerId: "seat-1",
            type: "fold",
            amount: 0,
            amountType: "contribution",
            street: "river"
          }
        ];

        expect(
          parsePokerStarsStreets(
            input,
            actions
          )
        ).toEqual([
          {
            street: "preflop",
            board: [],
            actions: [
              actions[0],
              actions[1]
            ]
          },
          {
            street: "flop",
            board: [
              {
                rank: "A",
                suit: "hearts"
              },
              {
                rank: "K",
                suit: "diamonds"
              },
              {
                rank: "7",
                suit: "clubs"
              }
            ],
            actions: [
              actions[2],
              actions[3]
            ]
          },
          {
            street: "turn",
            board: [
              {
                rank: "A",
                suit: "hearts"
              },
              {
                rank: "K",
                suit: "diamonds"
              },
              {
                rank: "7",
                suit: "clubs"
              },
              {
                rank: "2",
                suit: "spades"
              }
            ],
            actions: [
              actions[4],
              actions[5]
            ]
          },
          {
            street: "river",
            board: [
              {
                rank: "A",
                suit: "hearts"
              },
              {
                rank: "K",
                suit: "diamonds"
              },
              {
                rank: "7",
                suit: "clubs"
              },
              {
                rank: "2",
                suit: "spades"
              },
              {
                rank: "J",
                suit: "hearts"
              }
            ],
            actions: [
              actions[6]
            ]
          }
        ]);
      }
    );

    it(
      "creates preflop even without a hole cards marker",
      () => {
        const input =
          "PokerStars Hand #123456789";

        expect(
          parsePokerStarsStreets(
            input,
            []
          )
        ).toEqual([
          {
            street: "preflop",
            board: [],
            actions: []
          }
        ]);
      }
    );
  }
);