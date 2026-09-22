import type {
  SessionDecision,
} from "./session-decisions";

export type SessionDecisionSort =
  | "session"
  | "ev-desc"
  | "ev-asc";

export function sortSessionDecisions(
  decisions: SessionDecision[],
  sort: SessionDecisionSort,
): SessionDecision[] {
  if (sort === "session") {
    return [...decisions];
  }

  return [...decisions].sort(
    (left, right) => {
      const leftEv =
        left.decision.expectedValue;
      const rightEv =
        right.decision.expectedValue;

      if (
        leftEv === undefined &&
        rightEv === undefined
      ) {
        return 0;
      }

      if (leftEv === undefined) {
        return 1;
      }

      if (rightEv === undefined) {
        return -1;
      }

      return sort === "ev-desc"
        ? rightEv - leftEv
        : leftEv - rightEv;
    },
  );
}