import type {
  ReviewSession,
} from "../model/review-session";

import type {
  DecisionReviewStateMap,
} from "../model/decision-review-state";

const STORAGE_KEY =
  "pokervision.review-session";

const DECISION_REVIEW_STORAGE_KEY =
  "pokervision.decision-review-state";

export function saveDecisionReviewState(
  state: DecisionReviewStateMap,
): void {
  localStorage.setItem(
    DECISION_REVIEW_STORAGE_KEY,
    JSON.stringify(state),
  );
}

export function loadDecisionReviewState():
  DecisionReviewStateMap {
  const value =
    localStorage.getItem(
      DECISION_REVIEW_STORAGE_KEY,
    );

  if (value === null) {
    return {};
  }

  try {
    const parsed: unknown =
      JSON.parse(value);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed as DecisionReviewStateMap;
  } catch {
    return {};
  }
}

export function clearDecisionReviewState():
  void {
  localStorage.removeItem(
    DECISION_REVIEW_STORAGE_KEY,
  );
}

export function saveReviewSession(
  session: ReviewSession,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(session),
  );
}

export function loadReviewSession():
  ReviewSession | null {
  const value =
    localStorage.getItem(
      STORAGE_KEY,
    );

  if (value === null) {
    return null;
  }

  try {
    const parsed: unknown =
      JSON.parse(value);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("hands" in parsed) ||
      !("selectedHandId" in parsed)
    ) {
      return null;
    }

    return parsed as ReviewSession;
  } catch {
    return null;
  }
}

export function clearReviewSession():
  void {
  localStorage.removeItem(
    STORAGE_KEY,
  );
}