import type {
  HandState,
  Player,
  PlayerAction
} from "@poker-vision/poker-engine";

import type {
  HandHistory,
  HandHistoryAction
} from "./types.js";

import {
  normalizeActionAmount
} from "./normalize-action.js";

import {
  reconstructBettingState
} from "./betting-state.js";

import {
  derivePlayerStatus
} from "./player-status.js";

export function handHistoryToState(
  hand: HandHistory
): HandState {
  const historyActions =
    createActions(hand);

  const actions =
    normalizeActions(
      hand,
      historyActions
    );

  const players =
    createPlayers(
      hand,
      historyActions,
      actions
    );

  const currentStreet =
    hand.streets.at(-1)?.street ??
    "preflop";

  const board =
    hand.streets.at(-1)?.board ??
    [];

  const contributions =
    calculateContributions(
      hand,
      actions
    );

  const currentStreetContributions =
    contributions.currentStreet;

  const totalContributions =
    contributions.total;

  const currentBet =
    calculateCurrentBet(
      currentStreetContributions
    );

  const bettingState =
    reconstructBettingState(
      players,
      actions,
      currentStreet,
      currentBet,
      currentStreetContributions
    );

  const state: HandState = {
    id: hand.id,
    gameFormat: hand.gameFormat,

    street: currentStreet,

    smallBlind: hand.smallBlind,
    bigBlind: hand.bigBlind,
    ante: hand.ante,

    players,

    board,

    pot: Object.values(
      totalContributions
    ).reduce(
      (sum, amount) =>
        sum + amount,
      0
    ),

    actions,

    currentPlayerId:
    bettingState.currentPlayerId,

    playersToAct:
    bettingState.playersToAct,

    currentBet,

    minimumRaise:
    hand.bigBlind,

    lastAggressorId:
      findLastAggressorId(actions),

    playerContributions:
    currentStreetContributions,

    totalContributions,

    bettingRoundComplete:
    bettingState.bettingRoundComplete
  };

  if (
    hand.startedAt !== undefined
  ) {
    state.startedAt =
      hand.startedAt;
  }

  if (
    hand.completedAt !== undefined
  ) {
    state.completedAt =
      hand.completedAt;
  }

  return state;
}

function createPlayers(
  hand: HandHistory,
  historyActions: HandHistoryAction[],
  actions: PlayerAction[]
): Player[] {
  const contributions =
    calculateContributions(
      hand,
      actions
    ).total;

  return hand.players.map(
    (player) => {
      const contributed =
        contributions[
          player.id
          ] ?? 0;

      const result: Player = {
        id: player.id,
        name: player.name,
        position: player.position,
        stack:
          Math.max(
            0,
            player.startingStack -
            contributed
          ),
        status:
          derivePlayerStatus(
            player.id,
            historyActions
          )
      };

      if (
        player.holeCards !==
        undefined
      ) {
        result.holeCards =
          player.holeCards;
      }

      return result;
    }
  );
}

function createActions(
  hand: HandHistory
): HandHistoryAction[] {
  return hand.streets.flatMap(
    (street) =>
      street.actions
  );
}

function normalizeActions(
  hand: HandHistory,
  actions: HandHistoryAction[]
): PlayerAction[] {
  const previousContributions:
    Record<string, number> =
    createInitialContributions(
      hand
    );

  return actions.map(
    (action) => {
      const previousContribution =
        previousContributions[
          action.playerId
          ] ?? 0;

      const amount =
        normalizeActionAmount(
          action,
          previousContribution
        );

      if (
        action.type !== "fold" &&
        action.type !== "check"
      ) {
        previousContributions[
          action.playerId
          ] =
          previousContribution +
          amount;
      }

      return {
        playerId:
        action.playerId,
        type:
        action.type,
        amount,
        street:
        action.street
      };
    }
  );
}

interface ContributionState {
  currentStreet:
    Record<string, number>;

  total:
    Record<string, number>;
}

function calculateContributions(
  hand: HandHistory,
  actions: PlayerAction[]
): ContributionState {
  const initialContributions =
    createInitialContributions(
      hand
    );

  const total:
    Record<string, number> = {
    ...initialContributions
  };

  const currentStreet:
    Record<string, number> = {};

  const streetContributions:
    Record<string, number> = {};

  let currentStreetName =
    hand.streets.at(-1)?.street ??
    "preflop";

  if (
    currentStreetName ===
    "preflop"
  ) {
    for (
      const [playerId, amount]
      of Object.entries(
      initialContributions
    )
      ) {
      if (amount > 0) {
        streetContributions[
          playerId
          ] = amount;
      }
    }
  }

  for (
    const action of actions
    ) {
    if (
      action.street !==
      currentStreetName
    ) {
      currentStreetName =
        action.street;

      for (
        const playerId of
        Object.keys(
          streetContributions
        )
        ) {
        delete streetContributions[
          playerId
          ];
      }
    }

    const contribution =
      action.amount;

    if (
      action.type !== "fold" &&
      action.type !== "check"
    ) {
      total[action.playerId] =
        (
          total[action.playerId] ??
          0
        ) + contribution;

      streetContributions[
        action.playerId
        ] =
        (
          streetContributions[
            action.playerId
            ] ?? 0
        ) + contribution;
    }
  }

  for (
    const playerId of
    Object.keys(
      streetContributions
    )
    ) {
    currentStreet[playerId] =
      streetContributions[
        playerId
        ] ?? 0;
  }

  return {
    currentStreet,
    total
  };
}

function createInitialContributions(
  hand: HandHistory
): Record<string, number> {
  if (
    hand.forcedBets !== undefined
  ) {
    const contributions:
      Record<string, number> = {};

    for (
      const forcedBet of
      hand.forcedBets
      ) {
      contributions[
        forcedBet.playerId
        ] =
        (
          contributions[
            forcedBet.playerId
            ] ?? 0
        ) + forcedBet.amount;
    }

    return contributions;
  }

  return getLegacyBlindContributions(
    hand
  );
}

function getLegacyBlindContributions(
  hand: HandHistory
): Record<string, number> {
  const contributions:
    Record<string, number> = {};

  for (
    const player of hand.players
    ) {
    const blind =
      getLegacyBlindContribution(
        player.position,
        hand
      );

    if (blind > 0) {
      contributions[
        player.id
        ] = blind;
    }
  }

  return contributions;
}

function getLegacyBlindContribution(
  position:
  HandHistory[
    "players"
    ][number]["position"],
  hand: HandHistory
): number {
  if (
    position === "BB"
  ) {
    return hand.bigBlind;
  }

  if (
    position === "SB"
  ) {
    return hand.smallBlind;
  }

  // Heads-up:
  // BTN is also the small blind.
  if (
    position === "BTN" &&
    hand.players.length === 2
  ) {
    return hand.smallBlind;
  }

  return 0;
}

function calculateCurrentBet(
  currentStreetContributions:
  Record<string, number>
): number {
  return Math.max(
    0,
    ...Object.values(
      currentStreetContributions
    )
  );
}

function findLastAggressorId(
  actions: PlayerAction[]
): string | null {
  for (
    let index =
      actions.length - 1;
    index >= 0;
    index--
  ) {
    const action =
      actions[index];

    if (
      action !== undefined &&
      (
        action.type === "bet" ||
        action.type === "raise" ||
        action.type === "all_in"
      )
    ) {
      return action.playerId;
    }
  }

  return null;
}