import type {
  ReviewSession,
} from "../model/review-session";

const STORAGE_KEY =
  "pokervision.review-session";

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