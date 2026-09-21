# PokerVision

PokerVision is a poker analysis platform that reconstructs poker hands from hand histories, recorded video, and live screen capture, then feeds them into a deterministic poker engine for replay and decision analysis.

The long-term goal is a complete workflow from raw poker gameplay to structured hands, decision analysis, and AI-assisted review.

```text
Hand History / Video / Live Screen
              ↓
      Parsing / Vision
              ↓
          HandHistory
              ↓
            Replay
              ↓
        Poker Engine
              ↓
       Decision Points
              ↓
      Decision Analysis
              ↓
       Reports / Review
```

## Packages

### `@poker-vision/poker-engine`

Core deterministic poker logic and calculations.

* Cards and decks
* Hand evaluation
* Game state
* Betting rules
* Pots and showdown
* Ranges and equity
* Pot odds
* EV calculations
* Decision analysis
* Opponent modeling foundation

### `@poker-vision/hand-history`

Canonical hand model, replay layer, and analysis bridge.

* Hand-history model
* Validation
* Forced bets
* Action normalization
* Replay
* Betting-state reconstruction
* Heads-up and multi-player action order
* Decision points
* Decision context
* Analysis reports

### `@poker-vision/hand-parser`

Source-specific hand-history parsing.

* PokerStars parsing
* Players and positions
* Hole cards
* Actions
* Streets
* Showdown
* Multi-hand files
* Pluribus fixtures

### `@poker-vision/vision`

Video and live-screen poker reconstruction.

* MP4 / MOV video input
* Video metadata and frame extraction
* macOS live screen capture
* Poker table detection
* Seat detection
* Hole-card presence detection
* Community-card detection
* Card rank and suit recognition
* Poker street detection
* Player action regions
* Bet-chip detection
* Bet-amount OCR
* Explicit action-label recognition
* Temporal action tracking
* Hand lifecycle detection
* `VideoHand` reconstruction
* Live hand tracking
* `VideoHand → HandHistory` adapter
* Decision-point integration

## Architecture

```text
                 ┌─────────────────────┐
                 │    Hand Sources     │
                 │ TXT / Video / Live  │
                 └──────────┬──────────┘
                            │
                ┌───────────┴───────────┐
                ↓                       ↓
       ┌─────────────────┐     ┌─────────────────┐
       │   hand-parser   │     │     vision      │
       └────────┬────────┘     └────────┬────────┘
                │                       │
                └───────────┬───────────┘
                            ↓
                   ┌─────────────────┐
                   │   HandHistory   │
                   └────────┬────────┘
                            ↓
                   ┌─────────────────┐
                   │      Replay     │
                   └────────┬────────┘
                            ↓
                   ┌─────────────────┐
                   │  poker-engine   │
                   └────────┬────────┘
                            ↓
                   ┌─────────────────┐
                   │ Decision Points │
                   └────────┬────────┘
                            ↓
                   ┌─────────────────┐
                   │    Analysis     │
                   └─────────────────┘
```

Both parsed hand histories and reconstructed video hands converge on the same canonical `HandHistory` model.

### Video Pipeline

```text
Video / Live Screen
        ↓
   Frame Source
        ↓
  Table Detection
        ↓
 Seat / Board Detection
        ↓
 Card / Action Detection
        ↓
 Temporal Tracking
        ↓
    VideoHand
        ↓
VideoHand → HandHistory
        ↓
      Replay
        ↓
 Decision Points
        ↓
 Decision Analysis
```

## Video Reconstruction

PokerVision can reconstruct hand state from both recorded video and live screen capture.

### Table State

The vision pipeline tracks:

* Active seats
* Hole-card presence
* Community-card count
* Flop / turn / river transitions
* Hand start and hand end
* Stable temporal state changes

### Player Actions

The action pipeline combines:

* Explicit UI action labels
* Bet-chip detection
* Bet-amount OCR
* Temporal contribution tracking
* Poker-state context

Supported reconstructed action types:

```text
check
fold
call
bet
raise
```

Poker semantics are intentionally conservative. Visual signals such as chip appearance or card disappearance are not treated as poker actions by themselves.

### Live Capture

macOS live capture is supported through a native Swift screen-capture helper.

```text
ScreenCaptureKit
      ↓
ScreenFrameSource
      ↓
LiveVisionSession
      ↓
Live Table / Board / Action Processors
      ↓
LiveHandTracker
      ↓
VideoHand
```

## VideoHand Integration

Vision reconstructs a source-independent intermediate model:

```text
VideoHand
   ↓
videoHandToHandHistory()
   ↓
HandHistory
```

Player identity and poker metadata such as positions, starting stacks, blinds, and hole cards are supplied explicitly rather than inferred when they are not known.

The adapter currently handles:

* Seat → player mapping
* Player metadata
* Blinds and forced bets
* Streets and boards
* Player actions
* Total bet amounts
* Partial / unknown action amounts
* Hand timestamps

The resulting hand can be validated and replayed using the same infrastructure as parsed hand histories.

## Decision Analysis Integration

The current analysis pipeline is:

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

This allows reconstructed video hands to enter the existing Phase 3 analysis system without duplicating poker-engine logic.

The next integration step connects these decision points to decision context and the existing analysis/report pipeline.

## Repository Structure

```text
PokerVision/
├── apps/
│   ├── desktop/
│   └── api/
├── packages/
│   ├── poker-engine/
│   ├── hand-history/
│   ├── hand-parser/
│   ├── vision/
│   ├── screen-capture-macos/
│   └── ...
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```

## Development

Install dependencies:

```bash
pnpm install
```

Run tests:

```bash
pnpm test
```

Run the full build:

```bash
pnpm build
```

Run tests for a specific package:

```bash
pnpm --filter @poker-vision/poker-engine test
pnpm --filter @poker-vision/hand-history test
pnpm --filter @poker-vision/hand-parser test
pnpm --filter @poker-vision/vision test
```

Type-check individual packages:

```bash
pnpm --filter @poker-vision/hand-history exec tsc --noEmit
pnpm --filter @poker-vision/vision exec tsc --noEmit
```

Build the macOS screen-capture helper:

```bash
packages/screen-capture-macos/build.sh
```

## Current Status

```text
Phase 1 — Poker Engine                         ✅
Phase 2 — Hand History + Replay                ✅
Phase 3 — Decision Analysis                    ✅
Phase 4 — Video / Live Screen Reconstruction   ✅
Phase 5 — Analysis Integration                 🟡

  5.1 VideoHand → HandHistory                  ✅
  5.2 HandHistory → Decision Points            ✅
  5.3 Decision Analysis Pipeline               ⬜

Future — Desktop Review UI                     ⬜
Future — Database / Persistence                ⬜
Future — AI-Assisted Review                    ⬜
Future — Production Hardening                  ⬜
```

## Current Limitations

The vision pipeline is intentionally conservative.

* Arbitrary live card rank/suit recognition is still limited.
* OCR is optimized for known poker UI regions rather than general-purpose text recognition.
* Visual card disappearance is not automatically interpreted as a fold.
* Chip appearance alone is not interpreted as a bet, call, or raise.
* Missing bet amounts are not fabricated.
* Player identity, positions, and starting stacks are not inferred when they are unavailable.
* Ante forced-bet reconstruction still requires additional game-format semantics.

These constraints keep the reconstructed hand deterministic and avoid inventing poker actions from ambiguous visual signals.

## Design Principles

* **Deterministic** — poker calculations should be reproducible.
* **Conservative reconstruction** — ambiguous visual signals should not create invented poker actions.
* **Source-independent models** — parsed and vision-derived hands converge on `HandHistory`.
* **Separation of concerns** — parsing, vision, poker logic, analysis, UI, and AI remain separate.
* **Testable** — core poker and reconstruction logic should be covered by automated tests.
* **Composable** — packages should remain independently usable.
* **AI as an assistant** — deterministic poker calculations remain the source of truth.

## Roadmap

See [`ROADMAP.md`](./ROADMAP.md) for the detailed project plan and implementation checklist.