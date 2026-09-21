# @poker-vision/hand-parser

Source-specific hand-history parsing layer for PokerVision.

The package converts raw poker hand-history files into the canonical `HandHistory` model used by the replay and decision-analysis pipeline.

```text
Raw Hand History
       ↓
   Detection
       ↓
     Parser
       ↓
   HandHistory
       ↓
     Replay
       ↓
 Decision Points
       ↓
Decision Analysis
```

## Responsibilities

* Detect supported hand-history formats
* Parse poker hand headers
* Parse players and positions
* Parse hole cards
* Parse blinds and antes
* Parse betting actions
* Parse streets and community cards
* Parse showdown information
* Parse multiple hands from a file
* Produce canonical `HandHistory`
* Validate parser output
* Provide CLI access for testing and debugging

## Non-Responsibilities

This package does **not** handle:

* Poker rules or hand evaluation
* Hand replay
* Betting-state reconstruction
* Equity calculations
* Pot odds or EV
* Decision analysis
* Video or live-screen processing
* OCR or computer vision
* UI
* Database persistence
* AI-generated explanations

Those responsibilities belong to other PokerVision packages.

## Core API

```ts
parsePokerStarsHand(input)
parsePokerStarsHands(input)
```

Both produce the canonical `HandHistory` model.

Parsing errors are reported through `HandHistoryParserError`.

## Supported Formats

Currently supports **PokerStars hand histories**.

The parser handles:

* Cash-game headers
* 2-max and 6-max tables
* Player positions
* Hole cards
* Small and big blinds
* Antes
* Calls
* Checks
* Bets
* Raises
* Folds
* All-ins
* Flop, turn, and river
* Showdown
* Multiple hands per file

## Architecture

```text
PokerStars TXT
      ↓
    Detect
      ↓
    Header
      ↓
   Players
      ↓
 Hole Cards
      ↓
 Forced Bets
      ↓
   Streets
      ↓
   Actions
      ↓
  Showdown
      ↓
 HandHistory
```

The parser stops at the canonical `HandHistory` boundary.

From there, other packages take over:

```text
@poker-vision/hand-parser
           ↓
      HandHistory
           ↓
@poker-vision/hand-history
           ↓
   Replay / Decision Points
           ↓
@poker-vision/poker-engine
           ↓
    Decision Analysis
```

This keeps platform-specific parsing separate from poker rules and analysis.

## Canonical Hand Model

All supported source formats should eventually converge on the same model:

```text
PokerStars TXT ─────┐
                    │
Future Platform ────┼──→ HandHistory
                    │
Video / Vision ─────┘
```

This means the replay and analysis pipeline does not need to know where a hand originated.

For video-derived hands, `@poker-vision/vision` produces a `VideoHand` and adapts it to the same `HandHistory` model independently of this parser.

## Package Structure

```text
src/
├── types.ts
├── parser-error.ts
├── hand-history-parser.ts
├── cli.ts
├── index.ts
└── pokerstars/
    ├── detect.ts
    ├── parse-header.ts
    ├── parse-players.ts
    ├── parse-hole-cards.ts
    ├── parse-forced-bets.ts
    ├── parse-action.ts
    ├── parse-streets.ts
    ├── parse-board.ts
    ├── parse-showdown.ts
    ├── parse-hand.ts
    └── parse-hands.ts
```

## CLI

The package includes CLI support for testing parsed hand histories against real fixtures.

Example:

```bash
pnpm --filter @poker-vision/hand-parser analyze ./hand.txt MrBlue
```

The CLI can be used to verify the complete flow from a source hand history into the existing analysis pipeline.

## Testing

Run the package tests:

```bash
pnpm --filter @poker-vision/hand-parser test
```

Type-check the package:

```bash
pnpm --filter @poker-vision/hand-parser exec tsc --noEmit
```

Run the full repository test suite:

```bash
pnpm test
```

The package includes real hand-history fixtures used for end-to-end parser and analysis testing.

## Current Status

```text
PokerStars Parser
├── Format Detection       ✅
├── Header Parsing         ✅
├── Player Parsing         ✅
├── Position Mapping       ✅
├── Hole Cards             ✅
├── Forced Bets            ✅
├── Actions                ✅
├── Streets / Board        ✅
├── Showdown               ✅
├── Multi-Hand Files       ✅
└── Analysis Integration   ✅
```

The current PokerStars → `HandHistory` pipeline is complete for the supported formats.

Future parser work may include:

* Additional poker platforms
* Tournament hand histories
* 9-max tables
* Additional PokerStars edge cases
* Additional source formats

## Design Principles

### Source Specific

Each parser understands the syntax and conventions of its poker platform.

### Model Independent

Platform-specific details are translated into the canonical `HandHistory` model rather than leaking into downstream packages.

### No Poker Logic Duplication

The parser records what happened in the source hand history. It does not independently implement betting rules, equity, EV, or decision analysis.

### Deterministic

The same source hand history should produce the same structured output.

### Shared Analysis Pipeline

Whether a hand originates from text or vision:

```text
Source
  ↓
HandHistory
  ↓
Replay
  ↓
Decision Points
  ↓
Decision Analysis
```

`hand-parser` owns only the source → `HandHistory` portion of that pipeline.