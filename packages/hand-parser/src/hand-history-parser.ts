import type {
  ParseOptions,
  ParseResult
} from "./types.js";

export interface HandHistoryParser {
  parse(
    input: string,
    options?: ParseOptions
  ): ParseResult;
}