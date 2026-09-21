import type {
  AnalysisReport,
  HandHistory
} from "@poker-vision/hand-history";

import {
  createHandReview
} from "./create-hand-review.js";

import {
  serializeHandReview
} from "./serialize-hand-review.js";

export function exportHandReview(
  history: HandHistory,
  report: AnalysisReport
): string {
  const review =
    createHandReview(
      history,
      report
    );

  return serializeHandReview(
    review
  );
}