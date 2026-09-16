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
  const filePath =
    process.argv[2];

  const heroName =
    process.argv[3];

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

  const villainRange =
    createRange([
      "QQ",
      "JJ",
      "TT",
      "AK"
    ]);

  console.log("");
  console.log("PokerVision Analysis");
  console.log("====================");
  console.log("");
  console.log(
    `Hands: ${hands.length}`
  );
  console.log(
    `Player: ${heroName}`
  );
  console.log("");

  let analyzedHands = 0;
  let skippedHands = 0;

  for (
    let handIndex = 0;
    handIndex < hands.length;
    handIndex++
  ) {
    const hand =
      hands[handIndex];

    if (hand === undefined) {
      continue;
    }

    console.log("");
    console.log(
      `Hand ${handIndex + 1}: ${hand.id}`
    );
    console.log(
      "--------------------"
    );

    const hero =
      hand.players.find(
        (player) =>
          player.name === heroName
      );

    if (hero === undefined) {
      console.log(
        `Player "${heroName}" not found.`
      );

      skippedHands += 1;
      continue;
    }

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
      `Decision points: ${
        analysis.summary.totalDecisionPoints
      }`
    );

    console.log(
      `Analyzed: ${
        analysis.summary.analyzedDecisionPoints
      }`
    );

    console.log(
      `Skipped: ${
        analysis.summary.skippedDecisionPoints
      }`
    );

    console.log(
      `Calls: ${
        analysis.summary.callDecisions
      }`
    );

    if (
      analysis.decisions.length === 0
    ) {
      console.log(
        "No decision points found."
      );

      skippedHands += 1;
      continue;
    }

    analyzedHands += 1;

    for (
      const decision of analysis.decisions
      ) {
      console.log("");

      console.log(
        `Action #${decision.actionIndex}`
      );

      console.log(
        `Street: ${decision.context.street}`
      );

      console.log(
        `Action: ${decision.action.type} ${decision.action.amount}`
      );

      console.log(
        `Pot: $${decision.context.pot.toFixed(2)}`
      );

      console.log(
        `Call amount: $${decision.context.callAmount.toFixed(2)}`
      );

      if (
        decision.status === "skipped"
      ) {
        console.log(
          `Status: skipped${
            decision.skipReason !== undefined
              ? ` (${decision.skipReason})`
              : ""
          }`
        );

        continue;
      }

      const decisionAnalysis =
        decision.analysis;

      if (
        decisionAnalysis === undefined
      ) {
        console.log(
          "Status: analyzed, but no analysis result."
        );

        continue;
      }

      console.log(
        `Status: analyzed`
      );

      console.log(
        `Equity: ${formatPercent(
          decisionAnalysis.equity
        )}`
      );

      if (
        decisionAnalysis.potOdds !== undefined
      ) {
        console.log(
          `Pot odds: ${formatPercent(
            decisionAnalysis.potOdds
          )}`
        );
      }

      if (
        decisionAnalysis.expectedValue !== undefined
      ) {
        console.log(
          `Expected value: ${formatCurrency(
            decisionAnalysis.expectedValue
          )}`
        );
      }

      console.log(
        `Decision: ${decisionAnalysis.decision}`
      );

      console.log(
        `Valid villain combos: ${
          decisionAnalysis.validVillainCombos
        }`
      );
    }
  }

  console.log("");
  console.log("====================");
  console.log(
    `Analyzed hands: ${analyzedHands}`
  );
  console.log(
    `Skipped hands: ${skippedHands}`
  );
  console.log("");
}

function formatPercent(
  value: number
): string {
  return `${(
    value * 100
  ).toFixed(1)}%`;
}

function formatCurrency(
  value: number
): string {
  const sign =
    value >= 0
      ? "+"
      : "-";

  return `${sign}$${Math.abs(
    value
  ).toFixed(2)}`;
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