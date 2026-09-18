import type {
  TableStateDiff
} from "./table-state-diff.js";

export type TableEventType =
  | "cardsAppeared"
  | "cardsDisappeared";

export interface TableEvent {
  type: TableEventType;
  seatIndex: number;
}

export function detectTableEvents(
  diff: TableStateDiff
): TableEvent[] {
  const events:
    TableEvent[] = [];

  for (
    const change
    of diff.seatChanges
    ) {
    if (
      change.previousHasCards ===
      false &&
      change.currentHasCards ===
      true
    ) {
      events.push({
        type:
          "cardsAppeared",
        seatIndex:
        change.index
      });

      continue;
    }

    if (
      change.previousHasCards ===
      true &&
      change.currentHasCards ===
      false
    ) {
      events.push({
        type:
          "cardsDisappeared",
        seatIndex:
        change.index
      });
    }
  }

  return events;
}