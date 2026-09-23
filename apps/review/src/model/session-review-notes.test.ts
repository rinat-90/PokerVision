import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createDecisionReviewKey,
} from "./decision-review-state";

import type {
  DecisionReviewStateMap,
} from "./decision-review-state";

import {
  createSessionReviewNotes,
} from "./session-review-notes";

import type {
  SessionDecision,
} from "./session-decisions";

function createDecision(
  handId: string,
  actionIndex: number,
): SessionDecision {
  return {
    handId,
    decision: {
      actionIndex,
      street: "flop",
      action: "call",
    },
  } as SessionDecision;
}

describe(
  "session review notes",
  () => {
    const decisions = [
      createDecision("100001", 2),
      createDecision("100001", 5),
      createDecision("100002", 3),
    ];

    it("returns empty notes", () => {
      expect(
        createSessionReviewNotes(
          decisions,
          {},
        ),
      ).toEqual([]);
    });

    it("returns decisions with notes", () => {
      const states: DecisionReviewStateMap =
        {
          [createDecisionReviewKey(
            decisions[0],
          )]: {
            reviewed: true,
            note: "Check pot odds",
          },

          [createDecisionReviewKey(
            decisions[2],
          )]: {
            reviewed: false,
            note: "Possible overcall",
          },
        };

      const notes =
        createSessionReviewNotes(
          decisions,
          states,
        );

      expect(notes).toHaveLength(2);

      expect(notes[0]).toEqual({
        handId: "100001",
        decision:
        decisions[0].decision,
        note: "Check pot odds",
      });

      expect(notes[1]).toEqual({
        handId: "100002",
        decision:
        decisions[2].decision,
        note: "Possible overcall",
      });
    });

    it("ignores empty and whitespace-only notes", () => {
      const states: DecisionReviewStateMap =
        {
          [createDecisionReviewKey(
            decisions[0],
          )]: {
            reviewed: false,
            note: "",
          },

          [createDecisionReviewKey(
            decisions[1],
          )]: {
            reviewed: false,
            note: "   ",
          },

          [createDecisionReviewKey(
            decisions[2],
          )]: {
            reviewed: false,
            note: "Keep this",
          },
        };

      const notes =
        createSessionReviewNotes(
          decisions,
          states,
        );

      expect(notes).toHaveLength(1);
      expect(notes[0].note).toBe(
        "Keep this",
      );
    });

    it("trims note text", () => {
      const states: DecisionReviewStateMap =
        {
          [createDecisionReviewKey(
            decisions[0],
          )]: {
            reviewed: false,
            note: "  Review sizing  ",
          },
        };

      expect(
        createSessionReviewNotes(
          decisions,
          states,
        )[0].note,
      ).toBe("Review sizing");
    });
  },
);