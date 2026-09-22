import type {
  SessionDecision,
} from "./session-decisions";

export type DecisionEvBucket =
  | "all"
  | "positive"
  | "neutral"
  | "negative"
  | "unavailable";

export function filterSessionDecisionsByEv(
  decisions: SessionDecision[],
  bucket: DecisionEvBucket,
): SessionDecision[] {
  if (bucket === "all") {
    return [...decisions];
  }

  return decisions.filter(
    ({ decision }) => {
      const ev =
        decision.expectedValue;

      if (bucket === "unavailable") {
        return ev === undefined;
      }

      if (ev === undefined) {
        return false;
      }

      if (bucket === "positive") {
        return ev > 0;
      }

      if (bucket === "negative") {
        return ev < 0;
      }

      return ev === 0;
    },
  );
}

export interface DecisionEvSummary {
  all: number;
  positive: number;
  neutral: number;
  negative: number;
  unavailable: number;
}

export function createDecisionEvSummary(
  decisions: SessionDecision[],
): DecisionEvSummary {
  const summary: DecisionEvSummary = {
    all: decisions.length,
    positive: 0,
    neutral: 0,
    negative: 0,
    unavailable: 0,
  };

  for (const { decision } of decisions) {
    const ev =
      decision.expectedValue;

    if (ev === undefined) {
      summary.unavailable += 1;
    } else if (ev > 0) {
      summary.positive += 1;
    } else if (ev < 0) {
      summary.negative += 1;
    } else {
      summary.neutral += 1;
    }
  }

  return summary;
}