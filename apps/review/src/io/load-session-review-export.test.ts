import {
  describe,
  expect,
  it,
} from "vitest";

import {
  parseSessionReviewExport,
} from "./load-session-review-export";

function createExport() {
  return {
    version: 1,

    exportedAt:
      "2026-09-22T12:00:00.000Z",

    summary: {
      totalHands: 2,
      totalDecisionPoints: 2,
      analyzedDecisionPoints: 2,
      skippedDecisionPoints: 0,
      callDecisions: 1,
      completedHands: 0,
      totalNetResult: 0,
    },

    results: [],

    decisions: [
      {
        handId: "100001",
        actionIndex: 3,
        street: "flop",
        action: "call",
        reviewed: true,
        note: "Bad call",
      },
      {
        handId: "100002",
        actionIndex: 7,
        street: "turn",
        action: "fold",
        reviewed: false,
        note: "",
      },
    ],

    hands: [
      {
        id: "100001",
        heroPlayerId: "hero",
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
      },
      {
        id: "100002",
        heroPlayerId: "hero",
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
      },
    ],
  };
}

describe(
  "parseSessionReviewExport",
  () => {
    it("restores hands and selects the first hand", () => {
      const imported =
        parseSessionReviewExport(
          JSON.stringify(
            createExport(),
          ),
        );

      expect(
        imported.session.hands.map(
          (hand) => hand.id,
        ),
      ).toEqual([
        "100001",
        "100002",
      ]);

      expect(
        imported.session.selectedHandId,
      ).toBe("100001");
    });

    it("restores decision review state", () => {
      const imported =
        parseSessionReviewExport(
          JSON.stringify(
            createExport(),
          ),
        );

      expect(
        imported.decisionReviewState,
      ).toEqual({
        "100001:3": {
          reviewed: true,
          note: "Bad call",
        },

        "100002:7": {
          reviewed: false,
          note: "",
        },
      });
    });

    it("rejects invalid JSON", () => {
      expect(() =>
        parseSessionReviewExport(
          "{invalid",
        ),
      ).toThrow(
        "Invalid session review JSON",
      );
    });

    it("rejects unsupported versions", () => {
      const value = createExport();

      expect(() =>
        parseSessionReviewExport(
          JSON.stringify({
            ...value,
            version: 2,
          }),
        ),
      ).toThrow(
        "Invalid PokerVision session review export",
      );
    });

    it("rejects invalid decision review state", () => {
      const value = createExport();

      expect(() =>
        parseSessionReviewExport(
          JSON.stringify({
            ...value,

            decisions: [
              {
                ...value.decisions[0],
                reviewed: "yes",
              },
            ],
          }),
        ),
      ).toThrow(
        "Invalid decision review state",
      );
    });

    it("supports an empty session", () => {
      const value = createExport();

      const imported =
        parseSessionReviewExport(
          JSON.stringify({
            ...value,
            hands: [],
            decisions: [],
          }),
        );

      expect(
        imported.session,
      ).toEqual({
        hands: [],
        selectedHandId: null,
      });

      expect(
        imported.decisionReviewState,
      ).toEqual({});
    });
  },
);