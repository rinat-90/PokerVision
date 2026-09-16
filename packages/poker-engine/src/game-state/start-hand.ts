import type {
  HandState,
  Player,
  PlayerAction
} from "./types.js";

import {
  initializeBettingRound
} from "./betting-round.js";

export function startHand(
  state: HandState
): HandState {
  if (state.currentPlayerId !== null) {
    throw new Error(
      "Hand has already started"
    );
  }

  const activePlayers =
    state.players.filter(
      (player) =>
        player.status === "active"
    );

  if (activePlayers.length < 2) {
    throw new Error(
      "A hand requires at least 2 active players"
    );
  }

  const button = state.players.find(
    (player) =>
      player.position === "BTN" &&
      player.status === "active"
  );

  if (button === undefined) {
    throw new Error(
      "Button player not found"
    );
  }

  const smallBlindPlayer =
    findSmallBlindPlayer(
      state.players,
      button
    );

  const bigBlindPlayer =
    findBigBlindPlayer(
      state.players,
      button
    );

  const smallBlindAmount =
    Math.min(
      state.smallBlind,
      smallBlindPlayer.stack
    );

  const bigBlindAmount =
    Math.min(
      state.bigBlind,
      bigBlindPlayer.stack
    );

  const updatedPlayers =
    state.players.map(
      (player) => {
        if (
          player.id ===
          smallBlindPlayer.id
        ) {
          const remainingStack =
            player.stack -
            smallBlindAmount;

          return {
            ...player,
            stack: remainingStack,
            status:
              remainingStack === 0
                ? "all_in" as const
                : player.status
          };
        }

        if (
          player.id ===
          bigBlindPlayer.id
        ) {
          const remainingStack =
            player.stack -
            bigBlindAmount;

          return {
            ...player,
            stack: remainingStack,
            status:
              remainingStack === 0
                ? "all_in" as const
                : player.status
          };
        }

        return player;
      }
    );

  const playerContributions = {
    ...state.playerContributions,
    [smallBlindPlayer.id]:
    smallBlindAmount,
    [bigBlindPlayer.id]:
    bigBlindAmount
  };

  const totalContributions = {
    ...state.totalContributions,
    [smallBlindPlayer.id]:
    smallBlindAmount,
    [bigBlindPlayer.id]:
    bigBlindAmount
  };

  /*
   * Posting the blinds is part of the hand history.
   */
  const blindActions: PlayerAction[] = [
    {
      playerId:
      smallBlindPlayer.id,
      type: "bet",
      amount: smallBlindAmount,
      street: "preflop"
    },
    {
      playerId:
      bigBlindPlayer.id,
      type: "bet",
      amount: bigBlindAmount,
      street: "preflop"
    }
  ];

  const updatedActions = [
    ...state.actions,
    ...blindActions
  ];

  const nextCurrentBet =
    Math.max(
      smallBlindAmount,
      bigBlindAmount
    );

  const stateBeforeBettingRound: HandState = {
    ...state,
    players: updatedPlayers,
    actions: updatedActions,
    playerContributions,
    totalContributions,
    currentBet: nextCurrentBet,
    pot:
      state.pot +
      smallBlindAmount +
      bigBlindAmount
  };

  /*
   * Only active players can act.
   */
  const activePlayersAfterBlinds =
    updatedPlayers.filter(
      (player) =>
        player.status === "active"
    );

  /*
   * Preflop action starts:
   *
   * Heads-up:
   * BB acts first.
   *
   * Multi-way:
   * The player immediately after BB acts first.
   */
  const firstPlayer =
    getFirstPreflopPlayer(
      activePlayersAfterBlinds,
      button,
      bigBlindPlayer
    );

  const bettingRound =
    initializeBettingRound(
      stateBeforeBettingRound,
      firstPlayer.id
    );

  return {
    ...stateBeforeBettingRound,
    currentPlayerId:
    bettingRound.currentPlayerId,
    playersToAct:
    bettingRound.playersToAct,
    bettingRoundComplete:
    bettingRound.bettingRoundComplete,
    minimumRaise:
    state.bigBlind,
    lastAggressorId:
    bigBlindPlayer.id,
    startedAt:
      state.startedAt ??
      Date.now()
  };
}

function findSmallBlindPlayer(
  players: Player[],
  button: Player
): Player {
  const activePlayers =
    players.filter(
      (player) =>
        player.status === "active"
    );

  /*
   * Heads-up:
   * BTN is also the small blind.
   */
  if (activePlayers.length === 2) {
    return button;
  }

  const sorted =
    sortPlayersByPosition(
      activePlayers
    );

  const buttonIndex =
    sorted.findIndex(
      (player) =>
        player.id === button.id
    );

  if (buttonIndex === -1) {
    throw new Error(
      "Button player not found among active players"
    );
  }

  return (
    sorted[
    (buttonIndex + 1) %
    sorted.length
      ] ?? button
  );
}

function findBigBlindPlayer(
  players: Player[],
  button: Player
): Player {
  const activePlayers =
    players.filter(
      (player) =>
        player.status === "active"
    );

  /*
   * Heads-up:
   * The player opposite BTN is BB.
   */
  if (activePlayers.length === 2) {
    const otherPlayer =
      activePlayers.find(
        (player) =>
          player.id !== button.id
      );

    if (otherPlayer === undefined) {
      throw new Error(
        "Big blind player not found"
      );
    }

    return otherPlayer;
  }

  const smallBlind =
    findSmallBlindPlayer(
      players,
      button
    );

  const sorted =
    sortPlayersByPosition(
      activePlayers
    );

  const smallBlindIndex =
    sorted.findIndex(
      (player) =>
        player.id === smallBlind.id
    );

  if (smallBlindIndex === -1) {
    throw new Error(
      "Small blind player not found among active players"
    );
  }

  return (
    sorted[
    (smallBlindIndex + 1) %
    sorted.length
      ] ?? smallBlind
  );
}

function getFirstPreflopPlayer(
  activePlayers: Player[],
  button: Player,
  bigBlindPlayer: Player
): Player {
  /*
   * Heads-up:
   * BTN is SB and BB acts first preflop.
   */
  if (activePlayers.length === 2) {
    return bigBlindPlayer;
  }

  const sorted =
    sortPlayersByPosition(
      activePlayers
    );

  const bigBlindIndex =
    sorted.findIndex(
      (player) =>
        player.id ===
        bigBlindPlayer.id
    );

  if (bigBlindIndex === -1) {
    throw new Error(
      "Big blind player not found among active players"
    );
  }

  return (
    sorted[
    (bigBlindIndex + 1) %
    sorted.length
      ] ?? bigBlindPlayer
  );
}

function sortPlayersByPosition(
  players: Player[]
): Player[] {
  const positionOrder = [
    "UTG",
    "UTG+1",
    "MP",
    "HJ",
    "CO",
    "BTN",
    "SB",
    "BB"
  ] as const;

  return [...players].sort(
    (a, b) =>
      positionOrder.indexOf(
        a.position as typeof positionOrder[number]
      ) -
      positionOrder.indexOf(
        b.position as typeof positionOrder[number]
      )
  );
}