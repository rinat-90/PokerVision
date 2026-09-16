import type {
  Player,
  Pot,
  PotResult
} from "./types.js";

export interface Contribution {
  playerId: string;

  amount: number;
}

/**
 * Calculates main pots and side pots from total
 * contributions.
 *
 * Example:
 *
 * A = 50
 * B = 150
 * C = 300
 *
 * produces:
 *
 * Main pot:
 *   150
 *   eligible: A, B, C
 *
 * Side pot:
 *   200
 *   eligible: B, C
 */
export function calculatePots(
  players: Player[],
  contributions: Record<string, number>
): PotResult {
  const contributionLevels =
    getContributionLevels(
      players,
      contributions
    );

  const pots: Pot[] = [];

  let previousLevel = 0;

  for (const level of contributionLevels) {
    const amountAtThisLevel =
      level - previousLevel;

    if (amountAtThisLevel <= 0) {
      previousLevel = level;
      continue;
    }

    const contributors =
      players.filter(
        (player) => {
          const contribution =
            contributions[player.id] ?? 0;

          return contribution >= level;
        }
      );

    if (contributors.length === 0) {
      previousLevel = level;
      continue;
    }

    const potAmount =
      amountAtThisLevel *
      contributors.length;

    /**
     * A folded player contributes money to the pot
     * but is not eligible to win it.
     */
    const eligiblePlayerIds =
      contributors
        .filter(
          (player) =>
            player.status !== "folded" &&
            player.status !== "out"
        )
        .map(
          (player) => player.id
        );

    pots.push({
      amount: potAmount,
      eligiblePlayerIds
    });

    previousLevel = level;
  }

  return {
    pots
  };
}

function getContributionLevels(
  players: Player[],
  contributions: Record<string, number>
): number[] {
  return [
    ...new Set(
      players
        .map(
          (player) =>
            contributions[player.id] ?? 0
        )
        .filter(
          (amount) => amount > 0
        )
    )
  ].sort(
    (a, b) => a - b
  );
}