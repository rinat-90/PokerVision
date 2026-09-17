import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { parsePluribusHand } from "./pluribus.js";
import { validateHandHistory } from "../validate-hand-history.js";

import { fileURLToPath } from "node:url";

describe("Pluribus hand validation", () => {
  it("parses and validates Pluribus Hand #100000", () => {
    const fixturePath = fileURLToPath(
      new URL(
        "../../fixtures/pluribus/pluribus_100.txt",
        import.meta.url
      )
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
  });
});