export type ParserErrorCode =
  | "EMPTY_INPUT"
  | "UNKNOWN_FORMAT"
  | "INVALID_HEADER"
  | "INVALID_PLAYER"
  | "INVALID_ACTION"
  | "INVALID_CARD"
  | "INVALID_STREET"
  | "INVALID_HAND";

export class HandHistoryParserError
  extends Error {
  readonly code: ParserErrorCode;
  readonly line?: number;

  constructor(
    code: ParserErrorCode,
    message: string,
    line?: number
  ) {
    super(message);

    this.name =
      "HandHistoryParserError";

    this.code = code;

    if (line !== undefined) {
      this.line = line;
    }
  }
}