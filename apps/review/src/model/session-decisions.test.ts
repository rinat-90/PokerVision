import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  HandReview,
} from "@poker-vision/hand-review";

import type {
  ReviewSession,
} from "./review-session";

import {
  filterSessionDecisions,
  getSessionDecisions,
} from "./session-decisions";

function createHand(
  id: string,
  decisions: HandReview["decisions"],
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
    decisions,
    summary: {
      totalDecisionPoints:
      decisions.length,
      analyzedDecisionPoints:
      decisions.filter(
        (decision) =>
          decision.status ===
          "analyzed",
      ).length,
      skippedDecisionPoints:
      decisions.filter(
        (decision) =>
          decision.status ===
          "skipped",
      ).length,
      callDecisions:
      decisions.filter(
        (decision) =>
          decision.action ===
          "call",
      ).length,
    },
  };
}

describe("getSessionDecisions", () => {
  it("returns empty for an empty session", () => {
    const session: ReviewSession = {
      hands: [],
      selectedHandId: null,
    };

    expect(
      getSessionDecisions(session),
    ).toEqual([]);
  });

  it("collects decisions from all hands", () => {
    const session: ReviewSession = {
      hands: [
        createHand(
          "100000",
          [
            {
              actionIndex: 1,
              street: "preflop",
              action: "call",
              amount: 100,
              pot: 150,
              callAmount: 50,
              status: "analyzed",
            },
            {
              actionIndex: 4,
              street: "flop",
              action: "fold",
              amount: 0,
              pot: 400,
              callAmount: 200,
              status: "skipped",
              skipReason:
                "action_not_supported",
            },
          ],
        ),
        createHand(
          "100001",
          [
            {
              actionIndex: 2,
              street: "turn",
              action: "call",
              amount: 300,
              pot: 900,
              callAmount: 300,
              status: "analyzed",
            },
          ],
        ),
      ],
      selectedHandId: "100000",
    };

    expect(
      getSessionDecisions(session).map(
        ({
           handId,
           decision,
         }) => ({
          handId,
          actionIndex:
          decision.actionIndex,
        }),
      ),
    ).toEqual([
      {
        handId: "100000",
        actionIndex: 1,
      },
      {
        handId: "100000",
        actionIndex: 4,
      },
      {
        handId: "100001",
        actionIndex: 2,
      },
    ]);
  });

  it("preserves hand and decision order", () => {
    const session: ReviewSession = {
      hands: [
        createHand(
          "A",
          [
            {
              actionIndex: 5,
              street: "flop",
              action: "call",
              amount: 100,
              pot: 300,
              callAmount: 100,
              status: "analyzed",
            },
            {
              actionIndex: 8,
              street: "turn",
              action: "call",
              amount: 200,
              pot: 500,
              callAmount: 200,
              status: "analyzed",
            },
          ],
        ),
        createHand(
          "B",
          [
            {
              actionIndex: 1,
              street: "preflop",
              action: "fold",
              amount: 0,
              pot: 150,
              callAmount: 100,
              status: "skipped",
              skipReason:
                "action_not_supported",
            },
          ],
        ),
      ],
      selectedHandId: "B",
    };

    const result =
      getSessionDecisions(session);

    expect(
      result.map(
        ({
           handId,
           decision,
         }) =>
          `${handId}:${decision.actionIndex}`,
      ),
    ).toEqual([
      "A:5",
      "A:8",
      "B:1",
    ]);
  });
  it("filters decisions across multiple hands", () => {
    const session: ReviewSession = {
      hands: [
        createHand(
          "A",
          [
            {
              actionIndex: 1,
              street: "flop",
              action: "call",
              amount: 100,
              pot: 300,
              callAmount: 100,
              status: "analyzed",
            },
            {
              actionIndex: 2,
              street: "turn",
              action: "fold",
              amount: 0,
              pot: 500,
              callAmount: 200,
              status: "skipped",
              skipReason:
                "action_not_supported",
            },
          ],
        ),
        createHand(
          "B",
          [
            {
              actionIndex: 3,
              street: "flop",
              action: "call",
              amount: 200,
              pot: 600,
              callAmount: 200,
              status: "analyzed",
            },
          ],
        ),
      ],
      selectedHandId: "A",
    };

    const decisions =
      getSessionDecisions(session);

    const result =
      filterSessionDecisions(
        decisions,
        {
          street: "flop",
          action: "call",
          status: "analyzed",
        },
      );

    expect(
      result.map(
        ({
           handId,
           decision,
         }) =>
          `${handId}:${decision.actionIndex}`,
      ),
    ).toEqual([
      "A:1",
      "B:3",
    ]);
  });
});