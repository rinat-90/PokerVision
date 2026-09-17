#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  parsePluribusHand,
  replayHandToAction,
  validateHandHistory,
} from "@poker-vision/hand-history";

const [, , command, filePath, ...args] = process.argv;

function printUsage(): void {
  console.error(`
Usage:

  poker parse <file>

  poker replay <file> --hand <handId>
`);
}

if (command === undefined || filePath === undefined) {
  printUsage();
  process.exit(1);
}

/**
 * pnpm --filter executes the CLI from apps/cli.
 *
 * Resolve relative file paths from the PokerVision repository root.
 */
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

  console.log(`PokerVision — Hand #${hand.id}`);
  console.log("════════════════════════════════════════");
  console.log();

  console.log("Players");
  console.log("────────────────────────────────────────");

  for (const player of hand.players) {
    const holeCards =
      player.holeCards === undefined
        ? ""
        : `  ${player.holeCards[0].rank}${player.holeCards[0].suit[0]} ${player.holeCards[1].rank}${player.holeCards[1].suit[0]}`;

    console.log(
      `${player.position.padEnd(5)} ${player.name.padEnd(12)}${holeCards}`,
    );
  }

  console.log();

  const actions = hand.streets.flatMap((street) => street.actions);

  for (let actionIndex = 0; actionIndex < actions.length; actionIndex += 1) {
    const action = actions[actionIndex];

    if (action === undefined) {
      continue;
    }

    const street = hand.streets.find(
      (value) => value.street === action.street,
    );

    if (street === undefined) {
      continue;
    }

    const isFirstActionOnStreet = street.actions[0] === action;

    if (isFirstActionOnStreet) {
      console.log(action.street.toUpperCase());
      console.log("────────────────────────────────────────");

      if (street.board.length > 0) {
        console.log(
          `Board: ${street.board
            .map((card) => `${card.rank}${card.suit[0]}`)
            .join(" ")}`,
        );
      }
    }

    const amount =
      action.type === "fold" || action.type === "check"
        ? ""
        : ` ${action.amount}`;

    console.log(
      `${actionIndex + 1}. ${action.playerId} ${action.type}${amount}`,
    );

    const snapshot = replayHandToAction(hand, actionIndex);

    console.log(`   Pot: ${snapshot.pot}`);
    console.log();
  }

  process.exit(0);
}

console.error(`Unknown command: ${command}`);
printUsage();
process.exit(1);