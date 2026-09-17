#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

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

  poker replay <file> --hand <handId> --interactive
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

  const actions = hand.streets.flatMap((street) => street.actions);

  if (interactive) {
    await runInteractiveReplay(hand);
    process.exit(0);
  }

  printReplay(hand, actions.length - 1);

  process.exit(0);
}

console.error(`Unknown command: ${command}`);
printUsage();
process.exit(1);

async function runInteractiveReplay(
  hand: Parameters<typeof replayHandToAction>[0],
): Promise<void> {
  const actions = hand.streets.flatMap((street) => street.actions);

  if (actions.length === 0) {
    console.log(`Hand #${hand.id} has no actions.`);
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

      printReplay(hand, actionIndex);

      console.log();
      console.log("Controls");
      console.log("────────────────────────────────────────");
      console.log("[n] next action");
      console.log("[p] previous action");
      console.log("[r] reset");
      console.log("[q] quit");

      const command = (
        await readline.question("\n> ")
      ).trim().toLowerCase();

      if (command === "n") {
        if (actionIndex < actions.length - 1) {
          actionIndex += 1;
        } else {
          console.log("\nAlready at the last action.");
          await waitForEnter(readline);
        }

        continue;
      }

      if (command === "p") {
        if (actionIndex > 0) {
          actionIndex -= 1;
        } else {
          console.log("\nAlready at the first action.");
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
  const actions = hand.streets.flatMap((street) => street.actions);
  const action = actions[actionIndex];

  if (action === undefined) {
    return;
  }

  const snapshot = replayHandToAction(hand, actionIndex);

  console.log(`PokerVision — Hand #${hand.id}`);
  console.log("════════════════════════════════════════");
  console.log();

  console.log(
    `Action ${actionIndex + 1}/${actions.length} — ${action.street.toUpperCase()}`,
  );
  console.log("────────────────────────────────────────");

  const street = hand.streets.find(
    (value) => value.street === action.street,
  );

  if (street !== undefined && street.board.length > 0) {
    console.log(
      `Board: ${street.board
        .map((card) => `${card.rank}${card.suit[0]}`)
        .join(" ")}`,
    );
  }

  console.log();

  console.log("Players");
  console.log("────────────────────────────────────────");

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
  console.log("────────────────────────────────────────");
  console.log(`Pot:          ${snapshot.pot}`);
  console.log(`Current bet:  ${snapshot.currentBet}`);
  console.log(`Min raise:    ${snapshot.minimumRaise}`);

  console.log();

  console.log("Action");
  console.log("────────────────────────────────────────");

  const amount =
    action.type === "fold" || action.type === "check"
      ? ""
      : ` ${action.amount}`;

  console.log(
    `${action.playerId} ${action.type}${amount}`,
  );

  console.log();

  console.log("Players to act");
  console.log("────────────────────────────────────────");

  if (snapshot.playersToAct.length === 0) {
    console.log("None");
  } else {
    console.log(snapshot.playersToAct.join(", "));
  }
}

async function waitForEnter(
  readline: ReturnType<typeof createInterface>,
): Promise<void> {
  await readline.question("\nPress Enter to continue...");
}