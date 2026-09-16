import type {
  HandHistory
} from "@poker-vision/hand-history";

export type HandHistoryFormat =
  | "pokerstars"
  | "ggpoker"
  | "partypoker"
  | "unknown";

export interface ParseOptions {
  format?: HandHistoryFormat;
}

export interface ParseSuccess {
  success: true;
  hand: HandHistory;
  format: HandHistoryFormat;
}

export interface ParseFailure {
  success: false;
  error: {
    code: string;
    message: string;
    line?: number;
  };
}

export type ParseResult =
  | ParseSuccess
  | ParseFailure;