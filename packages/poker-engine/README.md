# @poker-vision/poker-engine

Core poker rules, evaluation, game-state, equity, and decision-analysis engine for PokerVision.

The package provides the deterministic poker logic used by the rest of the application.

```text
Cards / Game State
        ↓
Hand Evaluation
        ↓
Equity / Ranges
        ↓
Pot Odds / EV
        ↓
Decision Analysis
```

## Responsibilities

* Card and deck management
* Hand ranking and evaluation
* Best-hand calculation
* Hand comparison
* Game-state management
* Betting rules and round transitions
* Pot and side-pot calculation
* Showdown settlement
* Range parsing and combinations
* Hand and range equity
* Pot odds calculation
* Expected value calculation
* Decision analysis

## Non-Responsibilities

This package does **not** handle:

* Hand-history parsing
* Video processing or OCR
* Card recognition
* UI
* Database persistence
* AI-generated explanations

Those concerns belong to other PokerVision packages.

## Core API

```ts
evaluateHand(cards)
getBestHand(cards)
compareHands(a, b)

calculateEquity(...)
calculateRangeEquity(...)

calculatePotOdds(...)
calculateCallEV(...)

createHand(...)
applyAction(...)
transitionStreet(...)

calculatePots(...)
settleShowdown(...)

analyzeHand(...)
```

## Architecture

```text
Game / Hand History
        ↓
    poker-engine
        ↓
┌───────────────────────┐
│ Cards & Evaluation    │
│ Game State             │
│ Betting Rules          │
│ Pots & Showdown        │
│ Ranges & Equity        │
│ Pot Odds & EV          │
│ Decision Analysis      │
└───────────────────────┘
```

Other packages use `poker-engine` as the source of truth for poker rules and calculations.

## Package Structure

```text
src/
├── cards/
├── deck/
├── game-state/
├── ranges/
├── equity/
├── analysis/
├── evaluate-hand.ts
├── best-hand.ts
├── compare-hands.ts
├── evaluation.ts
└── index.ts
```

## Testing

Run the package tests:

```bash
pnpm --filter @poker-vision/poker-engine test
```

Run the full repository test suite:

```bash
pnpm test
```

## Current Status

The engine currently supports:

* Texas Hold'em card handling
* Hand evaluation and comparison
* 5–7 card best-hand evaluation
* Game-state transitions
* Betting rules
* Main and side pots
* Split-pot settlement
* Range parsing
* Range equity
* Pot odds
* Call EV
* Decision analysis

## Design Principle

`poker-engine` is the **deterministic source of truth for poker logic**.

Calculations should be reproducible, testable, and independent of UI, input format, video processing, or AI.
