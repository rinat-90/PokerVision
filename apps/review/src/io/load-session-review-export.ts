import type {
  DecisionReviewStateMap,
} from "../model/decision-review-state";

import type {
  ReviewSession,
} from "../model/review-session";

import type {
  SessionReviewExport,
} from "../model/session-review-export";

export interface ImportedSessionReview {
  session: ReviewSession;
  decisionReviewState: DecisionReviewStateMap;
}

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isSessionReviewExport(
  value: unknown,
): value is SessionReviewExport {
  if (!isObject(value)) {
    return false;
  }

  return (
    value.version === 1 &&
    typeof value.exportedAt === "string" &&
    Array.isArray(value.hands) &&
    Array.isArray(value.decisions)
  );
}

export function parseSessionReviewExport(
  text: string,
): ImportedSessionReview {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(
      "Invalid session review JSON",
    );
  }

  if (!isSessionReviewExport(parsed)) {
    throw new Error(
      "Invalid PokerVision session review export",
    );
  }

  const decisionReviewState:
    DecisionReviewStateMap = {};

  for (const decision of parsed.decisions) {
    if (
      typeof decision.handId !== "string" ||
      typeof decision.actionIndex !== "number" ||
      typeof decision.reviewed !== "boolean" ||
      typeof decision.note !== "string"
    ) {
      throw new Error(
        "Invalid decision review state",
      );
    }

    const key =
      `${decision.handId}:${decision.actionIndex}`;

    decisionReviewState[key] = {
      reviewed: decision.reviewed,
      note: decision.note,
    };
  }

  return {
    session: {
      hands: parsed.hands,

      selectedHandId:
        parsed.hands[0]?.id ?? null,
    },

    decisionReviewState,
  };
}

export async function loadSessionReviewExport(
  file: File,
): Promise<ImportedSessionReview> {
  return parseSessionReviewExport(
    await file.text(),
  );
}