import {
  analyzeHandHistory,
  createAnalysisReport
} from "@poker-vision/hand-history";

import type {
  AnalysisReport,
  AnalyzeHandHistoryOptions
} from "@poker-vision/hand-history";

import type {
  VideoHand
} from "./video-hand.js";

import {
  videoHandToHandHistory
} from "./video-hand-to-hand-history.js";

import type {
  VideoHandMetadata
} from "./video-hand-to-hand-history.js";

export interface AnalyzeVideoHandOptions {
  metadata: VideoHandMetadata;
  analysis: AnalyzeHandHistoryOptions;
}

export function analyzeVideoHand(
  hand: VideoHand,
  options: AnalyzeVideoHandOptions
): AnalysisReport {
  const history =
    videoHandToHandHistory(
      hand,
      options.metadata
    );

  const analysis =
    analyzeHandHistory(
      history,
      options.analysis
    );

  return createAnalysisReport(
    analysis
  );
}