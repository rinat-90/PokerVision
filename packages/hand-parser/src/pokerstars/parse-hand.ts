import type {
  HandHistory,
  HandHistoryAction,
  HandHistoryPlayer
} from "@poker-vision/hand-history";

import type {
  Card,
  Position
} from "@poker-vision/poker-engine";

import {
  HandHistoryParserError
} from "../parser-error.js";

import {
  parsePokerStarsHeader
} from "./parse-header.js";

import {
  parsePokerStarsPlayers
} from "./parse-players.js";

import {
  parsePokerStarsButtonSeat
} from "./parse-button.js";

import {
  parsePokerStarsForcedBets
} from "./parse-forced-bets.js";

import {
  parsePokerStarsForcedBetActions,
  type PokerStarsForcedBetAction
} from "./parse-forced-bet-actions.js";

import {
  parsePokerStarsHoleCards
} from "./parse-hole-cards.js";

import {
  parsePokerStarsShowdown
} from "./parse-showdown.js";

import {
  parsePokerStarsAction
} from "./parse-action.js";

import {
  parsePokerStarsStreets
} from "./parse-streets.js";

export function parsePokerStarsHand(
  input: string
): HandHistory {
  if (
    input.trim() === ""
  ) {
    throw new HandHistoryParserError(
      "EMPTY_INPUT",
      "Hand history input cannot be empty"
    );
  }

  const header =
    parsePokerStarsHeader(input);

  const forcedBets =
    parsePokerStarsForcedBets(input);

  const parsedPlayers =
    parsePokerStarsPlayers(input);

  const buttonSeat =
    parsePokerStarsButtonSeat(input);

  const players =
    assignPositions(
      parsedPlayers,
      buttonSeat
    );

  const forcedBetActions =
    parsePokerStarsForcedBetActions(
      input,
      players
    );

  const holeCards =
    parsePokerStarsHoleCards(
      input
    );

  const showdownCards =
    parsePokerStarsShowdown(
      input
    );

  const playersWithCards =
    attachHoleCards(
      players,
      holeCards,
      showdownCards
    );

  const actions =
    parseActions(
      input,
      playersWithCards,
      forcedBetActions
    );

  const streets =
    parsePokerStarsStreets(
      input,
      actions
    );

  return {
    id: header.id,
    gameFormat:
    header.gameFormat,
    smallBlind:
    forcedBets.smallBlind,
    bigBlind:
    forcedBets.bigBlind,
    ante:
    forcedBets.ante,
    players:
    playersWithCards,
    forcedBets:
    forcedBetActions,
    streets
  };
}

function assignPositions(
  players: ReturnType<
    typeof parsePokerStarsPlayers
  >,
  buttonSeat: number
): HandHistoryPlayer[] {
  const sorted =
    [...players].sort(
      (a, b) =>
        a.seat - b.seat
    );

  const buttonIndex =
    sorted.findIndex(
      (player) =>
        player.seat ===
        buttonSeat
    );

  if (
    buttonIndex === -1
  ) {
    throw new HandHistoryParserError(
      "INVALID_PLAYER",
      `Button seat ${buttonSeat} does not belong to a player`
    );
  }

  const orderedFromButton = [
    ...sorted.slice(
      buttonIndex
    ),
    ...sorted.slice(
      0,
      buttonIndex
    )
  ];

  return orderedFromButton.map(
    (player, index) => ({
      id: player.id,
      name: player.name,
      position:
        getPosition(
          index,
          orderedFromButton.length
        ),
      startingStack:
      player.startingStack
    })
  );
}

function getPosition(
  index: number,
  playerCount: number
): Position {
  if (playerCount === 2) {
    return index === 0
      ? "BTN"
      : "BB";
  }

  if (playerCount === 6) {
    const positions: Position[] = [
      "BTN",
      "SB",
      "BB",
      "UTG",
      "HJ",
      "CO"
    ];

    const position =
      positions[index];

    if (
      position === undefined
    ) {
      throw new HandHistoryParserError(
        "INVALID_PLAYER",
        `Unable to assign position to player ${index + 1}`
      );
    }

    return position;
  }

  throw new HandHistoryParserError(
    "INVALID_PLAYER",
    `Unsupported player count: ${playerCount}`
  );
}

function attachHoleCards(
  players: HandHistoryPlayer[],
  holeCards:
  ReturnType<
    typeof parsePokerStarsHoleCards
  >,
  showdownCards:
  ReturnType<
    typeof parsePokerStarsShowdown
  >
): HandHistoryPlayer[] {
  const cardsByPlayerName =
    new Map<
      string,
      [Card, Card]
    >();

  for (
    const holeCardData of holeCards
    ) {
    cardsByPlayerName.set(
      holeCardData.playerName,
      holeCardData.holeCards
    );
  }

  for (
    const showdown of showdownCards
    ) {
    cardsByPlayerName.set(
      showdown.playerName,
      showdown.holeCards
    );
  }

  return players.map(
    (player) => {
      const holeCards =
        cardsByPlayerName.get(
          player.name
        );

      if (
        holeCards === undefined
      ) {
        return player;
      }

      return {
        ...player,
        holeCards
      };
    }
  );
}

function parseActions(
  input: string,
  players: HandHistoryPlayer[],
  forcedBetActions:
  PokerStarsForcedBetAction[]
): HandHistoryAction[] {
  const lines =
    input.split(/\r?\n/);

  const playerByName =
    new Map(
      players.map(
        (player) => [
          player.name,
          player
        ]
      )
    );

  const actions: HandHistoryAction[] =
    [];

  let street:
    HandHistoryAction["street"] =
    "preflop";

  let currentStreetContributions =
    createInitialContributions(
      forcedBetActions
    );

  for (
    let index = 0;
    index < lines.length;
    index++
  ) {
    const rawLine =
      lines[index];

    if (
      rawLine === undefined
    ) {
      continue;
    }

    const line =
      rawLine.trim();

    if (
      line === ""
    ) {
      continue;
    }

    if (
      isForcedBetLine(line)
    ) {
      continue;
    }

    const streetMarker =
      getStreetFromMarker(line);

    if (
      streetMarker !== null
    ) {
      if (
        streetMarker !== street
      ) {
        street =
          streetMarker;

        currentStreetContributions =
          {};
      }

      continue;
    }

    if (
      isNonActionLine(line)
    ) {
      continue;
    }

    const separator =
      line.indexOf(": ");

    if (
      separator === -1
    ) {
      continue;
    }

    const playerName =
      line.slice(
        0,
        separator
      );

    const player =
      playerByName.get(
        playerName
      );

    if (
      player === undefined
    ) {
      continue;
    }

    const currentStreetContribution =
      currentStreetContributions[
        player.id
        ] ?? 0;

    const action =
      parsePokerStarsAction(
        line,
        {
          street,
          playerId:
          player.id,
          playerName:
          player.name,
          currentStreetContribution
        }
      );

    actions.push(action);

    if (
      action.type !== "fold" &&
      action.type !== "check"
    ) {
      currentStreetContributions[
        player.id
        ] =
        (
          currentStreetContributions[
            player.id
            ] ?? 0
        ) + action.amount;
    }
  }

  return actions;
}

function isNonActionLine(
  line: string
): boolean {
  return (
    /^Dealt to .+ \[[^\]]+\]$/i.test(
      line
    ) ||
    /^.+?:\s+shows\s+\[[^\]]+\]$/i.test(
      line
    )
  );
}

function createInitialContributions(
  forcedBetActions:
  PokerStarsForcedBetAction[]
): Record<string, number> {
  const contributions:
    Record<string, number> = {};

  for (
    const forcedBet of
    forcedBetActions
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

function isForcedBetLine(
  line: string
): boolean {
  return (
    /^.+?:\s+posts\s+small\s+blind\s+[\d.,]+$/i.test(
      line
    ) ||
    /^.+?:\s+posts\s+big\s+blind\s+[\d.,]+$/i.test(
      line
    ) ||
    /^.+?:\s+posts\s+(?:the\s+)?ante\s+[\d.,]+$/i.test(
      line
    )
  );
}

function getStreetFromMarker(
  line: string
): HandHistoryAction["street"] | null {
  if (
    /^\*\*\*\s+HOLE CARDS\s+\*\*\*$/i.test(
      line
    )
  ) {
    return "preflop";
  }

  if (
    /^\*\*\*\s+FLOP\s+\*\*\*/i.test(
      line
    )
  ) {
    return "flop";
  }

  if (
    /^\*\*\*\s+TURN\s+\*\*\*/i.test(
      line
    )
  ) {
    return "turn";
  }

  if (
    /^\*\*\*\s+RIVER\s+\*\*\*/i.test(
      line
    )
  ) {
    return "river";
  }

  return null;
}