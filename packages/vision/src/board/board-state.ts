export type PokerStreet =
  | "preflop"
  | "flop"
  | "turn"
  | "river"
  | "unknown";

export interface BoardState {
  cardCount: number;
  street: PokerStreet;
}

export function createBoardState(
  cardCount: number
): BoardState {
  switch (cardCount) {
    case 0:
      return {
        cardCount,
        street:
          "preflop"
      };

    case 3:
      return {
        cardCount,
        street:
          "flop"
      };

    case 4:
      return {
        cardCount,
        street:
          "turn"
      };

    case 5:
      return {
        cardCount,
        street:
          "river"
      };

    default:
      return {
        cardCount,
        street:
          "unknown"
      };
  }
}