# @poker-vision/hand-history

Canonical hand-history, replay, and analysis-orchestration layer for PokerVision.

This package defines the shared `HandHistory` model, reconstructs deterministic poker state, identifies decision points, builds decision context, and connects hands from different sources to `@poker-vision/poker-engine`.

```text
       HandHistory
            ↓
          Replay
            ↓
     Betting State
            ↓
    Decision Points
            ↓
   Decision Context
            ↓
     poker-engine
            ↓
  Decision Analysis
            ↓
   Analysis Report
```

## Responsibilities

* Define the canonical `HandHistory` model
* Validate hand histories
* Represent players, streets, actions, and forced bets
* Normalize contribution and total bet amounts
* Replay hands into deterministic game state
* Track total and street contributions
* Reconstruct betting state
* Track player status
* Handle heads-up and multi-player action order
* Identify player decision points
* Build decision context
* Determine legal decision options
* Connect decisions to the poker analysis engine
* Analyze complete hand histories
* Generate analysis reports

## Non-Responsibilities

This package does **not** handle:

* PokerStars or other source-format parsing
* Video decoding
* Live screen capture
* OCR
* Card recognition
* Visual player-action recognition
* Core poker hand evaluation
* Equity simulation implementation
* UI
* Database persistence
* AI-generated explanations

Those concerns belong to other PokerVision packages.

## Core API

```ts
validateHandHistory(hand)

replayHand(hand)
replayHandToAction(hand, actionIndex)

findDecisionPoints(hand, options)
createDecisionContext(...)

analyzeDecision(...)
analyzeHandHistory(...)

createAnalysisReport(...)
```

## Source-Independent Model

`HandHistory` is the canonical boundary between input sources and poker analysis.

```text
PokerStars TXT ──────────┐
                        │
Future Parsers ──────────┼──→ HandHistory
                        │
Video / Live Vision ─────┘
```

Downstream replay and analysis code does not need to know where the hand originated.

### Parsed Hands

```text
PokerStars TXT
      ↓
@poker-vision/hand-parser
      ↓
HandHistory
      ↓
@poker-vision/hand-history
```

### Vision-Derived Hands

```text
Video / Live Screen
        ↓
@poker-vision/vision
        ↓
    VideoHand
        ↓
videoHandToHandHistory()
        ↓
    HandHistory
        ↓
@poker-vision/hand-history
```

Both paths converge on the same replay and analysis infrastructure.

## HandHistory Model

The canonical model represents:

* Hand identity
* Game format
* Players
* Positions
* Starting stacks
* Optional hole cards
* Small and big blinds
* Antes
* Forced bets
* Streets
* Community cards
* Player actions
* Action amount semantics
* Optional timestamps

Actions support two amount representations:

```text
contribution
total
```

This allows the model to represent both traditional hand histories and OCR-derived displayed bet totals.

## Replay

Replay reconstructs poker state immediately before or after recorded actions.

```text
HandHistory
     ↓
Forced Bets
     ↓
Recorded Actions
     ↓
Contribution Normalization
     ↓
Betting State
     ↓
Game-State Snapshot
```

The replay layer tracks:

* Pot
* Current bet
* Player contributions
* Street contributions
* Total contributions
* Folded / active players
* Current player
* Betting-round completion

### Action Amount Normalization

Source formats can describe amounts differently.

For example:

```text
previous contribution = 25
displayed total       = 100
```

For an action with:

```text
amountType = "total"
amount     = 100
```

the replay layer applies only the required delta while preserving the player's total contribution.

This is particularly important for vision-derived actions, where OCR often sees the displayed total rather than the incremental contribution.

## Betting-State Reconstruction

The package reconstructs whose turn it is from:

* Player positions
* Current street
* Existing actions
* Current bet
* Street contributions
* Previous aggression
* Folded players

Action order supports both multi-player and heads-up Hold'em.

### Heads-Up Order

```text
Preflop:
BTN / SB → BB

Postflop:
BB → BTN
```

The distinction is important when validating whether a reconstructed action represents a real decision point.

## Decision Points

A `DecisionPoint` represents a recorded action that occurred when the player was actually expected to act.

```text
HandHistory
     ↓
Flatten Actions
     ↓
Replay Before Action
     ↓
Reconstruct Betting State
     ↓
Verify Current Player
     ↓
DecisionPoint
```

Example:

```ts
findDecisionPoints(
  hand,
  {
    playerId: "hero"
  }
);
```

Forced bets are not decision points.

Actions that occur when the requested player is not expected to act are excluded.

## Decision Context

Once a decision point is identified, the package reconstructs the information needed by the analysis engine.

```text
DecisionPoint
      ↓
Replay Snapshot
      ↓
Player / Pot / Board State
      ↓
Available Options
      ↓
DecisionContext
```

The resulting context can then be passed into the deterministic analysis logic in `@poker-vision/poker-engine`.

## Decision Analysis

The package orchestrates the existing poker-engine analysis pipeline rather than implementing separate poker mathematics.

```text
DecisionPoint
      ↓
DecisionContext
      ↓
@poker-vision/poker-engine
      ↓
Equity / Pot Odds / EV
      ↓
Decision Analysis
```

The underlying Phase 3 engine supports analysis for:

* Call
* Bet
* Raise

It also provides the foundation for opponent-response modeling.

## Complete Analysis Pipeline

For parsed hands:

```text
Raw Hand History
       ↓
   hand-parser
       ↓
   HandHistory
       ↓
      Replay
       ↓
 Decision Points
       ↓
Decision Context
       ↓
  poker-engine
       ↓
Decision Analysis
       ↓
Analysis Report
```

For video-derived hands:

```text
Video / Live Screen
        ↓
      vision
        ↓
    VideoHand
        ↓
videoHandToHandHistory()
        ↓
    HandHistory
        ↓
      Replay
        ↓
 Decision Points
        ↓
Decision Context
        ↓
   poker-engine
        ↓
Decision Analysis
        ↓
 Analysis Report
```

## Package Structure

```text
src/
├── types.ts
├── validate-hand-history.ts
├── normalize-action.ts
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

## Integration with Vision

Phase 5 connects reconstructed video hands to this package.

Current integration:

```text
VideoHand
   ↓
videoHandToHandHistory()
   ↓
HandHistory
   ↓
findDecisionPoints()
   ↓
DecisionPoint[]
```

Completed:

```text
5.1 VideoHand → HandHistory       ✅
5.2 HandHistory → DecisionPoints  ✅
```

Next:

```text
5.3 Decision Analysis Pipeline    ⬜
```

The goal is to reuse the existing Phase 3 analysis infrastructure rather than create a vision-specific analyzer.

## Testing

Run the package tests:

```bash
pnpm --filter @poker-vision/hand-history test
```

Type-check the package:

```bash
pnpm --filter @poker-vision/hand-history exec tsc --noEmit
```

Run the full repository test suite:

```bash
pnpm test
```

The package includes focused replay, betting-state, decision-point, parser-integration, and real-hand fixtures.

## Current Status

```text
Hand History
├── Canonical Model                 ✅
├── Validation                      ✅
├── Forced Bets                     ✅
├── Action Amount Normalization     ✅
├── Deterministic Replay            ✅
├── Betting-State Reconstruction    ✅
├── Player Status                   ✅
├── Heads-Up Action Order           ✅
├── Multi-Player Action Order       ✅
├── Decision Points                 ✅
├── Decision Context                ✅
├── Decision Options                ✅
├── Analysis Orchestration          ✅
└── Analysis Reports                ✅
```

Phase 2 hand-history and replay work is complete, and the Phase 3 analysis infrastructure is implemented.

Current project work is integrating vision-derived hands with that existing analysis pipeline.

## Design Principles

### Canonical Model

All supported hand sources should converge on `HandHistory`.

### Deterministic Replay

The same hand and action index should always reconstruct the same poker state.

### Source Independent

Replay and analysis should not care whether the hand originated from:

```text
PokerStars
Recorded video
Live screen capture
Manual entry
Future sources
```

### No Invented Data

Missing cards, actions, amounts, stacks, positions, or player identities should not be fabricated merely to make a hand analyzable.

### Separation of Concerns

```text
Parsing       → hand-parser
Vision        → vision
Replay        → hand-history
Poker Math    → poker-engine
UI            → application layer
AI            → explanation layer
```

### Shared Analysis Pipeline

There should be one deterministic analysis path:

```text
HandHistory
     ↓
Replay
     ↓
Decision Point
     ↓
Decision Context
     ↓
Poker Engine
     ↓
Analysis
```

Text histories and reconstructed video hands should use the same pipeline.

## Role in PokerVision

`@poker-vision/hand-history` is the bridge between **structured hand data** and **poker analysis**.

It owns the canonical representation and replay semantics that allow every input source to share the same downstream analysis system.

```text
        Input Sources
             │
      ┌──────┴──────┐
      ↓             ↓
 hand-parser      vision
      │             │
      └──────┬──────┘
             ↓
        HandHistory
             ↓
      hand-history
             ↓
     Decision Context
             ↓
       poker-engine
             ↓
     Analysis / Review
```