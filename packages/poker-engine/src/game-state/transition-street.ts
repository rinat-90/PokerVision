import type {
  Card,
  Street
} from "../types.js";

import type {
  HandState,
  Player
} from "./types.js";

import {
  initializeBettingRound
} from "./betting-round.js";

export function transitionStreet(
  state: HandState,
  newBoardCards: Card[]
): HandState {
  if (!state.bettingRoundComplete) {
    throw new Error(
      "Cannot transition street before betting round is complete"
    );
  }

  const nextStreet =
    getNextStreet(state.street);

  if (nextStreet === "showdown") {
    return {
      ...state,
      street: "showdown",
      board: [
        ...state.board,
        ...newBoardCards
      ],
      currentPlayerId: null,
      playersToAct: [],
      currentBet: 0,
      minimumRaise: state.bigBlind,
      lastAggressorId: null,
      playerContributions:
        createEmptyContributions(
          state.players
        ),
      bettingRoundComplete: true
    };
  }

  const expectedCardCount =
    getExpectedBoardCardCount(
      state.street,
      nextStreet
    );

  if (
    newBoardCards.length !==
    expectedCardCount
  ) {
    if (
      nextStreet === "flop"
    ) {
      throw new Error(
        "flop requires exactly 3 board cards"
      );
    }

    throw new Error(
      `${nextStreet} requires exactly ${expectedCardCount} board card(s)`
    );
  }

  const board = [
    ...state.board,
    ...newBoardCards
  ];

  const activePlayers =
    state.players.filter(
      (player) =>
        player.status === "active"
    );

  const firstPlayer =
    getFirstPostflopPlayer(
      activePlayers
    );

  const stateBeforeBettingRound: HandState = {
    ...state,
    street: nextStreet,
    board,
    currentPlayerId: null,
    playersToAct: [],
    currentBet: 0,
    minimumRaise: state.bigBlind,
    lastAggressorId: null,

    /*
     * Current-street contributions reset.
     */
    playerContributions:
      createEmptyContributions(
        state.players
      ),

    /*
     * Total hand contributions persist.
     */
    totalContributions:
    state.totalContributions,

    bettingRoundComplete: false
  };

  if (firstPlayer === undefined) {
    return {
      ...stateBeforeBettingRound,
      currentPlayerId: null,
      playersToAct: [],
      bettingRoundComplete: true
    };
  }

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
    bettingRound.bettingRoundComplete
  };
}

function getNextStreet(
  street: Street
): Street {
  switch (street) {
    case "preflop":
      return "flop";

    case "flop":
      return "turn";

    case "turn":
      return "river";

    case "river":
      return "showdown";

    case "showdown":
      throw new Error(
        "Cannot transition from showdown"
      );
  }
}

function getExpectedBoardCardCount(
  currentStreet: Street,
  nextStreet: Street
): number {
  if (
    currentStreet === "preflop" &&
    nextStreet === "flop"
  ) {
    return 3;
  }

  if (
    currentStreet === "flop" &&
    nextStreet === "turn"
  ) {
    return 1;
  }

  if (
    currentStreet === "turn" &&
    nextStreet === "river"
  ) {
    return 1;
  }

  throw new Error(
    `Invalid board transition: ${currentStreet} -> ${nextStreet}`
  );
}

function getFirstPostflopPlayer(
  activePlayers: Player[]
): Player | undefined {
  if (activePlayers.length === 0) {
    return undefined;
  }

  /*
   * Heads-up:
   *
   * BTN is also SB.
   * BTN/SB acts first on every postflop street.
   */
  if (activePlayers.length === 2) {
    return activePlayers.find(
      (player) =>
        player.position === "BTN"
    );
  }

  /*
   * Multi-way:
   *
   * Postflop action starts with the first
   * active player after the button.
   */
  const sorted =
    sortPlayersByPosition(
      activePlayers
    );

  const buttonIndex =
    sorted.findIndex(
      (player) =>
        player.position === "BTN"
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
      ]
  );
}

function createEmptyContributions(
  players: Player[]
): Record<string, number> {
  return Object.fromEntries(
    players.map(
      (player) => [
        player.id,
        0
      ]
    )
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