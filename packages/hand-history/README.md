# @poker-vision/hand-history

Canonical hand-history model and replay/analysis layer for PokerVision.

The package converts parsed hand histories into a deterministic game state, identifies decision points, and connects them to the poker analysis engine.

```text
Hand History
     ↓
Replay
     ↓
Game State
     ↓
Decision Context
     ↓
Decision Analysis
     ↓
Analysis Report
```

## Responsibilities

* Define the canonical `HandHistory` model
* Validate hand histories
* Replay hands into game state
* Track player status and betting state
* Detect player decision points
* Build decision context and legal options
* Run decision analysis
* Generate analysis reports

## Non-Responsibilities

This package does **not** handle:

* PokerStars or other source-format parsing
* Video processing or OCR
* Card recognition
* UI
* Database persistence

Those concerns belong to other PokerVision packages.

## Core API

```ts
validateHandHistory(hand)
replayHand(hand)
findDecisionPoints(hand, options)
getDecisionContext(...)
analyzeDecision(...)
analyzeHandHistory(...)
createAnalysisReport(...)
```

## Architecture

```text
PokerStars / Other Source
          ↓
    hand-parser
          ↓
    HandHistory
          ↓
    hand-history
          ↓
    poker-engine
          ↓
   Analysis / Reports
```

The package is intentionally source-independent, so future inputs such as video recognition or manual hand entry can produce the same `HandHistory` model.

## Package Structure

```text
src/
├── types.ts
├── validate-hand-history.ts
├── replay-hand.ts
├── betting-state.ts
├── player-status.ts
├── decision-context.ts
├── decision-options.ts
├── decision-points.ts
├── resolve-decision-points.ts
├── analyze-decision.ts
├── analyze-hand-history.ts
├── analysis-report.ts
└── index.ts
```

## Testing

Run the package tests:

```bash
pnpm --filter @poker-vision/hand-history test
```

Run the full repository test suite:

```bash
pnpm test
```

## Current Status

The package currently supports:

* Hand-history validation
* Deterministic replay
* Betting-state reconstruction
* Decision-point detection
* Decision context generation
* Call decision analysis
* Pot odds, equity, and EV integration
* Analysis reports
* Side-pot and split-pot scenarios

Decision analysis is currently focused on **call decisions**. Fold, check, bet, raise, and all-in analysis are planned for the next stage.

## Design Principle

`hand-history` is the bridge between **raw hand data** and **poker analysis**.

It should remain deterministic, source-independent, and reusable by the CLI, desktop application, video pipeline, and future AI features.
