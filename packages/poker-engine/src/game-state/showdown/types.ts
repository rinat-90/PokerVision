import type { Pot } from "../types.js";

export interface PotSettlement extends Pot {
  winnerIds: string[];
}

export interface ShowdownResult {
  pots: PotSettlement[];
  payouts: Record<string, number>;
}