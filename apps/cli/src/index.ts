#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import {
  analyzeHandHistory,
  parsePluribusHand,
  replayHandToAction,
  validateHandHistory,
} from "@poker-vision/hand-history";

import {
  createRange,
} from "@poker-vision/poker-engine";

const [, , command, filePath, ...args] = process.argv;

function printUsage(): void {
  console.error(`
Usage:

  poker parse <file>

  poker replay <file> --hand <handId>

  poker replay <file> --hand <handId> --interactive

  poker analyze <file> --hand <handId> --hero <playerId>

  Optional analyze arguments:

  --iterations <number>
  --range <range1,range2,...>

Example:

  poker analyze packages/hand-history/fixtures/pluribus/pluribus_100.txt --hand 100000 --hero MrBlue

  poker analyze packages/hand-history/fixtures/pluribus/pluribus_100.txt --hand 100000 --hero MrBlue --iterations 500

  poker analyze packages/hand-history/fixtures/pluribus/pluribus_100.txt --hand 100000 --hero MrBlue --range QQ,JJ,TT,AKs,AQs
`);
}

if (command === undefined || filePath === undefined) {
  printUsage();
  process.exit(1);
}

const repoRoot = resolve(import.meta.dirname, "../../..");
const resolvedFilePath = resolve(repoRoot, filePath);

const content = await readFile(resolvedFilePath, "utf8");

const handTexts = content
  .split(/\n(?=PokerStars Hand #)/)
  .map((text) => text.trim())
  .filter((text) => text.length > 0);

if (command === "parse") {
  console.log(`Found ${handTexts.length} hand(s)\n`);

  for (const handText of handTexts) {
    try {
      const hand = parsePluribusHand(handText);
      validateHandHistory(hand);

      console.log(`Hand #${hand.id}`);
      console.log("────────────────────────────────");
      console.log(`Game:    ${hand.gameFormat}`);
      console.log(`Blinds:  ${hand.smallBlind}/${hand.bigBlind}`);
      console.log(`Players: ${hand.players.length}`);
      console.log(`Streets: ${hand.streets.length}`);
      console.log("Status:  ✓ valid");
      console.log();
    } catch (error) {
      console.error("Failed to parse hand:");

      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }

      process.exitCode = 1;
    }
  }

  process.exit(0);
}

if (command === "replay") {
  const handFlagIndex = args.indexOf("--hand");

  if (handFlagIndex === -1) {
    console.error("Missing --hand <handId>");
    printUsage();
    process.exit(1);
  }

  const handId = args[handFlagIndex + 1];

  if (handId === undefined) {
    console.error("Missing hand ID");
    printUsage();
    process.exit(1);
  }

  const interactive = args.includes("--interactive");

  const handText = handTexts.find((text) => {
    const match = text.match(/^PokerStars Hand #(\d+)/);

    return match?.[1] === handId;
  });

  if (handText === undefined) {
    console.error(`Hand #${handId} not found`);
    process.exit(1);
  }

  const hand = parsePluribusHand(handText);
  validateHandHistory(hand);

  const actions = hand.streets.flatMap(
    (street) => street.actions,
  );

  if (interactive) {
    await runInteractiveReplay(hand);
    process.exit(0);
  }

  printReplay(hand, actions.length - 1);

  process.exit(0);
}

if (command === "analyze") {
  await runAnalyze();
  process.exit(0);
}

console.error(`Unknown command: ${command}`);
printUsage();
process.exit(1);

async function runAnalyze(): Promise<void> {
  const handFlagIndex = args.indexOf("--hand");

  if (handFlagIndex === -1) {
    console.error("Missing --hand <handId>");
    printUsage();
    process.exit(1);
  }

  const handId = args[handFlagIndex + 1];

  if (handId === undefined) {
    console.error("Missing hand ID");
    printUsage();
    process.exit(1);
  }

  const heroFlagIndex = args.indexOf("--hero");

  if (heroFlagIndex === -1) {
    console.error("Missing --hero <playerId>");
    printUsage();
    process.exit(1);
  }

  const heroPlayerId = args[heroFlagIndex + 1];

  if (heroPlayerId === undefined) {
    console.error("Missing hero player ID");
    printUsage();
    process.exit(1);
  }

  const iterationsFlagIndex =
    args.indexOf("--iterations");

  const iterationsValue =
    iterationsFlagIndex === -1
      ? undefined
      : args[iterationsFlagIndex + 1];

  let iterationsPerCombo = 500;

  if (iterationsValue !== undefined) {
    const parsedIterations =
      Number(iterationsValue);

    if (
      !Number.isInteger(parsedIterations) ||
      parsedIterations <= 0
    ) {
      console.error(
        "--iterations must be a positive integer",
      );
      process.exit(1);
    }

    iterationsPerCombo = parsedIterations;
  }

  const rangeFlagIndex =
    args.indexOf("--range");

  const rangeValue =
    rangeFlagIndex === -1
      ? undefined
      : args[rangeFlagIndex + 1];

  const rangeHands =
    rangeValue === undefined
      ? [
        "QQ",
        "JJ",
        "TT",
        "AKs",
        "AQs",
      ]
      : rangeValue
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

  if (rangeHands.length === 0) {
    console.error("Villain range cannot be empty");
    process.exit(1);
  }

  const handText = handTexts.find((text) => {
    const match = text.match(/^PokerStars Hand #(\d+)/);

    return match?.[1] === handId;
  });

  if (handText === undefined) {
    console.error(`Hand #${handId} not found`);
    process.exit(1);
  }

  const hand = parsePluribusHand(handText);
  validateHandHistory(hand);

  const hero = hand.players.find(
    (player) =>
      player.id === heroPlayerId ||
      player.name === heroPlayerId,
  );

  if (hero === undefined) {
    console.error(
      `Hero "${heroPlayerId}" not found in Hand #${hand.id}`,
    );

    console.error("\nAvailable players:");

    for (const player of hand.players) {
      console.error(
        `  ${player.id} (${player.name})`,
      );
    }

    process.exit(1);
  }

  const villainRange = createRange(rangeHands);

  console.log();
  console.log(
    `PokerVision — Hand #${hand.id}`,
  );
  console.log(
    "════════════════════════════════════════",
  );
  console.log();

  console.log("Hand");
  console.log(
    "────────────────────────────────────────",
  );
  console.log(`Game:        ${hand.gameFormat}`);
  console.log(
    `Blinds:      ${hand.smallBlind}/${hand.bigBlind}`,
  );
  console.log(`Hero:        ${hero.name}`);
  console.log(
    `Iterations:  ${iterationsPerCombo}/combo`,
  );
  console.log(
    `Villain:     ${rangeHands.join(", ")}`,
  );

  console.log();

  console.log("Players");
  console.log(
    "────────────────────────────────────────",
  );

  for (const player of hand.players) {
    const holeCards =
      player.holeCards === undefined
        ? ""
        : `  ${formatCards(player.holeCards)}`;

    console.log(
      `${player.position.padEnd(6)} ${player.name.padEnd(14)} ${String(player.startingStack).padStart(6)}${holeCards}`,
    );
  }

  console.log();

  const result =
    analyzeHandHistory(
      hand,
      {
        heroPlayerId: hero.id,
        villainRange,
        iterationsPerCombo,
      },
    );

  printAnalysis(result, hand);
}

function printAnalysis(
  result: ReturnType<typeof analyzeHandHistory>,
  hand: ReturnType<typeof parsePluribusHand>,
): void {
  console.log("Decision Analysis");
  console.log(
    "════════════════════════════════════════",
  );
  console.log();

  console.log(
    `Decision points: ${result.summary.totalDecisionPoints}`,
  );

  console.log(
    `Analyzed:        ${result.summary.analyzedDecisionPoints}`,
  );

  console.log(
    `Skipped:         ${result.summary.skippedDecisionPoints}`,
  );

  console.log(
    `Call decisions:  ${result.summary.callDecisions}`,
  );

  console.log();

  for (
    let index = 0;
    index < result.decisions.length;
    index += 1
  ) {
    const decision =
      result.decisions[index];

    if (decision === undefined) {
      continue;
    }

    printDecision(
      decision,
      index,
      hand,
    );
  }
}

function printDecision(
  decision: ReturnType<typeof analyzeHandHistory>["decisions"][number],
  index: number,
  hand: ReturnType<typeof parsePluribusHand>,
): void {
  const heroPlayer = hand.players.find(
    (player) =>
      player.id ===
      decision.context.opponentContext.heroPlayerId,
  );

  const position =
    heroPlayer?.position ?? "unknown";

  console.log(
    `Decision ${index + 1}`,
  );

  console.log(
    "────────────────────────────────────────",
  );

  console.log(
    `Street:        ${decision.action.street.toUpperCase()}`,
  );

  console.log(
    `Position:      ${position}`,
  );

  console.log(
    `Action:        ${formatAction(decision.action)}`,
  );

  console.log(
    `Pot:           ${decision.context.pot}`,
  );

  console.log(
    `Current bet:   ${decision.context.currentBet}`,
  );

  console.log(
    `Call amount:   ${decision.context.callAmount}`,
  );

  if (
    decision.context.raiseAmount !==
    undefined
  ) {
    console.log(
      `Raise amount:  ${decision.context.raiseAmount}`,
    );
  }

  if (
    decision.context.opponentCallAmount !==
    undefined
  ) {
    console.log(
      `Opp. call:     ${decision.context.opponentCallAmount}`,
    );
  }

  console.log(
    `Board:         ${formatCards(decision.context.board)}`,
  );

  console.log(
    `Hero cards:    ${formatCards(decision.context.heroCards)}`,
  );

  console.log();

  console.log("Analysis");
  console.log(
    "────────────────────────────────────────",
  );

  if (
    decision.analysis !== undefined &&
    decision.analysis.decision !== "not_applicable"
  ) {
    console.log(
      `  Equity:       ${formatPercent(
        decision.analysis.equity,
      )}`,
    );

    if (
      decision.analysis.potOdds !==
      undefined
    ) {
      console.log(
        `  Pot odds:     ${formatPercent(
          decision.analysis.potOdds,
        )}`,
      );
    }

    if (
      decision.analysis.expectedValue !==
      undefined
    ) {
      console.log(
        `  EV:           ${formatNumber(
          decision.analysis.expectedValue,
        )}`,
      );
    }

    console.log(
      `  Valid combos: ${decision.analysis.validVillainCombos}`,
    );

    console.log(
      `  Decision:     ${decision.analysis.decision}`,
    );
  } else if (decision.analysis !== undefined) {
    console.log(
      "  Equity:       N/A",
    );

    console.log(
      "  EV:           N/A",
    );

    console.log(
      "  Valid combos: N/A",
    );

    console.log(
      `  Decision:     ${decision.analysis.decision}`,
    );
  } else {
    console.log(
      "  Analysis:     not available",
    );
  }

  console.log(
    `  Status:       ${decision.status}`,
  );

  if (
    decision.skipReason !==
    undefined
  ) {
    console.log(
      `  Skip reason:  ${decision.skipReason}`,
    );
  }

  console.log();
}

function formatAction(
  action: {
    playerId: string;
    type: string;
    amount: number;
  },
): string {
  if (
    action.type === "fold" ||
    action.type === "check"
  ) {
    return `${action.playerId} ${action.type}`;
  }

  return `${action.playerId} ${action.type} ${action.amount}`;
}

function formatCards(
  cards: readonly {
    rank: string;
    suit: string;
  }[],
): string {
  if (cards.length === 0) {
    return "—";
  }

  return cards
    .map(
      (card) =>
        `${card.rank}${card.suit[0] ?? ""}`,
    )
    .join(" ");
}

function formatPercent(
  value: number,
): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatNumber(
  value: number,
): string {
  return value.toFixed(2);
}

async function runInteractiveReplay(
  hand: Parameters<typeof replayHandToAction>[0],
): Promise<void> {
  const actions = hand.streets.flatMap(
    (street) => street.actions,
  );

  if (actions.length === 0) {
    console.log(
      `Hand #${hand.id} has no actions.`,
    );
    return;
  }

  let actionIndex = 0;

  const readline = createInterface({
    input,
    output,
  });

  try {
    while (true) {
      console.clear();

      printReplay(
        hand,
        actionIndex,
      );

      console.log();
      console.log("Controls");
      console.log(
        "────────────────────────────────────────",
      );
      console.log("[n] next action");
      console.log("[p] previous action");
      console.log("[r] reset");
      console.log("[q] quit");

      const command = (
        await readline.question("\n> ")
      )
        .trim()
        .toLowerCase();

      if (command === "n") {
        if (
          actionIndex <
          actions.length - 1
        ) {
          actionIndex += 1;
        } else {
          console.log(
            "\nAlready at the last action.",
          );
          await waitForEnter(readline);
        }

        continue;
      }

      if (command === "p") {
        if (actionIndex > 0) {
          actionIndex -= 1;
        } else {
          console.log(
            "\nAlready at the first action.",
          );
          await waitForEnter(readline);
        }

        continue;
      }

      if (command === "r") {
        actionIndex = 0;
        continue;
      }

      if (command === "q") {
        return;
      }

      console.log("\nUnknown command.");
      await waitForEnter(readline);
    }
  } finally {
    readline.close();
  }
}

function printReplay(
  hand: Parameters<typeof replayHandToAction>[0],
  actionIndex: number,
): void {
  const actions = hand.streets.flatMap(
    (street) => street.actions,
  );

  const action = actions[actionIndex];

  if (action === undefined) {
    return;
  }

  const snapshot =
    replayHandToAction(
      hand,
      actionIndex,
    );

  console.log(
    `PokerVision — Hand #${hand.id}`,
  );
  console.log(
    "════════════════════════════════════════",
  );
  console.log();

  console.log(
    `Action ${actionIndex + 1}/${actions.length} — ${action.street.toUpperCase()}`,
  );

  console.log(
    "────────────────────────────────────────",
  );

  const street = hand.streets.find(
    (value) =>
      value.street === action.street,
  );

  if (
    street !== undefined &&
    street.board.length > 0
  ) {
    console.log(
      `Board: ${street.board
        .map(
          (card) =>
            `${card.rank}${card.suit[0]}`,
        )
        .join(" ")}`,
    );
  }

  console.log();

  console.log("Players");
  console.log(
    "────────────────────────────────────────",
  );

  for (const player of snapshot.players) {
    const holeCards =
      player.holeCards === undefined
        ? ""
        : `  ${player.holeCards[0].rank}${player.holeCards[0].suit[0]} ${player.holeCards[1].rank}${player.holeCards[1].suit[0]}`;

    console.log(
      `${player.position.padEnd(5)} ${player.name.padEnd(12)}${holeCards}`,
    );
  }

  console.log();

  console.log("State");
  console.log(
    "────────────────────────────────────────",
  );
  console.log(
    `Pot:          ${snapshot.pot}`,
  );
  console.log(
    `Current bet:  ${snapshot.currentBet}`,
  );
  console.log(
    `Min raise:    ${snapshot.minimumRaise}`,
  );

  console.log();

  console.log("Action");
  console.log(
    "────────────────────────────────────────",
  );

  const amount =
    action.type === "fold" ||
    action.type === "check"
      ? ""
      : ` ${action.amount}`;

  console.log(
    `${action.playerId} ${action.type}${amount}`,
  );

  console.log();

  console.log("Players to act");
  console.log(
    "────────────────────────────────────────",
  );

  if (
    snapshot.playersToAct.length === 0
  ) {
    console.log("None");
  } else {
    console.log(
      snapshot.playersToAct.join(", "),
    );
  }
}

async function waitForEnter(
  readline: ReturnType<
    typeof createInterface
  >,
): Promise<void> {
  await readline.question(
    "\nPress Enter to continue...",
  );
}