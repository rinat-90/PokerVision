import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { parsePluribusHand } from "./pluribus.js";
import { validateHandHistory } from "../validate-hand-history.js";
import { replayHandToAction } from "../replay-hand.js";

describe("Pluribus hand replay", () => {
  it("replays concrete states of Pluribus Hand #100000", () => {
    const fixturePath = resolve(
      process.cwd(),
      "packages/hand-history/fixtures/pluribus/pluribus_100.txt"
    );

    const input = readFileSync(fixturePath, "utf8");

    const hands = input.split(/(?=^PokerStars Hand #)/m);

    const firstHand = hands[0];

    if (firstHand === undefined) {
      throw new Error("Could not find first Pluribus hand");
    }

    const hand = parsePluribusHand(firstHand);

    expect(hand.id).toBe("100000");

    expect(() => {
      validateHandHistory(hand);
    }).not.toThrow();

    /*
     * Hand #100000:
     *
     * Preflop:
     * MrWhite folds
     * MrPink raises to 210
     * MrBrown folds
     * Pluribus folds
     * MrBlue calls 160
     * MrBlonde folds
     *
     * Pot entering flop:
     * SB 50 + 160 call = 210
     * BB = 100
     * MrPink = 210
     * Total = 520
     */

    const preflopRaise = replayHandToAction(hand, 1);

    expect(preflopRaise.street).toBe("preflop");
    expect(preflopRaise.board).toEqual([]);

    expect(preflopRaise.pot).toBe(150);

    expect(preflopRaise.currentBet).toBe(100);

    expect(preflopRaise.playerContributions).toEqual({
      MrBlue: 50,
      MrBlonde: 100,
      MrWhite: 0,
      MrPink: 0,
      MrBrown: 0,
      Pluribus: 0,
    });

    /*
     * Before MrBlue's call:
     *
     * MrPink has raised to 210.
     * MrBlue has already posted 50 SB.
     * He calls an additional 160.
     */

    const preflopCall = replayHandToAction(hand, 4);

    expect(preflopCall.street).toBe("preflop");
    expect(preflopCall.pot).toBe(360);
    expect(preflopCall.currentBet).toBe(210);

    expect(preflopCall.playerContributions).toEqual({
      MrBlue: 50,
      MrBlonde: 100,
      MrWhite: 0,
      MrPink: 210,
      MrBrown: 0,
      Pluribus: 0,
    });

    /*
     * Flop:
     *
     * [7d 5h 9d]
     *
     * Both players check.
     *
     * At this point the complete preflop pot is 520.
     */

    const flop = replayHandToAction(hand, 6);

    expect(flop.street).toBe("flop");

    expect(flop.board).toEqual([
      {
        rank: "7",
        suit: "diamonds",
      },
      {
        rank: "5",
        suit: "hearts",
      },
      {
        rank: "9",
        suit: "diamonds",
      },
    ]);

    expect(flop.pot).toBe(520);

    expect(flop.currentBet).toBe(0);

    expect(flop.playerContributions).toEqual({
      MrBlue: 0,
      MrBlonde: 0,
      MrWhite: 0,
      MrPink: 0,
      MrBrown: 0,
      Pluribus: 0,
    });

    expect(flop.totalContributions).toEqual({
      MrBlue: 210,
      MrBlonde: 100,
      MrWhite: 0,
      MrPink: 210,
      MrBrown: 0,
      Pluribus: 0,
    });

    /*
     * Turn:
     *
     * [7d 5h 9d 7c]
     *
     * Both players check again.
     *
     * Pot remains 520.
     */

    const turn = replayHandToAction(hand, 8);

    expect(turn.street).toBe("turn");

    expect(turn.board).toEqual([
      {
        rank: "7",
        suit: "diamonds",
      },
      {
        rank: "5",
        suit: "hearts",
      },
      {
        rank: "9",
        suit: "diamonds",
      },
      {
        rank: "7",
        suit: "clubs",
      },
    ]);

    expect(turn.pot).toBe(520);

    expect(turn.currentBet).toBe(0);

    expect(turn.playerContributions).toEqual({
      MrBlue: 0,
      MrBlonde: 0,
      MrWhite: 0,
      MrPink: 0,
      MrBrown: 0,
      Pluribus: 0,
    });

    /*
     * River:
     *
     * [7d 5h 9d 7c Qh]
     *
     * Before MrBlue's river bet, pot is still 520.
     */

    const riverBet = replayHandToAction(hand, 10);

    expect(riverBet.street).toBe("river");

    expect(riverBet.board).toEqual([
      {
        rank: "7",
        suit: "diamonds",
      },
      {
        rank: "5",
        suit: "hearts",
      },
      {
        rank: "9",
        suit: "diamonds",
      },
      {
        rank: "7",
        suit: "clubs",
      },
      {
        rank: "Q",
        suit: "hearts",
      },
    ]);

    expect(riverBet.pot).toBe(520);

    expect(riverBet.currentBet).toBe(0);

    expect(riverBet.playerContributions).toEqual({
      MrBlue: 0,
      MrBlonde: 0,
      MrWhite: 0,
      MrPink: 0,
      MrBrown: 0,
      Pluribus: 0,
    });

    expect(riverBet.totalContributions).toEqual({
      MrBlue: 210,
      MrBlonde: 100,
      MrWhite: 0,
      MrPink: 210,
      MrBrown: 0,
      Pluribus: 0,
    });

    expect(riverBet.targetAction).toEqual({
      playerId: "MrBlue",
      type: "bet",
      amount: 230,
      street: "river",
    });
  });
});