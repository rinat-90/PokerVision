import type {
  ActionType,
  Card,
  GameFormat,
  Player,
  Position,
  Street
} from "@poker-vision/poker-engine";

export interface HandReviewPlayer {
  id: string;
  name: string;
  position: Position;
  startingStack: number;
  holeCards?: [Card, Card];
}

export interface HandReviewAction {
  actionIndex: number;
  playerId: string;
  street: Street;
  type: ActionType;
  amount: number;

  state: HandReviewDecisionState;
}

export interface HandReviewStreet {
  street: Street;
  board: Card[];
  actions: HandReviewAction[];
}

export interface HandReviewDecisionState {
  street: Street;

  board: Card[];

  players: Player[];

  pot: number;

  currentBet: number;

  minimumRaise: number;

  playerContributions:
    Record<string, number>;

  totalContributions:
    Record<string, number>;
}

export interface HandReviewDecision {
  actionIndex: number;
  street: string;
  action: string;
  amount: number;
  pot: number;
  callAmount: number;

  status:
    | "analyzed"
    | "skipped";

  skipReason?:
    | "action_not_supported"
    | "fold_probability_required";

  equity?: number;
  potOdds?: number;
  expectedValue?: number;
  decision?: string;
  state?: HandReviewDecisionState;
}

export interface HandReviewShowdownPlayer {
  playerId: string;
  cards: [Card, Card];
}

export interface HandReviewPayout {
  playerId: string;
  amount: number;
}

export interface HandReviewShowdown {
  players: HandReviewShowdownPlayer[];
  payouts: HandReviewPayout[];
}

export interface HandReview {
  id: string;

  gameFormat: GameFormat;

  blinds: {
    smallBlind: number;
    bigBlind: number;
    ante: number;
  };

  players: HandReviewPlayer[];

  streets: HandReviewStreet[];

  decisions: HandReviewDecision[];

  summary: {
    totalDecisionPoints: number;
    analyzedDecisionPoints: number;
    skippedDecisionPoints: number;
    callDecisions: number;
  };

  showdown?: HandReviewShowdown;

  startedAt?: number;
  completedAt?: number;
}