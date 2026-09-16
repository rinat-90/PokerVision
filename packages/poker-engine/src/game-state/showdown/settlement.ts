import type { Card } from "../../types.js";
import type {
  Player,
  Pot
} from "../types.js";

import {
  calculatePots
} from "../pot-manager.js";

import {
  getBestHand
} from "../../best-hand.js";

import {
  compareHands
} from "../../compare-hands.js";

import type {
  PotSettlement,
  ShowdownResult
} from "./types.js";

export function settleShowdown(
  players: Player[],
  board: Card[],
  totalContributions: Record<string, number>
): ShowdownResult {
  const potResult =
    calculatePots(
      players,
      totalContributions
    );

  const payouts =
    createEmptyPayouts(players);

  const settlements: PotSettlement[] = [];

  for (const pot of potResult.pots) {
    const winnerIds =
      findPotWinners(
        players,
        board,
        pot
      );

    distributePot(
      payouts,
      pot.amount,
      winnerIds
    );

    settlements.push({
      ...pot,
      winnerIds
    });
  }

  return {
    pots: settlements,
    payouts
  };
}

function findPotWinners(
  players: Player[],
  board: Card[],
  pot: Pot
): string[] {
  const eligiblePlayers =
    players.filter(
      (player) =>
        pot.eligiblePlayerIds.includes(
          player.id
        )
    );

  if (eligiblePlayers.length === 0) {
    throw new Error(
      "Pot has no eligible players"
    );
  }

  let bestHand:
    ReturnType<typeof getBestHand> | null =
    null;

  const winnerIds: string[] = [];

  for (const player of eligiblePlayers) {
    if (player.holeCards === undefined) {
      throw new Error(
        `Player ${player.id} has no hole cards`
      );
    }

    const evaluation =
      getBestHand([
        ...player.holeCards,
        ...board
      ]);

    if (bestHand === null) {
      bestHand = evaluation;
      winnerIds.push(player.id);
      continue;
    }

    const comparison =
      compareHands(
        evaluation,
        bestHand
      );

    if (comparison > 0) {
      bestHand = evaluation;

      winnerIds.length = 0;
      winnerIds.push(player.id);

      continue;
    }

    if (comparison === 0) {
      winnerIds.push(player.id);
    }
  }

  if (winnerIds.length === 0) {
    throw new Error(
      "Unable to determine pot winner"
    );
  }

  return winnerIds;
}

function distributePot(
  payouts: Record<string, number>,
  potAmount: number,
  winnerIds: string[]
): void {
  if (winnerIds.length === 0) {
    throw new Error(
      "Cannot distribute pot without winners"
    );
  }

  const share =
    Math.floor(
      potAmount / winnerIds.length
    );

  const remainder =
    potAmount % winnerIds.length;

  for (
    let index = 0;
    index < winnerIds.length;
    index++
  ) {
    const winnerId =
      winnerIds[index];

    if (winnerId === undefined) {
      continue;
    }

    const payout =
      share +
      (index < remainder ? 1 : 0);

    payouts[winnerId] =
      (payouts[winnerId] ?? 0) +
      payout;
  }
}

function createEmptyPayouts(
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