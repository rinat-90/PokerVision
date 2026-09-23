import type {
  SessionHandResult,
} from "./session-results";

export type SessionResultFilter =
  | "all"
  | "wins"
  | "losses";

export function filterSessionResults(
  results: SessionHandResult[],
  filter: SessionResultFilter,
): SessionHandResult[] {
  switch (filter) {
    case "wins":
      return results.filter(
        (result) =>
          result.netResult > 0,
      );

    case "losses":
      return results.filter(
        (result) =>
          result.netResult < 0,
      );

    case "all":
      return results;
  }
}