import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  HandReviewDecision,
} from "@poker-vision/hand-review";

import {
  createDecisionFilter,
  filterDecisions,
} from "./decision-filter";

const decisions: HandReviewDecision[] = [
  {
    actionIndex: 0,
    street: "preflop",
    action: "call",
    amount: 100,
    pot: 150,
    callAmount: 50,
    status: "analyzed",
  },
  {
    actionIndex: 1,
    street: "flop",
    action: "fold",
    amount: 0,
    pot: 300,
    callAmount: 100,
    status: "skipped",
    skipReason:
      "action_not_supported",
  },
  {
    actionIndex: 2,
    street: "flop",
    action: "call",
    amount: 200,
    pot: 400,
    callAmount: 200,
    status: "analyzed",
  },
  {
    actionIndex: 3,
    street: "turn",
    action: "raise",
    amount: 600,
    pot: 800,
    callAmount: 200,
    status: "analyzed",
  },
];

describe("decision filter", () => {
  it("creates an empty filter", () => {
    expect(
      createDecisionFilter(),
    ).toEqual({
      street: "all",
      action: "all",
      status: "all",
    });
  });

  it("returns all decisions when filters are all", () => {
    expect(
      filterDecisions(
        decisions,
        createDecisionFilter(),
      ),
    ).toEqual(decisions);
  });

  it("filters by street", () => {
    expect(
      filterDecisions(
        decisions,
        {
          street: "flop",
          action: "all",
          status: "all",
        },
      ).map(
        (decision) =>
          decision.actionIndex,
      ),
    ).toEqual([1, 2]);
  });

  it("filters by action", () => {
    expect(
      filterDecisions(
        decisions,
        {
          street: "all",
          action: "call",
          status: "all",
        },
      ).map(
        (decision) =>
          decision.actionIndex,
      ),
    ).toEqual([0, 2]);
  });

  it("filters by status", () => {
    expect(
      filterDecisions(
        decisions,
        {
          street: "all",
          action: "all",
          status: "skipped",
        },
      ).map(
        (decision) =>
          decision.actionIndex,
      ),
    ).toEqual([1]);
  });

  it("combines multiple filters", () => {
    expect(
      filterDecisions(
        decisions,
        {
          street: "flop",
          action: "call",
          status: "analyzed",
        },
      ).map(
        (decision) =>
          decision.actionIndex,
      ),
    ).toEqual([2]);
  });

  it("returns empty when nothing matches", () => {
    expect(
      filterDecisions(
        decisions,
        {
          street: "river",
          action: "call",
          status: "analyzed",
        },
      ),
    ).toEqual([]);
  });
});