import {
  readFile
} from "node:fs/promises";

import {
  parsePokerStarsHands
} from "./pokerstars/parse-hands.js";

import {
  analyzeHandHistory
} from "@poker-vision/hand-history";

import {
  createRange
} from "@poker-vision/poker-engine";

async function main(): Promise<void> {
  const filePath = process.argv[2];
  const heroName = process.argv[3];

  if (filePath === undefined) {
    console.error(
      "Usage: pnpm analyze <hand-history-file> <player-name>"
    );

    process.exit(1);
  }

  if (heroName === undefined) {
    console.error(
      "Player name is required."
    );

    console.error(
      "Usage: pnpm analyze <hand-history-file> <player-name>"
    );

    process.exit(1);
  }

  const input =
    await readFile(
      filePath,
      "utf8"
    );

  const hands =
    parsePokerStarsHands(input);

  console.log("");
  console.log("PokerVision Analysis");
  console.log("====================");
  console.log("");
  console.log(`Hands: ${hands.length}`);
  console.log(`Player: ${heroName}`);
  console.log("");

  for (
    const hand of hands
    ) {
    const hero =
      hand.players.find(
        (player) =>
          player.name === heroName
      );

    console.log(
      `Hand #${hand.id}`
    );
    console.log(
      "----------------"
    );

    if (hero === undefined) {
      console.log(
        `Player "${heroName}" was not found.`
      );
      console.log("");
      continue;
    }

    const villainRange =
      createRange([
        "QQ",
        "JJ",
        "TT",
        "AK"
      ]);

    const analysis =
      analyzeHandHistory(
        hand,
        {
          heroPlayerId:
          hero.id,
          villainRange
        }
      );

    console.log(
      `Player: ${hero.name}`
    );
    console.log(
      `Decision points: ${analysis.summary.totalDecisionPoints}`
    );
    console.log(
      `Analyzed: ${analysis.summary.analyzedDecisionPoints}`
    );
    console.log(
      `Call decisions: ${analysis.summary.callDecisions}`
    );

    if (
      analysis.decisions.length === 0
    ) {
      console.log(
        "No call decisions to analyze."
      );
      console.log("");
      continue;
    }

    console.log("");

    for (
      const [
        index,
        decision
      ] of analysis.decisions.entries()
      ) {
      console.log(
        `Decision #${index + 1}`
      );

      console.log(
        `Street: ${decision.context.street.toUpperCase()}`
      );

      console.log(
        `Action: ${decision.action.type.toUpperCase()} $${decision.action.amount}`
      );

      console.log(
        `Pot: $${decision.context.pot}`
      );

      console.log(
        `Call: $${decision.context.callAmount}`
      );

      console.log(
        `Equity: ${formatPercent(
          decision.analysis.equity
        )}`
      );

      console.log(
        `Pot Odds: ${formatPercent(
          decision.analysis.potOdds.requiredEquity
        )}`
      );

      console.log(
        `EV: ${formatCurrency(
          decision.analysis.expectedValue.ev
        )}`
      );

      console.log(
        `Decision: ${decision.analysis.decision}`
      );

      console.log("");
    }
  }
}

function formatPercent(
  value: number
): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatCurrency(
  value: number
): string {
  const sign =
    value >= 0
      ? "+"
      : "-";

  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

main().catch(
  (error: unknown) => {
    console.error(
      error instanceof Error
        ? error.message
        : error
    );

    process.exit(1);
  }
);