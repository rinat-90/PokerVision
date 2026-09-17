import type {
  OpponentResponseModel
} from "./types.js";

export interface CreateOpponentResponseModelInput {
  foldProbability: number;
  callProbability?: number;
  raiseProbability?: number;
}

export function createOpponentResponseModel(
  input: CreateOpponentResponseModelInput
): OpponentResponseModel {
  const {
    foldProbability,
    callProbability,
    raiseProbability
  } = input;

  validateProbability(
    foldProbability,
    "Fold probability"
  );

  const resolvedCallProbability =
    callProbability ??
    1 - foldProbability;

  const resolvedRaiseProbability =
    raiseProbability ?? 0;

  validateProbability(
    resolvedCallProbability,
    "Call probability"
  );

  validateProbability(
    resolvedRaiseProbability,
    "Raise probability"
  );

  const totalProbability =
    foldProbability +
    resolvedCallProbability +
    resolvedRaiseProbability;

  if (
    Math.abs(
      totalProbability - 1
    ) > 0.000001
  ) {
    throw new Error(
      "Opponent response probabilities must sum to 1"
    );
  }

  return {
    foldProbability,
    callProbability:
    resolvedCallProbability,
    raiseProbability:
    resolvedRaiseProbability
  };
}

function validateProbability(
  value: number,
  name: string
): void {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    throw new Error(
      `${name} must be between 0 and 1`
    );
  }
}