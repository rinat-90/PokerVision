import {
  describe,
  expect,
  it
} from "vitest";

import { calculateEquity } from "./equity.js";
import type { Card } from "../types.js";

const card = (
  rank: Card["rank"],
  suit: Card["suit"]
): Card => ({
  rank,
  suit
});

describe("calculateEquity", () => {
  it("calculates equity for a known matchup", () => {
    const result = calculateEquity({
      heroCards: [
        card("A", "spades"),
        card("A", "hearts")
      ],
      villainCards: [
        card("K", "spades"),
        card("K", "hearts")
      ],
      board: [],
      iterations: 10_000
    });

    expect(result.total).toBe(10_000);

    expect(result.equity).toBeGreaterThan(0.75);
    expect(result.equity).toBeLessThan(0.90);
  });

  it("handles a flop", () => {
    const result = calculateEquity({
      heroCards: [
        card("A", "spades"),
        card("J", "spades")
      ],
      villainCards: [
        card("K", "clubs"),
        card("Q", "clubs")
      ],
      board: [
        card("K", "spades"),
        card("7", "hearts"),
        card("2", "clubs")
      ],
      iterations: 5_000
    });

    expect(result.total).toBe(5_000);

    expect(result.equity).toBeGreaterThan(0);
    expect(result.equity).toBeLessThan(1);
  });

  it("rejects duplicate cards", () => {
    expect(() =>
      calculateEquity({
        heroCards: [
          card("A", "spades"),
          card("A", "hearts")
        ],
        villainCards: [
          card("A", "spades"),
          card("K", "hearts")
        ],
        board: []
      })
    ).toThrow("Duplicate cards detected");
  });
});