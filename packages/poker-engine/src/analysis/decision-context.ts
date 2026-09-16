import type {
  Card,
  HandState,
  PlayerAction
} from "../index.js";

export interface DecisionContext {
  playerId: string;

  street: HandState["street"];

  board: Card[];

  holeCards: [Card, Card];

  pot: number;

  currentBet: number;

  currentStreetContribution: number;

  callAmount: number;

  actionIndex: number;
}

export function createDecisionContext(
  state: HandState,
  playerId: string
): DecisionContext {
  const player = state.players.find(
    (currentPlayer) =>
      currentPlayer.id === playerId
  );

  if (player === undefined) {
    throw new Error(
      `Player not found: ${playerId}`
    );
  }

  if (player.holeCards === undefined) {
    throw new Error(
      `Player ${playerId} has no hole cards`
    );
  }

  const action = findPendingAction(
    state,
    playerId
  );

  if (action === null) {
    throw new Error(
      `Player ${playerId} has no pending decision`
    );
  }

  const currentStreetContribution =
    state.playerContributions[playerId] ?? 0;

  const callAmount =
    Math.max(
      0,
      state.currentBet -
      currentStreetContribution
    );

  return {
    playerId,

    street: state.street,

    board: [...state.board],

    holeCards: player.holeCards,

    pot: state.pot,

    currentBet: state.currentBet,

    currentStreetContribution,

    callAmount,

    actionIndex: state.actions.length
  };
}

function findPendingAction(
  state: HandState,
  playerId: string
): PlayerAction | null {
  if (
    state.currentPlayerId !== playerId
  ) {
    return null;
  }

  return state.actions.at(-1) ?? null;
}