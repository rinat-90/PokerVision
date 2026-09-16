import type { Card } from "../types.js";
import {
  simulateEquity,
  type SimulationResult
} from "./simulation.js";

export interface EquityInput {
  heroCards: Card[];
  villainCards: Card[];
  board: Card[];
  iterations?: number;
}

export function calculateEquity(
  input: EquityInput
): SimulationResult {
  return simulateEquity(input);
}