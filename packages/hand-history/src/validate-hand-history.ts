import type {
  Card,
  Street
} from "@poker-vision/poker-engine";

import type {
  HandHistory
} from "./types.js";

const STREET_ORDER: Street[] = [
  "preflop",
  "flop",
  "turn",
  "river",
  "showdown"
];

const EXPECTED_BOARD_SIZE: Record<
  Street,
  number
> = {
  preflop: 0,
  flop: 3,
  turn: 4,
  river: 5,
  showdown: 5
};

export function validateHandHistory(
  hand: HandHistory
): void {
  if (hand.id.trim() === "") {
    throw new Error(
      "Hand history id cannot be empty"
    );
  }

  if (hand.players.length < 2) {
    throw new Error(
      "A hand history requires at least two players"
    );
  }

  if (hand.smallBlind <= 0) {
    throw new Error(
      "Small blind must be greater than zero"
    );
  }

  if (hand.bigBlind <= 0) {
    throw new Error(
      "Big blind must be greater than zero"
    );
  }

  if (hand.bigBlind < hand.smallBlind) {
    throw new Error(
      "Big blind cannot be smaller than small blind"
    );
  }

  validatePlayers(hand);
  validateStreets(hand);
  validateCards(hand);
}

function validatePlayers(
  hand: HandHistory
): void {
  const playerIds = new Set<string>();

  for (const player of hand.players) {
    if (player.id.trim() === "") {
      throw new Error(
        "Player id cannot be empty"
      );
    }

    if (playerIds.has(player.id)) {
      throw new Error(
        `Duplicate player id: ${player.id}`
      );
    }

    playerIds.add(player.id);

    if (player.startingStack < 0) {
      throw new Error(
        `Player ${player.id} cannot have a negative starting stack`
      );
    }
  }
}

function validateStreets(
  hand: HandHistory
): void {
  let previousStreetIndex = -1;

  for (const street of hand.streets) {
    const streetIndex =
      STREET_ORDER.indexOf(street.street);

    if (streetIndex === -1) {
      throw new Error(
        `Unknown street: ${street.street}`
      );
    }

    if (streetIndex <= previousStreetIndex) {
      throw new Error(
        "Streets must be in chronological order"
      );
    }

    previousStreetIndex = streetIndex;

    const expectedBoardSize =
      EXPECTED_BOARD_SIZE[street.street];

    if (
      street.board.length !==
      expectedBoardSize
    ) {
      throw new Error(
        `${street.street} must contain ${expectedBoardSize} board cards`
      );
    }

    for (const action of street.actions) {
      const playerExists =
        hand.players.some(
          (player) =>
            player.id === action.playerId
        );

      if (!playerExists) {
        throw new Error(
          `Action references unknown player: ${action.playerId}`
        );
      }

      if (action.amount < 0) {
        throw new Error(
          "Action amount cannot be negative"
        );
      }

      if (
        action.amountType !== "contribution" &&
        action.amountType !== "total"
      ) {
        throw new Error(
          `Invalid action amount type: ${action.amountType}`
        );
      }
    }
  }
}

function validateCards(
  hand: HandHistory
): void {
  const cards: Card[] = [];

  for (const player of hand.players) {
    if (player.holeCards !== undefined) {
      cards.push(...player.holeCards);
    }
  }

  const lastBoardStreet =
    [...hand.streets]
      .reverse()
      .find(
        (street) =>
          street.board.length > 0
      );

  if (lastBoardStreet !== undefined) {
    cards.push(...lastBoardStreet.board);
  }

  const cardKeys = new Set<string>();

  for (const card of cards) {
    const key =
      `${card.rank}:${card.suit}`;

    if (cardKeys.has(key)) {
      throw new Error(
        `Duplicate card detected: ${key}`
      );
    }

    cardKeys.add(key);
  }
}