# @poker-vision/poker-engine

Deterministic poker rules, game-state, equity, EV, and decision-analysis engine for PokerVision.

This package is the source of truth for poker logic used by hand-history replay, video reconstruction, and decision analysis.

```text
Cards / Game State
        ↓
Hand Evaluation
        ↓
Ranges / Equity
        ↓
Pot Odds / EV
        ↓
Decision Analysis
        ↓
Analysis Results
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
* Call, bet, and raise EV
* Unified decision analysis
* Decision-context evaluation
* Opponent response modeling
* Opponent action history

## Non-Responsibilities

This package does **not** handle:

* Hand-history parsing
* Hand-history replay orchestration
* Video processing
* Screen capture
* OCR
* Card recognition
* Player-action recognition
* UI
* Database persistence
* AI-generated explanations

Those concerns belong to other PokerVision packages.

## Analysis Pipeline

The engine operates on deterministic poker state supplied by higher-level packages.

```text
HandHistory / VideoHand
          ↓
   hand-history replay
          ↓
    DecisionPoint
          ↓
   DecisionContext
          ↓
    poker-engine
          ↓
 Decision Analysis
          ↓
   Analysis Result
```

The engine does not need to know whether a hand originated from a text hand history, recorded video, or live screen capture.

## Core Capabilities

### Hand Evaluation

```text
Cards
  ↓
5–7 Card Evaluation
  ↓
Best Five Cards
  ↓
Hand Ranking
```

Supports Texas Hold'em hand evaluation and comparison.

### Game State

The engine models poker state and applies deterministic transitions:

```text
Hand State
    ↓
Player Action
    ↓
Betting Rules
    ↓
Updated State
    ↓
Street Transition
```

### Pots and Showdown

Supports:

* Main pots
* Side pots
* All-in contributions
* Showdown settlement
* Split pots

### Ranges and Equity

```text
Range
  ↓
Combinations
  ↓
Board + Hero Hand
  ↓
Equity Simulation
```

Range and equity functionality provides the probability inputs used by decision analysis.

### Pot Odds and EV

The engine calculates the mathematical value of poker decisions.

```text
Pot
Call Cost
Equity
   ↓
Pot Odds
   ↓
Expected Value
```

Decision analysis supports EV calculations for:

* Call
* Bet
* Raise

### Decision Analysis

Phase 3 introduced a unified decision-analysis layer.

```text
DecisionContext
       ↓
Available Actions
       ↓
Equity / Pot Odds
       ↓
Opponent Response Model
       ↓
EV Analysis
       ↓
Decision Analysis Result
```

The same analysis system can be used for decisions reconstructed from hand histories or video.

## Opponent Modeling

The engine includes the foundation for modeling opponent behavior.

```text
Opponent Actions
       ↓
OpponentActionHistory
       ↓
Opponent Model
       ↓
Response Probabilities
       ↓
Decision Analysis
```

This layer is designed to support increasingly sophisticated opponent and range modeling without coupling the engine to parsing, vision, or UI code.

## Architecture

```text
              External Sources
        Hand History / Video / Live
                    ↓
             hand-history
                    ↓
             poker-engine
                    ↓
┌─────────────────────────────────┐
│ Cards & Evaluation              │
│ Game State                      │
│ Betting Rules                   │
│ Pots & Showdown                 │
│ Ranges & Equity                 │
│ Pot Odds & EV                   │
│ Opponent Modeling               │
│ Decision Analysis               │
└─────────────────────────────────┘
                    ↓
             Analysis Result
```

Other PokerVision packages use `poker-engine` as the deterministic source of truth rather than reimplementing poker rules.

## Package Structure

```text
src/
├── opponent/
│   ├── types.ts
│   ├── response-model.ts
│   ├── opponent-model.ts
│   └── opponent-action-history.ts
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

The exact internal structure may continue to evolve, but poker-domain logic remains isolated inside this package.

## Integration with Hand History

`@poker-vision/hand-history` is responsible for converting recorded actions into replayable poker state.

```text
HandHistory
     ↓
Replay
     ↓
DecisionPoint
     ↓
DecisionContext
     ↓
poker-engine
     ↓
Decision Analysis
```

This separation keeps replay concerns outside the engine while allowing the engine to analyze any reconstructed decision state.

## Integration with Vision

`@poker-vision/vision` reconstructs poker hands from recorded video and live screen capture.

```text
Video / Live Screen
        ↓
      Vision
        ↓
    VideoHand
        ↓
   HandHistory
        ↓
 Decision Point
        ↓
 Decision Context
        ↓
  poker-engine
```

The engine does not interpret pixels, OCR output, card images, or UI labels.

## Testing

Run the package tests:

```bash
pnpm --filter @poker-vision/poker-engine test
```

Type-check the package:

```bash
pnpm --filter @poker-vision/poker-engine exec tsc --noEmit
```

Run the full repository test suite:

```bash
pnpm test
```

## Current Status

```text
Poker Engine
├── Cards & Decks                 ✅
├── Hand Evaluation               ✅
├── Game State                    ✅
├── Betting Rules                 ✅
├── Pots & Showdown               ✅
├── Ranges                        ✅
├── Equity                        ✅
├── Pot Odds                      ✅
├── Call EV                       ✅
├── Bet / Raise EV                ✅
├── Unified Decision Analysis     ✅
├── Decision Context Support      ✅
└── Opponent Model Foundation     ✅
```

The core Phase 3 decision-analysis engine is complete.

Current project work is focused on feeding reconstructed video decisions into this existing analysis pipeline rather than adding a separate vision-specific analysis engine.

## Design Principles

### Deterministic

Given the same state and inputs, poker calculations should produce reproducible results.

### Source Independent

The engine does not care whether poker state originated from:

```text
PokerStars hand history
Recorded video
Live screen capture
Future data sources
```

### Conservative Inputs

The engine analyzes supplied poker state. It does not invent missing cards, actions, bet amounts, positions, or player identities.

### Separation of Concerns

```text
Parsing     → hand-parser
Replay      → hand-history
Vision      → vision
Poker Logic → poker-engine
UI          → application layer
AI          → explanation / assistance layer
```

### AI Is Not the Source of Truth

AI may eventually explain or summarize analysis, but deterministic poker calculations remain authoritative.

## Role in PokerVision

`poker-engine` sits at the center of the analysis architecture:

```text
           Hand Parser
                │
                ↓
Video ──→ HandHistory
                │
                ↓
             Replay
                │
                ↓
         Decision Context
                │
                ↓
         ┌─────────────┐
         │ poker-engine│
         └─────────────┘
                │
                ↓
        Decision Analysis
                │
                ↓
        Reports / AI Review
```

The goal is to keep this package independent, deterministic, and reusable as PokerVision expands into live vision, desktop review, and AI-assisted analysis.