import type {
  HandState,
  Player,
  PlayerAction
} from "./types.js";

const POSITION_ORDER = [
  "UTG",
  "UTG+1",
  "MP",
  "HJ",
  "CO",
  "BTN",
  "SB",
  "BB"
] as const;

export interface BettingRoundResult {
  playersToAct: string[];
  currentPlayerId: string | null;
  bettingRoundComplete: boolean;
}

export function initializeBettingRound(
  state: HandState,
  firstPlayerId: string
): BettingRoundResult {
  const firstPlayer = state.players.find(
    (player) => player.id === firstPlayerId
  );

  if (firstPlayer === undefined) {
    throw new Error(
      `Player not found: ${firstPlayerId}`
    );
  }

  const activePlayers = state.players.filter(
    (player) => player.status === "active"
  );

  const orderedPlayers =
    getPlayersStartingFrom(
      activePlayers,
      firstPlayer
    );

  const playersToAct = orderedPlayers.map(
    (player) => player.id
  );

  return {
    playersToAct,
    currentPlayerId:
      playersToAct[0] ?? null,
    bettingRoundComplete:
      playersToAct.length === 0
  };
}

export function applyBettingRoundAction(
  state: HandState,
  action: PlayerAction,
  updatedPlayers: Player[],
  newCurrentBet: number
): BettingRoundResult {
  const actor = updatedPlayers.find(
    (player) => player.id === action.playerId
  );

  if (actor === undefined) {
    throw new Error(
      `Player not found: ${action.playerId}`
    );
  }

  /*
   * Folding ends the hand immediately when only one
   * active player remains.
   *
   * This is different from an all-in situation:
   * an all-in player can still have an active opponent
   * who needs to call the remaining bet.
   */
  if (action.type === "fold") {
    const activePlayers = updatedPlayers.filter(
      (player) => player.status === "active"
    );

    if (activePlayers.length <= 1) {
      return {
        playersToAct: [],
        currentPlayerId: null,
        bettingRoundComplete: true
      };
    }
  }

  const currentBetIncreased =
    newCurrentBet > state.currentBet;

  const raiseSize =
    newCurrentBet - state.currentBet;

  const actionReopensBetting =
    currentBetIncreased &&
    (
      action.type === "bet" ||
      action.type === "raise" ||
      (
        action.type === "all_in" &&
        raiseSize >= state.minimumRaise
      )
    );

  let playersToAct: string[];

  if (actionReopensBetting) {
    playersToAct =
      getPlayersAfterPlayer(
        updatedPlayers,
        action.playerId
      )
        .filter(
          (player) =>
            player.status === "active"
        )
        .map(
          (player) => player.id
        );

    if (
      actor.status === "active" &&
      !playersToAct.includes(action.playerId)
    ) {
      playersToAct.push(action.playerId);
    }
  } else {
    playersToAct =
      state.playersToAct.filter(
        (playerId) =>
          playerId !== action.playerId
      );

    playersToAct =
      playersToAct.filter(
        (playerId) => {
          const player =
            updatedPlayers.find(
              (currentPlayer) =>
                currentPlayer.id === playerId
            );

          return (
            player !== undefined &&
            player.status === "active"
          );
        }
      );
  }

  const bettingRoundComplete =
    playersToAct.length === 0;

  return {
    playersToAct,
    currentPlayerId:
      playersToAct[0] ?? null,
    bettingRoundComplete
  };
}

function getPlayersStartingFrom(
  players: Player[],
  firstPlayer: Player
): Player[] {
  const sortedPlayers =
    sortPlayersByPosition(players);

  const index =
    sortedPlayers.findIndex(
      (player) =>
        player.id === firstPlayer.id
    );

  if (index === -1) {
    return [];
  }

  return [
    ...sortedPlayers.slice(index),
    ...sortedPlayers.slice(0, index)
  ];
}

function getPlayersAfterPlayer(
  players: Player[],
  playerId: string
): Player[] {
  const activePlayers =
    sortPlayersByPosition(
      players.filter(
        (player) =>
          player.status === "active"
      )
    );

  const index =
    activePlayers.findIndex(
      (player) =>
        player.id === playerId
    );

  if (index === -1) {
    return [];
  }

  return [
    ...activePlayers.slice(index + 1),
    ...activePlayers.slice(0, index)
  ];
}

export function sortPlayersByPosition(
  players: Player[]
): Player[] {
  return [...players].sort(
    (a, b) =>
      getPositionIndex(a) -
      getPositionIndex(b)
  );
}

function getPositionIndex(
  player: Player
): number {
  const index =
    POSITION_ORDER.indexOf(
      player.position
    );

  if (index === -1) {
    throw new Error(
      `Unsupported position: ${player.position}`
    );
  }

  return index;
}