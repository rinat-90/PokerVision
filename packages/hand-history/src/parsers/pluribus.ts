import type {
  ActionType,
  Card,
  GameFormat,
  Position,
  Rank,
  Street,
  Suit,
} from "@poker-vision/poker-engine";

import type {
  HandHistory,
  HandHistoryAction,
  HandHistoryForcedBet,
  HandHistoryPlayer,
  HandHistoryStreet,
} from "../types.js";

interface ParsedHeader {
  id: string;
  smallBlind: number;
  bigBlind: number;
  buttonSeat: number;
}

interface ParsedSeat {
  seat: number;
  name: string;
  stack: number;
}

interface ParsedAction {
  playerName: string;
  type: ActionType;
  amount: number;
  amountType: "contribution" | "total";
}

const POSITION_BY_OFFSET: Position[] = [
  "BTN",
  "SB",
  "BB",
  "UTG",
  "UTG+1",
  "MP",
  "HJ",
  "CO",
];

const SUIT_BY_SYMBOL: Record<string, Suit> = {
  c: "clubs",
  d: "diamonds",
  h: "hearts",
  s: "spades",
};

const VALID_RANKS = new Set<Rank>([
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
]);

function getCapture(
  match: RegExpMatchArray,
  index: number,
  description: string
): string {
  const value = match[index];

  if (value === undefined) {
    throw new Error(
      `Missing ${description} in parsed line`
    );
  }

  return value;
}

function parseMoney(value: string): number {
  return Number(value.replace(/,/g, ""));
}

function parseHeader(line: string): ParsedHeader {
  const match = line.match(
    /^PokerStars Hand #(\d+): Hold'em No Limit \((\d+)\/(\d+)\)/
  );

  if (match === null) {
    throw new Error(
      `Invalid PokerStars hand header: ${line}`
    );
  }

  return {
    id: getCapture(match, 1, "hand id"),
    smallBlind: Number(
      getCapture(match, 2, "small blind")
    ),
    bigBlind: Number(
      getCapture(match, 3, "big blind")
    ),
    buttonSeat: 0,
  };
}

function parseButtonSeat(line: string): number {
  const match = line.match(
    /Seat #(\d+) is the button/
  );

  if (match === null) {
    throw new Error(
      `Could not find button seat: ${line}`
    );
  }

  return Number(
    getCapture(match, 1, "button seat")
  );
}

function parseSeat(line: string): ParsedSeat | null {
  const match = line.match(
    /^Seat (\d+): (.+) \(([\d,]+) in chips\)$/
  );

  if (match === null) {
    return null;
  }

  return {
    seat: Number(
      getCapture(match, 1, "seat number")
    ),
    name: getCapture(match, 2, "player name"),
    stack: parseMoney(
      getCapture(match, 3, "player stack")
    ),
  };
}

function parseCard(value: string): Card {
  if (value.length !== 2) {
    throw new Error(`Invalid card: ${value}`);
  }

  const rankValue = value[0];
  const suitSymbol = value[1];

  if (
    rankValue === undefined ||
    suitSymbol === undefined
  ) {
    throw new Error(`Invalid card: ${value}`);
  }

  if (!VALID_RANKS.has(rankValue as Rank)) {
    throw new Error(
      `Invalid card rank: ${rankValue}`
    );
  }

  const suit = SUIT_BY_SYMBOL[suitSymbol];

  if (suit === undefined) {
    throw new Error(
      `Invalid card suit: ${suitSymbol}`
    );
  }

  return {
    rank: rankValue as Rank,
    suit,
  };
}

function parseCards(line: string): Card[] {
  const match = line.match(/\[([^\]]+)\]/);

  if (match === null) {
    return [];
  }

  const cards = getCapture(
    match,
    1,
    "cards"
  )
    .split(/\s+/)
    .filter(Boolean);

  return cards.map(parseCard);
}

function parseStreet(line: string): {
  street: Street;
  board: Card[];
} | null {
  const streetMatch = line.match(
    /^\*\*\* (FLOP|TURN|RIVER) \*\*\* (.+)$/
  );

  if (streetMatch === null) {
    return null;
  }

  const streetName = getCapture(streetMatch, 1, "street");
  const boardText = getCapture(streetMatch, 2, "board");

  const street: Street =
    streetName === "FLOP"
      ? "flop"
      : streetName === "TURN"
        ? "turn"
        : "river";

  const boardGroups = [...boardText.matchAll(/\[([^\]]+)\]/g)];

  const board = boardGroups.flatMap((match) => {
    const cardsText = getCapture(match, 1, "board cards");

    return cardsText
      .split(/\s+/)
      .filter((value) => value.length > 0)
      .map(parseCard);
  });

  return {
    street,
    board,
  };
}

function parseHoleCards(
  line: string
): {
  playerName: string;
  cards: [Card, Card];
} | null {
  const match = line.match(
    /^Dealt to (.+) \[([^\]]+)\]$/
  );

  if (match === null) {
    return null;
  }

  const playerName = getCapture(
    match,
    1,
    "player name"
  );

  const cards = parseCards(line);

  if (cards.length !== 2) {
    throw new Error(
      `Expected two hole cards for ${playerName}`
    );
  }

  const first = cards[0];
  const second = cards[1];

  if (first === undefined || second === undefined) {
    throw new Error(
      `Could not parse hole cards for ${playerName}`
    );
  }

  return {
    playerName,
    cards: [first, second],
  };
}

function parseForcedBet(
  line: string
): {
  playerName: string;
  type: HandHistoryForcedBet["type"];
  amount: number;
} | null {
  let match = line.match(
    /^(.+): posts small blind ([\d,]+)$/
  );

  if (match !== null) {
    return {
      playerName: getCapture(
        match,
        1,
        "player name"
      ),
      type: "small_blind",
      amount: parseMoney(
        getCapture(match, 2, "small blind amount")
      ),
    };
  }

  match = line.match(
    /^(.+): posts big blind ([\d,]+)$/
  );

  if (match !== null) {
    return {
      playerName: getCapture(
        match,
        1,
        "player name"
      ),
      type: "big_blind",
      amount: parseMoney(
        getCapture(match, 2, "big blind amount")
      ),
    };
  }

  match = line.match(
    /^(.+): posts the ante ([\d,]+)$/
  );

  if (match !== null) {
    return {
      playerName: getCapture(
        match,
        1,
        "player name"
      ),
      type: "ante",
      amount: parseMoney(
        getCapture(match, 2, "ante amount")
      ),
    };
  }

  return null;
}

function parseActionLine(
  line: string
): ParsedAction | null {
  let match = line.match(/^(.+): folds$/);

  if (match !== null) {
    return {
      playerName: getCapture(
        match,
        1,
        "player name"
      ),
      type: "fold",
      amount: 0,
      amountType: "contribution",
    };
  }

  match = line.match(/^(.+): checks$/);

  if (match !== null) {
    return {
      playerName: getCapture(
        match,
        1,
        "player name"
      ),
      type: "check",
      amount: 0,
      amountType: "contribution",
    };
  }

  match = line.match(
    /^(.+): calls ([\d,]+)(?: and is all-in)?$/
  );

  if (match !== null) {
    return {
      playerName: getCapture(
        match,
        1,
        "player name"
      ),
      type: "call",
      amount: parseMoney(
        getCapture(match, 2, "call amount")
      ),
      amountType: "contribution",
    };
  }

  match = line.match(
    /^(.+): bets ([\d,]+)(?: and is all-in)?$/
  );

  if (match !== null) {
    return {
      playerName: getCapture(
        match,
        1,
        "player name"
      ),
      type: "bet",
      amount: parseMoney(
        getCapture(match, 2, "bet amount")
      ),
      amountType: "contribution",
    };
  }

  match = line.match(
    /^(.+): raises ([\d,]+) to ([\d,]+)$/
  );

  if (match !== null) {
    return {
      playerName: getCapture(
        match,
        1,
        "player name"
      ),
      type: "raise",
      amount: parseMoney(
        getCapture(match, 3, "raise total")
      ),
      amountType: "total",
    };
  }

  match = line.match(
    /^(.+): is all-in(?: \(([\d,]+)\))?$/
  );

  if (match !== null) {
    const amount = match[2];

    return {
      playerName: getCapture(
        match,
        1,
        "player name"
      ),
      type: "all_in",
      amount:
        amount === undefined
          ? 0
          : parseMoney(amount),
      amountType: "contribution",
    };
  }

  return null;
}

function assignPositions(
  players: ParsedSeat[],
  buttonSeat: number
): Map<string, Position> {
  const sorted = [...players].sort(
    (a, b) => a.seat - b.seat
  );

  const buttonIndex = sorted.findIndex(
    (player) => player.seat === buttonSeat
  );

  if (buttonIndex === -1) {
    throw new Error(
      `Button seat ${buttonSeat} not found`
    );
  }

  const positions = new Map<string, Position>();

  for (
    let offset = 0;
    offset < sorted.length;
    offset += 1
  ) {
    const playerIndex =
      (buttonIndex + offset) % sorted.length;

    const player = sorted[playerIndex];

    if (player === undefined) {
      throw new Error(
        `Could not resolve player at index ${playerIndex}`
      );
    }

    const position =
      POSITION_BY_OFFSET[offset];

    if (position === undefined) {
      throw new Error(
        `Unsupported table size: ${sorted.length}`
      );
    }

    positions.set(player.name, position);
  }

  return positions;
}

export function parsePluribusHand(
  input: string
): HandHistory {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const firstLine = lines[0];

  if (firstLine === undefined) {
    throw new Error(
      "Cannot parse empty hand history"
    );
  }

  const header = parseHeader(firstLine);

  const buttonLine = lines.find((line) =>
    line.includes("is the button")
  );

  if (buttonLine === undefined) {
    throw new Error(
      "Could not find button information"
    );
  }

  header.buttonSeat =
    parseButtonSeat(buttonLine);

  const seats = lines
    .map(parseSeat)
    .filter(
      (player): player is ParsedSeat =>
        player !== null
    );

  if (seats.length === 0) {
    throw new Error("No players found");
  }

  const positions = assignPositions(
    seats,
    header.buttonSeat
  );

  const players: HandHistoryPlayer[] =
    seats.map((seat) => ({
      id: seat.name,
      name: seat.name,
      position:
        positions.get(seat.name) ?? "UTG",
      startingStack: seat.stack,
    }));

  const forcedBets: HandHistoryForcedBet[] =
    [];

  const holeCardsByPlayer = new Map<
    string,
    [Card, Card]
  >();

  const streets: HandHistoryStreet[] = [];

  let currentStreet: Street = "preflop";
  let currentBoard: Card[] = [];
  let currentStreetActions: HandHistoryAction[] =
    [];

  const flushStreet = (): void => {
    if (currentStreetActions.length === 0) {
      return;
    }

    streets.push({
      street: currentStreet,
      board: currentBoard,
      actions: currentStreetActions,
    });

    currentStreetActions = [];
  };

  for (const line of lines) {
    const parsedStreet = parseStreet(line);

    if (parsedStreet !== null) {
      if (parsedStreet.street !== currentStreet) {
        flushStreet();
      }

      currentStreet = parsedStreet.street;
      currentBoard = parsedStreet.board;

      continue;
    }

    const holeCards = parseHoleCards(line);

    if (holeCards !== null) {
      holeCardsByPlayer.set(
        holeCards.playerName,
        holeCards.cards
      );

      continue;
    }

    const forcedBet = parseForcedBet(line);

    if (forcedBet !== null) {
      const player = players.find(
        (candidate) =>
          candidate.name ===
          forcedBet.playerName
      );

      if (player !== undefined) {
        forcedBets.push({
          playerId: player.id,
          type: forcedBet.type,
          amount: forcedBet.amount,
        });
      }

      continue;
    }

    const parsedAction =
      parseActionLine(line);

    if (parsedAction === null) {
      continue;
    }

    const player = players.find(
      (candidate) =>
        candidate.name ===
        parsedAction.playerName
    );

    if (player === undefined) {
      continue;
    }

    currentStreetActions.push({
      playerId: player.id,
      type: parsedAction.type,
      amount: parsedAction.amount,
      amountType:
      parsedAction.amountType,
      street: currentStreet,
    });
  }

  flushStreet();

  const hydratedPlayers =
    players.map((player) => {
      const cards = holeCardsByPlayer.get(
        player.name
      );

      if (cards === undefined) {
        return player;
      }

      return {
        ...player,
        holeCards: cards,
      };
    });

  const gameFormat: GameFormat = "cash";

  return {
    id: header.id,
    gameFormat,
    smallBlind: header.smallBlind,
    bigBlind: header.bigBlind,
    ante: 0,
    players: hydratedPlayers,
    forcedBets,
    streets,
  };
}