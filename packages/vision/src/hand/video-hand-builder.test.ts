import {
  describe,
  expect,
  it
} from "vitest";

import type {
  RecognizedCard
} from "../card/card-recognizer.js";

import {
  VideoHandBuilder
} from "./video-hand-builder.js";

function card(
  rank: RecognizedCard["rank"],
  suit: RecognizedCard["suit"]
): RecognizedCard {
  return {
    rank,
    suit,
    rankConfidence: 1,
    suitConfidence: 1,
    confidence: 1
  };
}

describe("VideoHandBuilder", () => {
  it("builds a hand from lifecycle and board events", () => {
    const builder = new VideoHandBuilder();

    builder.start(0, [
      { seatIndex: 0, hasCards: true },
      { seatIndex: 1, hasCards: true },
      { seatIndex: 2, hasCards: true },
      { seatIndex: 4, hasCards: true },
      { seatIndex: 5, hasCards: true }
    ]);

    builder.addBoardEvent(12, {
      type: "flopDealt",
      cards: [
        card("2", "hearts"),
        card("6", "hearts"),
        card("5", "hearts")
      ]
    });

    builder.addBoardEvent(22, {
      type: "turnDealt",
      card: card("5", "clubs")
    });

    const hand = builder.complete(27);

    expect(hand.startedAt).toBe(0);
    expect(hand.completedAt).toBe(27);

    expect(hand.players).toHaveLength(5);

    expect(hand.streets).toHaveLength(2);

    expect(hand.streets[0]).toMatchObject({
      street: "flop",
      timestampSeconds: 12,
      board: [
        { rank: "2", suit: "hearts" },
        { rank: "6", suit: "hearts" },
        { rank: "5", suit: "hearts" }
      ]
    });

    expect(hand.streets[1]).toMatchObject({
      street: "turn",
      timestampSeconds: 22,
      board: [
        { rank: "2", suit: "hearts" },
        { rank: "6", suit: "hearts" },
        { rank: "5", suit: "hearts" },
        { rank: "5", suit: "clubs" }
      ]
    });
  });

  it("resets state when a new hand starts", () => {
    const builder = new VideoHandBuilder();

    builder.start(0, [
      { seatIndex: 0, hasCards: true }
    ]);

    builder.addBoardEvent(12, {
      type: "flopDealt",
      cards: [
        card("2", "hearts"),
        card("6", "hearts"),
        card("5", "hearts")
      ]
    });

    builder.start(30, [
      { seatIndex: 1, hasCards: true },
      { seatIndex: 2, hasCards: true }
    ]);

    const hand = builder.complete(50);

    expect(hand.startedAt).toBe(30);
    expect(hand.completedAt).toBe(50);
    expect(hand.players).toEqual([
      { seatIndex: 1, hasCards: true },
      { seatIndex: 2, hasCards: true }
    ]);
    expect(hand.streets).toEqual([]);
  });
  it(
    "builds a partial hand when the recording starts mid-hand",
    () => {
      const builder =
        new VideoHandBuilder();

      builder.startPartial([
        {
          seatIndex: 0,
          hasCards: true
        },
        {
          seatIndex: 1,
          hasCards: true
        },
        {
          seatIndex: 4,
          hasCards: true
        }
      ]);

      const hand =
        builder.complete(27);

      expect(hand).toEqual({
        startedAt: null,
        completedAt: 27,
        players: [
          {
            seatIndex: 0,
            hasCards: true
          },
          {
            seatIndex: 1,
            hasCards: true
          },
          {
            seatIndex: 4,
            hasCards: true
          }
        ],
        streets: []
      });
    }
  );
});