import {
  describe,
  expect,
  it
} from "vitest";

import {
  parsePokerStarsHand
} from "./parse-hand.js";

import {
  analyzeDecision,
  analyzeDecisionPoint,
  analyzeHandHistory,
  createDecisionContext,
  handHistoryToState,
  replayHandToAction,
  findDecisionPoints,
} from "@poker-vision/hand-history";

import {
  analyzeHand,
  createRange
} from "@poker-vision/poker-engine";

describe("PokerStars pipeline", () => {
  it("parses a hand into HandState", () => {
    const input = `
PokerStars Hand #999999999: Hold'em No Limit ($1/$2 USD)
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
Hero: bets 20
Villain: calls 20

*** RIVER *** [2c 7d Ks 3h] [9s]
Hero: checks
Villain: bets 20
Hero: calls 20

*** SHOW DOWN ***
Hero: shows [Ah Ad]
Villain: shows [Qc Qs]
`;

    const hand = parsePokerStarsHand(input);
    const state = handHistoryToState(hand);

    expect(state.street).toBe("river");

    expect(state.board).toHaveLength(5);

    expect(state.pot).toBe(112);

    expect(state.totalContributions).toEqual({
      "seat-1": 56,
      "seat-2": 56
    });

    expect(state.players[0]?.stack).toBe(144);
    expect(state.players[1]?.stack).toBe(144);
  });

  it("analyzes a decision from parsed hand state", () => {
    const input = `
PokerStars Hand #999999998: Hold'em No Limit ($1/$2 USD)
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

    const hand = parsePokerStarsHand(input);
    const state = handHistoryToState(hand);

    const hero = state.players.find(
      (player) => player.id === "seat-1"
    );

    expect(hero?.holeCards).toBeDefined();

    if (hero?.holeCards === undefined) {
      throw new Error("Hero cards were not parsed");
    }

    const villainRange = createRange([
      "KK",
      "QQ",
      "JJ",
      "TT",
      "AKs",
      "AQs"
    ]);

    const potBeforeCall = 92;
    const callAmount = 20;

    const analysis = analyzeHand({
      heroCards: hero.holeCards,
      villainRange,
      board: state.board,
      pot: potBeforeCall,
      callAmount,
      iterationsPerCombo: 500
    });

    expect(analysis.equity).toBeGreaterThan(0);
    expect(analysis.equity).toBeLessThan(1);

    expect(
      analysis.potOdds.requiredEquity
    ).toBeCloseTo(
      callAmount / (potBeforeCall + callAmount)
    );

    expect(
      analysis.expectedValue.ev
    ).toBeDefined();

    expect([
      "profitable",
      "unprofitable",
      "break_even"
    ]).toContain(
      analysis.decision
    );

    expect(
      analysis.validVillainCombos
    ).toBeGreaterThan(0);
  });

  it("replays a hand to a decision point", () => {
    const input = `
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

    const hand = parsePokerStarsHand(input);

    const snapshot = replayHandToAction(
      hand,
      6
    );

    expect(snapshot.actionIndex).toBe(6);

    expect(snapshot.targetAction).toEqual({
      playerId: "seat-1",
      type: "call",
      amount: 20,
      street: "turn"
    });

    expect(snapshot.street).toBe("turn");

    expect(snapshot.board).toEqual([
      {
        rank: "2",
        suit: "clubs"
      },
      {
        rank: "7",
        suit: "diamonds"
      },
      {
        rank: "K",
        suit: "spades"
      },
      {
        rank: "3",
        suit: "hearts"
      }
    ]);

    expect(snapshot.pot).toBe(52);

    expect(snapshot.currentBet).toBe(20);

    expect(
      snapshot.playerContributions["seat-1"]
    ).toBe(0);

    expect(
      snapshot.playerContributions["seat-2"]
    ).toBe(20);

    expect(
      snapshot.totalContributions["seat-1"]
    ).toBe(16);

    expect(
      snapshot.totalContributions["seat-2"]
    ).toBe(36);

    const hero = snapshot.players.find(
      (player) => player.id === "seat-1"
    );

    expect(hero?.holeCards).toEqual([
      {
        rank: "A",
        suit: "hearts"
      },
      {
        rank: "A",
        suit: "diamonds"
      }
    ]);

    expect(hero?.stack).toBe(184);
  });

  it("analyzes a decision from a replayed decision point", () => {
    const input = `
PokerStars Hand #999999996: Hold'em No Limit ($1/$2 USD)
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

    const hand = parsePokerStarsHand(input);

    const snapshot = replayHandToAction(
      hand,
      6
    );

    const context =
      createDecisionContext(snapshot);

    const villainRange = createRange([
      "KK",
      "QQ",
      "JJ",
      "TT",
      "AKs",
      "AQs"
    ]);

    const analysis =
      analyzeDecision(
        context,
        {
          villainRange,
          iterationsPerCombo: 500
        }
      );

    expect(context.playerId).toBe("seat-1");
    expect(context.street).toBe("turn");
    expect(context.pot).toBe(52);
    expect(context.callAmount).toBe(20);

    expect(analysis.equity).toBeGreaterThan(0);
    expect(analysis.equity).toBeLessThan(1);

    expect(
      analysis.potOdds
    ).toBeDefined();

    expect(
      analysis.potOdds
    ).toBeCloseTo(
      20 / (52 + 20)
    );

    expect(
      analysis.expectedValue
    ).toBeDefined();

    expect([
      "profitable",
      "unprofitable",
      "break_even"
    ]).toContain(
      analysis.decision
    );

    expect(
      analysis.validVillainCombos
    ).toBeGreaterThan(0);
  });

  it("analyzes a decision point end-to-end", () => {
    const input = `
PokerStars Hand #999999995: Hold'em No Limit ($1/$2 USD)
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

    const hand =
      parsePokerStarsHand(input);

    const villainRange =
      createRange([
        "KK",
        "QQ",
        "JJ",
        "TT",
        "AKs",
        "AQs"
      ]);

    const result =
      analyzeDecisionPoint(
        hand,
        6,
        {
          villainRange,
          iterationsPerCombo: 500
        }
      );

    expect(
      result.context.street
    ).toBe("turn");

    expect(
      result.context.playerId
    ).toBe("seat-1");

    expect(
      result.context.pot
    ).toBe(52);

    expect(
      result.context.callAmount
    ).toBe(20);

    expect(
      result.analysis.equity
    ).toBeGreaterThan(0);

    expect(
      result.analysis.equity
    ).toBeLessThan(1);

    expect(
      result.analysis.validVillainCombos
    ).toBeGreaterThan(0);
  });

  it("finds a bet decision from parsed hand history", () => {
    const input = `
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
Villain: checks

*** RIVER *** [2c 7d Ks 3h] [9s]
Hero: bets 20
Villain: folds
`;

    const hand =
      parsePokerStarsHand(input);

    const hero =
      hand.players.find(
        (player) =>
          player.name === "Hero"
      );

    expect(hero).toBeDefined();

    if (hero === undefined) {
      throw new Error(
        "Expected Hero"
      );
    }

    const decisionPoints =
      findDecisionPoints(
        hand,
        {
          playerId:
          hero.id
        }
      );

    console.log(
      "DECISION POINTS:",
      decisionPoints
    );

    console.log(
      "ALL ACTIONS:",
    );

    expect(
      decisionPoints.length
    ).toBeGreaterThan(0);

    expect(
      decisionPoints.some(
        (decisionPoint) =>
          decisionPoint.action.type ===
          "bet"
      )
    ).toBe(true);
  });

  it("analyzes all Hero decision points", () => {
    const input = `
PokerStars Hand #999999994: Hold'em No Limit ($1/$2 USD)
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
Hero: checks
Villain: checks

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

    const hand =
      parsePokerStarsHand(input);

    const villainRange =
      createRange([
        "KK",
        "QQ",
        "JJ",
        "TT",
        "AKs",
        "AQs"
      ]);

    const result =
      analyzeHandHistory(
        hand,
        {
          heroPlayerId: "seat-1",
          villainRange,
          iterationsPerCombo: 500
        }
      );

    expect(result.handId)
      .toBe(hand.id);

    expect(result.decisions.length)
      .toBeGreaterThan(0);

    expect(
      result.decisions.every(
        (decision) =>
          decision.context.playerId ===
          "seat-1"
      )
    ).toBe(true);

    const analyzedDecisions =
      result.decisions.filter(
        (decision) =>
          decision.status === "analyzed"
      );

    expect(analyzedDecisions)
      .toHaveLength(2);

    expect(
      analyzedDecisions.every(
        (decision) =>
          decision.analysis !== undefined &&
          decision.analysis.equity >= 0 &&
          decision.analysis.equity <= 1
      )
    ).toBe(true);
  });
});