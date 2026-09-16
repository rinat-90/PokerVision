import {
  describe,
  expect,
  it
} from "vitest";

import {
  createRange
} from "@poker-vision/poker-engine";

import {
  parsePokerStarsHand
} from "./pokerstars/parse-hand.js";

import {
  analyzeHandHistory
} from "@poker-vision/hand-history";

const POKERSTARS_HAND = `
PokerStars Hand #999999997: Hold'em No Limit ($1/$2 USD)
Table 'Test' 2-max Seat #1 is the button
Seat 1: Hero (200 in chips)
Seat 2: Villain (200 in chips)

*** HOLE CARDS ***
Hero: posts small blind 1
Villain: posts big blind 2
Dealt to Hero [Ah Ad]
Hero: raises 6 to 6
Villain: calls 4

*** FLOP *** [2c 7d Ks]
Hero: bets 10
Villain: calls 10

*** TURN *** [2c 7d Ks] [3h]
Hero: checks
Villain: bets 20
Hero: calls 20

*** RIVER *** [2c 7d Ks 3h] [9s]
Hero: checks
Villain: bets 20
Hero: calls 20

*** SHOW DOWN ***
Hero: shows [Ah Ad]
Villain: shows [Qc Qs]
`;

describe("PokerStars analysis pipeline", () => {
  it("parses and analyzes Hero decisions end-to-end", () => {
    const hand =
      parsePokerStarsHand(
        POKERSTARS_HAND
      );

    const villainRange =
      createRange([
        "QQ",
        "JJ",
        "TT",
        "AK"
      ]);

    const result =
      analyzeHandHistory(
        hand,
        {
          heroPlayerId:
            "seat-1",

          villainRange
        }
      );

    expect(result.handId)
      .toBeDefined();

    expect(result.summary)
      .toEqual({
        totalDecisionPoints: 5,
        analyzedDecisionPoints: 2,
        skippedDecisionPoints: 3,
        callDecisions: 2
      });

    expect(result.decisions)
      .toHaveLength(5);

    const analyzedDecisions =
      result.decisions.filter(
        (decision) =>
          decision.status ===
          "analyzed"
      );

    expect(analyzedDecisions)
      .toHaveLength(2);

    const skippedDecisions =
      result.decisions.filter(
        (decision) =>
          decision.status ===
          "skipped"
      );

    expect(skippedDecisions)
      .toHaveLength(3);

    expect(
      analyzedDecisions[0]?.action
    ).toEqual({
      playerId: "seat-1",
      type: "call",
      amount: 20,
      street: "turn"
    });

    expect(
      analyzedDecisions[0]?.context.pot
    ).toBe(52);

    expect(
      analyzedDecisions[0]?.context.callAmount
    ).toBe(20);

    expect(
      analyzedDecisions[1]?.action
    ).toEqual({
      playerId: "seat-1",
      type: "call",
      amount: 20,
      street: "river"
    });

    expect(
      analyzedDecisions[1]?.context.pot
    ).toBe(92);

    expect(
      analyzedDecisions[1]?.context.callAmount
    ).toBe(20);

    for (
      const decision of analyzedDecisions
      ) {
      expect(
        decision.analysis
      ).toBeDefined();

      expect(
        decision.analysis?.equity
      ).toBeGreaterThan(0);

      expect(
        decision.analysis?.validVillainCombos
      ).toBeGreaterThan(0);
    }

    for (
      const decision of skippedDecisions
      ) {
      expect(
        decision.analysis
      ).toBeUndefined();

      expect(
        decision.skipReason
      ).toBeDefined();
    }
  });
});