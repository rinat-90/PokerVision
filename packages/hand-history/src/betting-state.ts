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
  const streetActions = actions.filter(
    (action) =>
      action.street === street
  );

  const foldedPlayerIds = new Set(
    streetActions
      .filter(
        (action) =>
          action.type === "fold"
      )
      .map(
        (action) =>
          action.playerId
      )
  );

  const activePlayers = players.filter(
    (player) =>
      player.status === "active" &&
      !foldedPlayerIds.has(
        player.id
      )
  );

  if (activePlayers.length <= 1) {
    return {
      currentPlayerId: null,
      playersToAct: [],
      bettingRoundComplete: true
    };
  }

  const actedPlayerIds = new Set(
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

        if (
          contribution <
          currentBet
        ) {
          return true;
        }

        if (
          lastAggressorIndex === -1
        ) {
          return !actedPlayerIds.has(
            player.id
          );
        }

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

  const orderedPlayers =
    orderPlayersForAction(
      activePlayers,
      street,
      lastAggressorId
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

  const currentPlayer =
    orderedPlayersNeedingAction[0];

  return {
    currentPlayerId:
      currentPlayer?.id ?? null,

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

function findLastAggressorIndex(
  actions: PlayerAction[]
): number {
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
    let index =
      actions.length - 1;
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
  const sorted = [...players].sort(
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
  if (players.length === 2) {
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

    return [
      ...(bigBlind !== undefined
        ? [bigBlind]
        : []),
      ...(button !== undefined
        ? [button]
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
  const buttonIndex =
    players.findIndex(
      (player) =>
        player.position ===
        "BTN"
    );

  if (
    buttonIndex === -1
  ) {
    return players;
  }

  return [
    ...players.slice(
      buttonIndex + 1
    ),
    ...players.slice(
      0,
      buttonIndex + 1
    )
  ];
}