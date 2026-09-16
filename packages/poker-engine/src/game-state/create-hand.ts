import type {
  GameFormat,
  HandState,
  Player
} from "./types.js";

export interface CreateHandOptions {
  id: string;
  gameFormat: GameFormat;
  smallBlind: number;
  bigBlind: number;
  ante?: number;
  players: Player[];
}

export function createHand(
  options: CreateHandOptions
): HandState {
  const {
    id,
    gameFormat,
    smallBlind,
    bigBlind,
    ante = 0,
    players
  } = options;

  if (players.length < 2) {
    throw new Error(
      "A hand requires at least two players"
    );
  }

  if (smallBlind <= 0) {
    throw new Error(
      "Small blind must be greater than 0"
    );
  }

  if (bigBlind <= 0) {
    throw new Error(
      "Big blind must be greater than 0"
    );
  }

  if (bigBlind < smallBlind) {
    throw new Error(
      "Big blind must be greater than or equal to small blind"
    );
  }

  if (ante < 0) {
    throw new Error(
      "Ante cannot be negative"
    );
  }

  const playerIds = players.map(
    (player) => player.id
  );

  if (
    new Set(playerIds).size !==
    playerIds.length
  ) {
    throw new Error(
      "Player IDs must be unique"
    );
  }

  const playerContributions =
    Object.fromEntries(
      players.map((player) => [
        player.id,
        0
      ])
    );

  const totalContributions =
    Object.fromEntries(
      players.map((player) => [
        player.id,
        0
      ])
    );

  return {
    id,
    gameFormat,
    street: "preflop",
    smallBlind,
    bigBlind,
    ante,
    players,
    board: [],
    pot: 0,
    actions: [],
    currentPlayerId: null,
    playersToAct: [],
    currentBet: 0,
    minimumRaise: bigBlind,
    lastAggressorId: null,
    playerContributions,
    totalContributions,
    bettingRoundComplete: false
  };
}