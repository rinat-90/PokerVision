import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  SessionDecision,
} from "./session-decisions";

import {
  sortSessionDecisions,
} from "./session-decision-sort";

function createDecision(
  handId: string,
  actionIndex: number,
  expectedValue?: number,
): SessionDecision {
  return {
    handId,
    decision: {
      actionIndex,
      street: "flop",
      action: "call",
      amount: 100,
      pot: 300,
      callAmount: 100,
      status:
        expectedValue === undefined
          ? "skipped"
          : "analyzed",
      expectedValue,
    },
  };
}

describe("sortSessionDecisions", () => {
  const decisions = [
    createDecision(
      "A",
      1,
      -3.5,
    ),
    createDecision(
      "A",
      2,
      undefined,
    ),
    createDecision(
      "B",
      3,
      557,
    ),
    createDecision(
      "B",
      4,
      0,
    ),
  ];

  it("preserves session order", () => {
    const result =
      sortSessionDecisions(
        decisions,
        "session",
      );

    expect(
      result.map(
        ({ handId, decision }) =>
          `${handId}:${decision.actionIndex}`,
      ),
    ).toEqual([
      "A:1",
      "A:2",
      "B:3",
      "B:4",
    ]);
  });

  it("sorts EV high to low", () => {
    const result =
      sortSessionDecisions(
        decisions,
        "ev-desc",
      );

    expect(
      result.map(
        ({ decision }) =>
          decision.expectedValue,
      ),
    ).toEqual([
      557,
      0,
      -3.5,
      undefined,
    ]);
  });

  it("sorts EV low to high", () => {
    const result =
      sortSessionDecisions(
        decisions,
        "ev-asc",
      );

    expect(
      result.map(
        ({ decision }) =>
          decision.expectedValue,
      ),
    ).toEqual([
      -3.5,
      0,
      557,
      undefined,
    ]);
  });

  it("does not mutate the original decisions", () => {
    const original = [
      ...decisions,
    ];

    sortSessionDecisions(
      decisions,
      "ev-desc",
    );

    expect(decisions).toEqual(
      original,
    );
  });
});