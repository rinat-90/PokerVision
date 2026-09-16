import {
  describe,
  expect,
  it
} from "vitest";

import {
  HandHistoryParserError
} from "../parser-error.js";

import {
  parsePokerStarsAction
} from "./parse-action.js";

const baseContext = {
  street: "preflop" as const,
  playerId: "seat-1",
  playerName: "Hero",
  currentStreetContribution: 1
};

describe(
  "parsePokerStarsAction",
  () => {
    it(
      "parses fold",
      () => {
        expect(
          parsePokerStarsAction(
            "Hero: folds",
            baseContext
          )
        ).toEqual({
          playerId: "seat-1",
          type: "fold",
          amount: 0,
          amountType: "contribution",
          street: "preflop"
        });
      }
    );

    it(
      "parses check",
      () => {
        expect(
          parsePokerStarsAction(
            "Hero: checks",
            baseContext
          )
        ).toEqual({
          playerId: "seat-1",
          type: "check",
          amount: 0,
          amountType: "contribution",
          street: "preflop"
        });
      }
    );

    it(
      "parses call",
      () => {
        expect(
          parsePokerStarsAction(
            "Hero: calls 2",
            baseContext
          )
        ).toEqual({
          playerId: "seat-1",
          type: "call",
          amount: 2,
          amountType: "contribution",
          street: "preflop"
        });
      }
    );

    it(
      "parses bet",
      () => {
        expect(
          parsePokerStarsAction(
            "Hero: bets 5",
            {
              ...baseContext,
              currentStreetContribution: 0
            }
          )
        ).toEqual({
          playerId: "seat-1",
          type: "bet",
          amount: 5,
          amountType: "contribution",
          street: "preflop"
        });
      }
    );

    it(
      "parses raise and converts total to contribution",
      () => {
        expect(
          parsePokerStarsAction(
            "Hero: raises 2 to 6",
            {
              ...baseContext,
              currentStreetContribution: 2
            }
          )
        ).toEqual({
          playerId: "seat-1",
          type: "raise",
          amount: 4,
          amountType: "contribution",
          street: "preflop"
        });
      }
    );

    it(
      "parses raise to amount",
      () => {
        expect(
          parsePokerStarsAction(
            "Hero: raises 10 to 20",
            {
              ...baseContext,
              currentStreetContribution: 10
            }
          )
        ).toEqual({
          playerId: "seat-1",
          type: "raise",
          amount: 10,
          amountType: "contribution",
          street: "preflop"
        });
      }
    );

    it(
      "parses call all-in",
      () => {
        expect(
          parsePokerStarsAction(
            "Hero: calls 50 and is all-in",
            baseContext
          )
        ).toEqual({
          playerId: "seat-1",
          type: "call",
          amount: 50,
          amountType: "contribution",
          street: "preflop"
        });
      }
    );

    it(
      "parses bet all-in",
      () => {
        expect(
          parsePokerStarsAction(
            "Hero: bets 100 and is all-in",
            {
              ...baseContext,
              currentStreetContribution: 0
            }
          )
        ).toEqual({
          playerId: "seat-1",
          type: "bet",
          amount: 100,
          amountType: "contribution",
          street: "preflop"
        });
      }
    );

    it(
      "parses explicit all-in amount",
      () => {
        expect(
          parsePokerStarsAction(
            "Hero: is all-in for 100",
            {
              ...baseContext,
              currentStreetContribution: 0
            }
          )
        ).toEqual({
          playerId: "seat-1",
          type: "all_in",
          amount: 100,
          amountType: "contribution",
          street: "preflop"
        });
      }
    );

    it(
      "supports different streets",
      () => {
        expect(
          parsePokerStarsAction(
            "Hero: bets 12",
            {
              ...baseContext,
              street: "flop",
              currentStreetContribution: 0
            }
          )
        ).toEqual({
          playerId: "seat-1",
          type: "bet",
          amount: 12,
          amountType: "contribution",
          street: "flop"
        });
      }
    );

    it(
      "throws for another player",
      () => {
        expect(() =>
          parsePokerStarsAction(
            "Villain: folds",
            baseContext
          )
        ).toThrow(
          HandHistoryParserError
        );
      }
    );

    it(
      "throws for unknown action",
      () => {
        expect(() =>
          parsePokerStarsAction(
            "Hero: limps",
            baseContext
          )
        ).toThrow(
          HandHistoryParserError
        );
      }
    );

    it(
      "throws when raise total is below contribution",
      () => {
        expect(() =>
          parsePokerStarsAction(
            "Hero: raises 2 to 3",
            {
              ...baseContext,
              currentStreetContribution: 5
            }
          )
        ).toThrow(
          HandHistoryParserError
        );
      }
    );

    it(
      "parses PokerStars call as incremental contribution",
      () => {
        const action =
          parsePokerStarsAction(
            "Villain: calls 6",
            {
              street: "preflop",
              playerId: "villain",
              playerName: "Villain",
              currentStreetContribution: 2
            }
          );

        expect(action).toEqual({
          playerId: "villain",
          type: "call",
          amount: 6,
          amountType: "contribution",
          street: "preflop"
        });
      }
    );
  }
);