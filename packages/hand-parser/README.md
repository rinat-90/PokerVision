# @poker-vision/hand-parser

Hand-history parsing layer for PokerVision.

The package converts raw poker hand-history files into the canonical `HandHistory` model used by `@poker-vision/hand-history`.

```text
Raw Hand History
       ↓
   Detection
       ↓
     Parser
       ↓
   HandHistory
       ↓
  hand-history
       ↓
 poker-engine
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
* Validate parser output
* Provide CLI access for testing and debugging

## Non-Responsibilities

This package does **not** handle:

* Poker rules or hand evaluation
* Equity calculations
* Pot odds or EV
* Video processing
* OCR / computer vision
* UI
* Database persistence
* Decision analysis

Those responsibilities belong to other PokerVision packages.

## Core API

```ts id="7qv5fs"
parsePokerStarsHand(input)
parsePokerStarsHands(input)
```

Both return the canonical `HandHistory` model.

Parsing errors are reported through `HandHistoryParserError`.

## Supported Format

Currently supports **PokerStars hand histories**.

The parser currently handles:

* Cash-game headers
* 2-max and 6-max tables
* Player positions
* Hole cards
* Small/big blinds
* Antes
* Calls
* Checks
* Bets
* Raises
* Folds
* All-ins
* Flop, turn, and river
* Showdown
* Multiple hands

## Architecture

```text id="yq3g5r"
PokerStars TXT
      ↓
    detect
      ↓
    header
      ↓
   players
      ↓
  forced bets
      ↓
    streets
      ↓
    actions
      ↓
   showdown
      ↓
 HandHistory
```

The parser is responsible only for translating the source format into the canonical model.

## Package Structure

```text id="v4t2hh"
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

## Testing

Run the package tests:

```bash id="y8i0sl"
pnpm --filter @poker-vision/hand-parser test
```

Run the full repository test suite:

```bash id="l7h2pj"
pnpm test
```

The package also includes a real PokerStars hand-history fixture for end-to-end testing.

## Current Status

The parser currently provides a complete PokerStars → `HandHistory` pipeline for the supported formats.

Future work may include:

* Additional poker platforms
* Tournament hand histories
* 9-max tables
* More PokerStars edge cases
* Additional source formats

## Design Principle

`hand-parser` should be **source-specific but model-independent**.

Its job is to understand the syntax of a poker platform and produce a clean, validated `HandHistory` without implementing poker logic itself.
