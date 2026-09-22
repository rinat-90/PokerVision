import type {
  HandReviewDecision,
} from "@poker-vision/hand-review";

export type DecisionFilterValue =
  | "all"
  | string;

export interface DecisionFilter {
  street: DecisionFilterValue;
  action: DecisionFilterValue;
  status:
    | "all"
    | "analyzed"
    | "skipped";
}

export function createDecisionFilter():
  DecisionFilter {
  return {
    street: "all",
    action: "all",
    status: "all",
  };
}

export function filterDecisions(
  decisions: HandReviewDecision[],
  filter: DecisionFilter,
): HandReviewDecision[] {
  return decisions.filter(
    (decision) => {
      if (
        filter.street !== "all" &&
        decision.street !== filter.street
      ) {
        return false;
      }

      if (
        filter.action !== "all" &&
        decision.action !== filter.action
      ) {
        return false;
      }

      if (
        filter.status !== "all" &&
        decision.status !== filter.status
      ) {
        return false;
      }

      return true;
    },
  );
}