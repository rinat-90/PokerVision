import type { Card } from "./types.js";
import { HandCategory } from "./hand-ranking.js";

export interface HandEvaluation {
  category: HandCategory;
  score: number[];
  cards: Card[];
}