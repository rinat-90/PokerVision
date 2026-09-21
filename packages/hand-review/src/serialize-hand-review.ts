import type {
  HandReview
} from "./hand-review.js";

export function serializeHandReview(
  review: HandReview
): string {
  return JSON.stringify(
    review,
    null,
    2
  );
}