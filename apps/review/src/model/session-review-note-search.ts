import type {
  SessionReviewNote,
} from "./session-review-notes";

export function searchSessionReviewNotes(
  notes: SessionReviewNote[],
  query: string,
): SessionReviewNote[] {
  const normalizedQuery =
    query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return notes;
  }

  return notes.filter(
    ({ handId, decision, note }) => {
      const searchableText = [
        handId,
        decision.street,
        decision.action,
        note,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedQuery,
      );
    },
  );
}