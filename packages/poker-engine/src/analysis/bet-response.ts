export interface BetResponseModel {
  foldProbability: number;
}

export interface BetResponseInput {
  foldProbability: number;
}

export function createBetResponseModel(
  input: BetResponseInput
): BetResponseModel {
  if (
    input.foldProbability < 0 ||
    input.foldProbability > 1
  ) {
    throw new Error(
      "Fold probability must be between 0 and 1"
    );
  }

  return {
    foldProbability:
    input.foldProbability
  };
}