import type {
  Card,
  GameFormat,
  Position
} from "@poker-vision/poker-engine";

import type {
  HandHistory,
  HandHistoryAction,
  HandHistoryPlayer,
  HandHistoryStreet
} from "@poker-vision/hand-history";

import type {
  VideoHand,
  VideoHandAction
} from "./video-hand.js";

export interface VideoHandPlayerMetadata {
  seatIndex: number;
  playerId: string;
  name: string;
  position: Position;
  startingStack: number;
  holeCards?: [Card, Card];
}

export interface VideoHandMetadata {
  handId: string;

  gameFormat: GameFormat;

  smallBlind: number;
  bigBlind: number;
  ante?: number;

  players: VideoHandPlayerMetadata[];
}

export function videoHandToHandHistory(
  hand: VideoHand,
  metadata: VideoHandMetadata
): HandHistory {
  const playerBySeat =
    new Map(
      metadata.players.map(
        player => [
          player.seatIndex,
          player
        ]
      )
    );

  const players: HandHistoryPlayer[] =
    hand.players.map(
      player => {
        const metadataPlayer =
          playerBySeat.get(
            player.seatIndex
          );

        if (metadataPlayer === undefined) {
          throw new Error(
            `Missing metadata for seat ${player.seatIndex}`
          );
        }

        return {
          id:
          metadataPlayer.playerId,

          name:
          metadataPlayer.name,

          position:
          metadataPlayer.position,

          startingStack:
          metadataPlayer.startingStack,

          ...(metadataPlayer.holeCards !== undefined
            ? {
              holeCards:
              metadataPlayer.holeCards
            }
            : {})
        };
      }
    );

  const forcedBets:
    HandHistory["forcedBets"] = [];

  const smallBlindPlayer =
    players.find(
      player =>
        player.position === "SB"
    ) ??
    (
      players.length === 2
        ? players.find(
          player =>
            player.position === "BTN"
        )
        : undefined
    );

  const bigBlindPlayer =
    players.find(
      player =>
        player.position === "BB"
    );

  if (smallBlindPlayer !== undefined) {
    forcedBets.push({
      playerId:
      smallBlindPlayer.id,

      type:
        "small_blind",

      amount:
      metadata.smallBlind
    });
  }

  if (bigBlindPlayer !== undefined) {
    forcedBets.push({
      playerId:
      bigBlindPlayer.id,

      type:
        "big_blind",

      amount:
      metadata.bigBlind
    });
  }

  const streets:
    HandHistoryStreet[] = [
    createStreet(
      "preflop",
      [],
      hand.actions,
      playerBySeat
    )
  ];

  for (const videoStreet of hand.streets) {
    streets.push(
      createStreet(
        videoStreet.street,
        videoStreet.board,
        hand.actions,
        playerBySeat
      )
    );
  }

  return {
    id:
    metadata.handId,

    gameFormat:
    metadata.gameFormat,

    smallBlind:
    metadata.smallBlind,

    bigBlind:
    metadata.bigBlind,

    ante:
      metadata.ante ?? 0,

    players,

    forcedBets,

    streets,

    ...(hand.startedAt !== null
      ? {
        startedAt:
        hand.startedAt
      }
      : {}),

    ...(hand.completedAt !== null
      ? {
        completedAt:
        hand.completedAt
      }
      : {})
  };
}

function createStreet(
  street: HandHistoryStreet["street"],
  board: HandHistoryStreet["board"],
  actions: VideoHandAction[],
  playerBySeat: Map<
    number,
    VideoHandPlayerMetadata
  >
): HandHistoryStreet {
  return {
    street,

    board:
      board.map(
        card => ({
          rank:
          card.rank,

          suit:
          card.suit
        })
      ),

    actions:
      actions
        .filter(
          action =>
            action.street === street
        )
        .map(
          action =>
            toHandHistoryAction(
              action,
              playerBySeat
            )
        )
        .filter(
          (
            action
          ): action is HandHistoryAction =>
            action !== null
        )
  };
}

function toHandHistoryAction(
  action: VideoHandAction,
  playerBySeat: Map<
    number,
    VideoHandPlayerMetadata
  >
): HandHistoryAction | null {
  const player =
    playerBySeat.get(
      action.seatIndex
    );

  if (player === undefined) {
    throw new Error(
      `Missing metadata for seat ${action.seatIndex}`
    );
  }

  if (
    action.amount === null &&
    action.type !== "check" &&
    action.type !== "fold"
  ) {
    return null;
  }

  return {
    playerId:
    player.playerId,

    type:
    action.type,

    amount:
      action.amount ?? 0,

    amountType:
      "total",

    street:
    action.street
  };
}