import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  HandReview,
} from "@poker-vision/hand-review";

import {
  addHandToSession,
  createReviewSession,
  getSelectedSessionHand,
  selectSessionHand,
} from "./review-session";

function createHand(
  id: string,
): HandReview {
  return {
    id,
    gameFormat: "cash",

    blinds: {
      smallBlind: 50,
      bigBlind: 100,
      ante: 0,
    },

    players: [],
    streets: [],
    decisions: [],

    summary: {
      totalDecisionPoints: 0,
      analyzedDecisionPoints: 0,
      skippedDecisionPoints: 0,
      callDecisions: 0,
    },
  };
}

describe("ReviewSession", () => {
  it("starts empty", () => {
    const session =
      createReviewSession();

    expect(
      session.hands,
    ).toEqual([]);

    expect(
      session.selectedHandId,
    ).toBeNull();

    expect(
      getSelectedSessionHand(
        session,
      ),
    ).toBeNull();
  });

  it("adds and selects a hand", () => {
    const hand =
      createHand("100");

    const session =
      addHandToSession(
        createReviewSession(),
        hand,
      );

    expect(
      session.hands,
    ).toEqual([hand]);

    expect(
      session.selectedHandId,
    ).toBe("100");

    expect(
      getSelectedSessionHand(
        session,
      ),
    ).toBe(hand);
  });

  it("replaces a hand with the same id", () => {
    const first =
      createHand("100");

    const replacement: HandReview = {
      ...createHand("100"),

      blinds: {
        smallBlind: 100,
        bigBlind: 200,
        ante: 0,
      },
    };

    let session =
      addHandToSession(
        createReviewSession(),
        first,
      );

    session =
      addHandToSession(
        session,
        replacement,
      );

    expect(
      session.hands,
    ).toHaveLength(1);

    expect(
      session.hands[0],
    ).toBe(replacement);

    expect(
      session.selectedHandId,
    ).toBe("100");
  });

  it("selects an existing hand", () => {
    const first =
      createHand("100");

    const second =
      createHand("200");

    let session =
      createReviewSession();

    session =
      addHandToSession(
        session,
        first,
      );

    session =
      addHandToSession(
        session,
        second,
      );

    session =
      selectSessionHand(
        session,
        "100",
      );

    expect(
      session.selectedHandId,
    ).toBe("100");

    expect(
      getSelectedSessionHand(
        session,
      ),
    ).toBe(first);
  });

  it("ignores an unknown hand id", () => {
    const hand =
      createHand("100");

    const session =
      addHandToSession(
        createReviewSession(),
        hand,
      );

    const result =
      selectSessionHand(
        session,
        "missing",
      );

    expect(result).toBe(session);
  });
});