import type {
  Player,
  PlayerAction,
  Position,
  Street
} from "@poker-vision/poker-engine";

export interface ReconstructedBettingState {
  currentPlayerId: string | null;
  playersToAct: string[];
  bettingRoundComplete: boolean;
}

const POSITION_ORDER: Position[] = [
  "UTG",
  "UTG+1",
  "MP",
  "HJ",
  "CO",
  "BTN",
  "SB",
  "BB"
];

export function reconstructBettingState(
  players: Player[],
  actions: PlayerAction[],
  street: Street,
  currentBet: number,
  currentStreetContributions: Record<string, number>
): ReconstructedBettingState {
  const foldedPlayerIds = new Set(
    actions
      .filter(
        (action) =>
          action.type === "fold"
      )
      .map(
        (action) =>
          action.playerId
      )
  );

  const activePlayers =
    players.filter(
      (player) =>
        player.status === "active" &&
        !foldedPlayerIds.has(
          player.id
        )
    );

  if (
    activePlayers.length <= 1
  ) {
    return {
      currentPlayerId: null,
      playersToAct: [],
      bettingRoundComplete: true
    };
  }

  const streetActions =
    actions.filter(
      (action) =>
        action.street === street
    );

  const orderedPlayers =
    orderPlayersForAction(
      activePlayers,
      street,
      findLastAggressorId(
        streetActions
      )
    );

  /*
   * No action has happened on this street yet.
   *
   * This is especially important when replaying
   * a decision point BEFORE the player's action.
   *
   * Example:
   *
   * FLOP
   * MrBlue: check   <-- target action
   *
   * At this point streetActions is empty, so
   * MrBlue is the first player expected to act.
   */
  if (
    streetActions.length === 0
  ) {
    return {
      currentPlayerId:
        orderedPlayers[0]?.id ??
        null,
      playersToAct:
        orderedPlayers.map(
          (player) =>
            player.id
        ),
      bettingRoundComplete: false
    };
  }

  const actedPlayerIds =
    new Set(
      streetActions.map(
        (action) =>
          action.playerId
      )
    );

  const lastAggressorId =
    findLastAggressorId(
      streetActions
    );

  const lastAggressorIndex =
    findLastAggressorIndex(
      streetActions
    );

  const playersNeedingAction =
    activePlayers.filter(
      (player) => {
        /*
         * The last aggressor does not need
         * to act again unless somebody raised
         * after them.
         */
        if (
          player.id ===
          lastAggressorId
        ) {
          return false;
        }

        const contribution =
          currentStreetContributions[
            player.id
            ] ?? 0;

        /*
         * Player has not matched the current bet.
         */
        if (
          contribution <
          currentBet
        ) {
          return true;
        }

        /*
         * No aggression on this street.
         * Any player who has not acted yet
         * still needs to act.
         */
        if (
          lastAggressorIndex === -1
        ) {
          return !actedPlayerIds.has(
            player.id
          );
        }

        /*
         * There was aggression.
         * A player needs to act again if their
         * latest action happened before it.
         */
        const lastActionIndex =
          findLastActionIndex(
            streetActions,
            player.id
          );

        return (
          lastActionIndex <
          lastAggressorIndex
        );
      }
    );

  const orderedPlayersNeedingAction =
    orderedPlayers.filter(
      (player) =>
        playersNeedingAction.some(
          (candidate) =>
            candidate.id ===
            player.id
        )
    );

  if (
    orderedPlayersNeedingAction.length ===
    0
  ) {
    return {
      currentPlayerId: null,
      playersToAct: [],
      bettingRoundComplete: true
    };
  }

  return {
    currentPlayerId:
      orderedPlayersNeedingAction[0]?.id ??
      null,
    playersToAct:
      orderedPlayersNeedingAction.map(
        (player) =>
          player.id
      ),
    bettingRoundComplete: false
  };
}

function findLastAggressorId(
  actions: PlayerAction[]
): string | null {
  for (
    let index = actions.length - 1;
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

function findLastAggressorIndex(
  actions: PlayerAction[]
): number {
  for (
    let index = actions.length - 1;
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
      return index;
    }
  }

  return -1;
}

function findLastActionIndex(
  actions: PlayerAction[],
  playerId: string
): number {
  for (
    let index = actions.length - 1;
    index >= 0;
    index--
  ) {
    const action =
      actions[index];

    if (
      action !== undefined &&
      action.playerId === playerId
    ) {
      return index;
    }
  }

  return -1;
}

function orderPlayersForAction(
  players: Player[],
  street: Street,
  lastAggressorId: string | null
): Player[] {
  const orderedPlayers =
    orderPlayersForStreet(
      players,
      street
    );

  if (
    lastAggressorId === null
  ) {
    return orderedPlayers;
  }

  const aggressorIndex =
    orderedPlayers.findIndex(
      (player) =>
        player.id ===
        lastAggressorId
    );

  if (
    aggressorIndex === -1
  ) {
    return orderedPlayers;
  }

  return [
    ...orderedPlayers.slice(
      aggressorIndex + 1
    ),
    ...orderedPlayers.slice(
      0,
      aggressorIndex + 1
    )
  ];
}

function orderPlayersForStreet(
  players: Player[],
  street: Street
): Player[] {
  const sorted =
    [...players].sort(
      (a, b) =>
        POSITION_ORDER.indexOf(
          a.position
        ) -
        POSITION_ORDER.indexOf(
          b.position
        )
    );

  if (
    street === "preflop"
  ) {
    return orderPreflopPlayers(
      sorted
    );
  }

  return orderPostflopPlayers(
    sorted
  );
}

function orderPreflopPlayers(
  players: Player[]
): Player[] {
  if (
    players.length === 2
  ) {
    const bigBlind =
      players.find(
        (player) =>
          player.position ===
          "BB"
      );

    const button =
      players.find(
        (player) =>
          player.position ===
          "BTN"
      );

    /*
     * Heads-up preflop:
     *
     * BTN is also the small blind and acts first.
     * BB acts second.
     */
    return [
      ...(button !== undefined
        ? [button]
        : []),
      ...(bigBlind !== undefined
        ? [bigBlind]
        : [])
    ];
  }

  const firstActorIndex =
    players.findIndex(
      (player) =>
        player.position ===
        "UTG"
    );

  if (
    firstActorIndex === -1
  ) {
    return players;
  }

  return [
    ...players.slice(
      firstActorIndex
    ),
    ...players.slice(
      0,
      firstActorIndex
    )
  ];
}

function orderPostflopPlayers(
  players: Player[]
): Player[] {
  /*
   * Heads-up:
   *
   * BTN is also the small blind.
   * Therefore BB acts first postflop
   * and BTN acts second.
   *
   * Important:
   * We cannot use players.length === 2 here.
   *
   * In a 6-max hand, after folds, there may also
   * be exactly two active players remaining.
   * They must keep their original table positions.
   *
   * Therefore we only use the heads-up rule when
   * the remaining players are actually BTN + BB.
   */
  const button =
    players.find(
      (player) =>
        player.position ===
        "BTN"
    );

  const bigBlind =
    players.find(
      (player) =>
        player.position ===
        "BB"
    );

  if (
    players.length === 2 &&
    button !== undefined &&
    bigBlind !== undefined
  ) {
    return [
      bigBlind,
      button
    ];
  }

  /*
   * Multi-player postflop order:
   *
   * SB -> BB -> UTG -> UTG+1 -> MP -> HJ -> CO -> BTN
   *
   * Keep the original table positions even when
   * some players have folded.
   */
  const postflopOrder: Position[] = [
    "SB",
    "BB",
    "UTG",
    "UTG+1",
    "MP",
    "HJ",
    "CO",
    "BTN"
  ];

  return [
    ...players
  ].sort(
    (a, b) =>
      postflopOrder.indexOf(
        a.position
      ) -
      postflopOrder.indexOf(
        b.position
      )
  );
}