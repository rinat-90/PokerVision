import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { parsePluribusHand } from "./pluribus.js";

describe("parsePluribusHand", () => {
  it("parses Pluribus Hand #100000", () => {
    const filePath = resolve(
      process.cwd(),
      "fixtures/pluribus/pluribus_100.txt",
    );

    const input = readFileSync(filePath, "utf8");

    const hands = input.split(
      /(?=^PokerStars Hand #)/m
    );

    const firstHand = hands[0];

    if (firstHand === undefined) {
      throw new Error(
        "Could not find first Pluribus hand"
      );
    }

    const hand = parsePluribusHand(firstHand);

    expect(hand.id).toBe("100000");

    expect(hand.smallBlind).toBe(50);
    expect(hand.bigBlind).toBe(100);

    expect(hand.players).toHaveLength(6);

    const playersByName = new Map(
      hand.players.map((player) => [
        player.name,
        player,
      ])
    );

    expect(
      playersByName.get("Pluribus")?.position
    ).toBe("BTN");

    expect(
      playersByName.get("MrBlue")?.position
    ).toBe("SB");

    expect(
      playersByName.get("MrBlonde")?.position
    ).toBe("BB");

    expect(
      playersByName.get("MrWhite")?.position
    ).toBe("UTG");

    expect(
      playersByName.get("MrPink")?.position
    ).toBe("UTG+1");

    expect(
      playersByName.get("MrBrown")?.position
    ).toBe("MP");

    expect(
      playersByName.get("MrBlue")?.holeCards
    ).toEqual([
      {
        rank: "T",
        suit: "clubs",
      },
      {
        rank: "Q",
        suit: "clubs",
      },
    ]);

    expect(
      playersByName.get("MrPink")?.holeCards
    ).toEqual([
      {
        rank: "A",
        suit: "hearts",
      },
      {
        rank: "4",
        suit: "hearts",
      },
    ]);

    expect(hand.forcedBets).toEqual([
      {
        playerId: "MrBlue",
        type: "small_blind",
        amount: 50,
      },
      {
        playerId: "MrBlonde",
        type: "big_blind",
        amount: 100,
      },
    ]);

    expect(hand.streets).toHaveLength(4);

    const preflop = hand.streets[0];
    const flop = hand.streets[1];
    const turn = hand.streets[2];
    const river = hand.streets[3];

    expect(preflop?.street).toBe("preflop");
    expect(preflop?.board).toEqual([]);
    expect(preflop?.actions).toHaveLength(6);

    expect(flop?.street).toBe("flop");
    expect(flop?.board).toEqual([
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
    expect(flop?.actions).toHaveLength(2);

    expect(turn?.street).toBe("turn");
    expect(turn?.board).toEqual([
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
    expect(turn?.actions).toHaveLength(2);

    expect(river?.street).toBe("river");
    expect(river?.board).toEqual([
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
    expect(river?.actions).toHaveLength(2);

    const actions = hand.streets.flatMap(
      (street) => street.actions
    );

    expect(actions).toHaveLength(12);

    expect(actions.map((action) => action.type)).toEqual([
      "fold",
      "raise",
      "fold",
      "fold",
      "call",
      "fold",
      "check",
      "check",
      "check",
      "check",
      "bet",
      "fold",
    ]);
  });
});