# @poker-vision/vision

Computer-vision and live-capture pipeline for PokerVision.

The package converts recorded poker video and live screen capture into structured poker state, player actions, and reconstructed `VideoHand` objects that can enter the same `HandHistory` and decision-analysis pipeline as parsed hand histories.

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
    HandHistory
        ↓
 Decision Analysis
```

## Responsibilities

* Read recorded poker video
* Capture live poker screens
* Extract timestamped frames
* Detect the poker table
* Detect player seats
* Detect hole-card presence
* Detect community cards
* Track flop, turn, and river
* Recognize supported card ranks and suits
* Detect bet-chip regions
* Recognize displayed bet amounts
* Recognize explicit action labels
* Reconstruct player actions
* Track temporal table state
* Detect hand lifecycle
* Build `VideoHand`
* Track live hands
* Convert `VideoHand` into canonical `HandHistory`
* Feed reconstructed hands into decision-point analysis

## Non-Responsibilities

This package does **not** implement:

* Core poker rules
* Hand evaluation
* Pot or side-pot logic
* Equity calculations
* Pot odds or EV
* Poker strategy
* Hand-history source parsing
* Database persistence
* UI
* AI-generated strategy explanations

Those responsibilities belong to other PokerVision packages.

## Architecture

```text
                 ┌───────────────────┐
                 │   Frame Sources   │
                 │ Video / Live Mac  │
                 └─────────┬─────────┘
                           ↓
                 ┌───────────────────┐
                 │  Table Detection  │
                 └─────────┬─────────┘
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
      ┌───────────────┐         ┌───────────────┐
      │ Seat Detection│         │ Board Detection│
      └───────┬───────┘         └───────┬───────┘
              │                         │
              ↓                         ↓
       Hole-Card State            Board / Streets
              │                         │
              └────────────┬────────────┘
                           ↓
                 ┌───────────────────┐
                 │ Action Detection  │
                 │ Labels / Chips /  │
                 │ Amount OCR        │
                 └─────────┬─────────┘
                           ↓
                 ┌───────────────────┐
                 │ Temporal Tracking │
                 └─────────┬─────────┘
                           ↓
                 ┌───────────────────┐
                 │     VideoHand     │
                 └─────────┬─────────┘
                           ↓
                 ┌───────────────────┐
                 │    HandHistory    │
                 └─────────┬─────────┘
                           ↓
                    Decision Analysis
```

## Frame Sources

Vision uses a common frame-source abstraction:

```ts
interface SourceFrame {
  index: number;
  width: number;
  height: number;
  timestampSeconds: number;
  data: Buffer;
}

interface FrameSource extends AsyncIterable<SourceFrame> {
  start(): Promise<void>;
  stop(): Promise<void>;
}
```

This allows the vision pipeline to operate on different input sources without coupling detection logic to video files or live capture.

Current sources include:

```text
Recorded Video
     ↓
VideoFrameSource

Live macOS Screen
     ↓
ScreenFrameSource
```

## Recorded Video

The video pipeline supports recorded poker footage including MP4/MOV input.

```text
Video File
    ↓
Metadata
    ↓
Frame Extraction
    ↓
Timestamped Frames
    ↓
Vision Pipeline
```

Video processing provides:

* Video metadata
* FPS
* Frame timestamps
* Frame extraction
* Image decoding
* Region cropping

## Live Screen Capture

PokerVision supports live macOS screen capture through a native Swift helper using ScreenCaptureKit.

```text
macOS Screen
     ↓
ScreenCaptureKit
     ↓
Swift Capture Helper
     ↓
JPEG Frame Stream
     ↓
ScreenFrameSource
     ↓
LiveVisionSession
```

Build the native helper:

```bash
packages/screen-capture-macos/build.sh
```

The compiled helper is generated under:

```text
packages/screen-capture-macos/bin/
```

Build artifacts are intentionally excluded from Git.

## Table Detection

The pipeline first identifies the poker table inside the source frame.

```text
Full Frame
    ↓
Color / Geometry Detection
    ↓
Table Region
```

All downstream seat, board, and action regions are calculated relative to the detected table rather than the full screen.

This allows recorded video and browser-based live capture to share the same downstream pipeline.

## Seat Detection

PokerVision currently supports six-max table geometry.

```text
              Seat 0

      Seat 5          Seat 1


      Seat 4          Seat 2

              Seat 3
```

Seat detection uses visible hole-card clusters to determine which seats are active.

The detector tracks **card presence**, not poker semantics.

```text
Visible Hole Cards
        ↓
Card Components
        ↓
Seat Region
        ↓
hasCards = true
```

Card disappearance alone is **not** interpreted as a fold.

## Board Detection

Community-card detection tracks board geometry and street transitions.

```text
0 cards → preflop
3 cards → flop
4 cards → turn
5 cards → river
```

Temporal stabilization prevents single-frame detection noise from immediately changing poker state.

The board pipeline can emit stable street transitions such as:

```text
flop
turn
river
```

## Card Recognition

The package contains preprocessing and recognition infrastructure for:

* Card symbols
* Ranks
* Suits
* Complete cards

Example recognized board:

```text
2♥ 6♥ 5♥
5♣
```

Card recognition is deliberately separate from board geometry detection.

This allows PokerVision to track streets even when card identity cannot be recognized confidently.

### Current Limitation

Arbitrary live card rank/suit recognition is still limited.

The system must not fabricate card identities when recognition is unavailable or uncertain.

## Player Action Regions

Each seat has a table-relative action region used to inspect:

* Action labels
* Bet chips
* Bet amounts

```text
Seat
 ↓
Action Region
 ├── Explicit Label
 ├── Chip Components
 └── Amount Region
```

This keeps OCR and image analysis focused on small deterministic regions instead of performing broad screen OCR.

## Bet-Chip Detection

The chip detector identifies blue bet-chip components inside player action regions.

```text
Action Region
      ↓
Blue Pixel Mask
      ↓
Connected Components
      ↓
Component Selection
      ↓
Selected Bet Chip
```

Component selection uses seat-relative geometry and rejects known static UI edge components.

Chip presence is only a visual signal.

It does **not** automatically mean:

```text
bet
call
raise
```

Poker action semantics require additional context.

## Bet Amount Recognition

When a valid bet-chip component is found, PokerVision creates a tight chip-relative amount region.

```text
Selected Chip
     ↓
Amount ROI
     ↓
Preprocessing
     ↓
Tesseract OCR
     ↓
BetAmountParser
     ↓
Numeric Amount
```

The OCR pipeline is optimized for poker bet amounts rather than general text recognition.

Recognized displayed amounts use total-contribution semantics when converted to `HandHistory`:

```text
amountType = "total"
```

## Explicit Action Labels

The vision pipeline can recognize explicit poker UI labels including:

```text
Check
Call
Fold
Place Bet
```

Explicit labels provide stronger semantic evidence than visual chip/card changes.

`Place Bet` by itself does not create a final poker action without sufficient context.

## Player Action Detection

The action detector combines:

```text
Explicit Labels
      +
Bet Amount Changes
      +
Contribution State
      +
Street Context
      ↓
PlayerAction
```

Supported reconstructed action types:

```text
check
fold
call
bet
raise
```

### Conservative Semantics

PokerVision intentionally avoids aggressive inference.

It does **not** assume:

```text
card disappears → fold
chip appears     → bet
no chips         → check
amount cleared   → poker action
```

Missing or ambiguous information remains unknown rather than being fabricated.

## Temporal Tracking

Single-frame observations are not enough to reconstruct reliable poker state.

The package includes temporal trackers for:

* Seat state
* Board state
* Bet amounts
* Player actions
* Hand lifecycle

```text
Frame N
Frame N+1
Frame N+2
    ↓
Stable Observation
    ↓
State Transition
    ↓
Poker Event
```

This reduces false events caused by animation, rendering transitions, OCR noise, or temporary visual changes.

## Hand Lifecycle

The lifecycle detector tracks whether a hand is active.

```text
Inactive
   ↓
Enough Active Players
   ↓
handStarted
   ↓
Active Hand
   ↓
No Remaining Hole Cards
   ↓
handEnded
```

The detector can also attach to a stream that starts while a hand is already in progress.

## VideoHand

Vision reconstructs detected gameplay into a source-independent intermediate model:

```ts
interface VideoHand {
  startedAt: number | null;
  completedAt: number | null;

  players: VideoHandPlayer[];

  streets: VideoHandStreet[];

  actions: VideoHandAction[];
}
```

A `VideoHand` contains:

* Participating seats
* Community-card streets
* Recognized board cards
* Player actions
* Action amounts
* Action timestamps
* Hand lifecycle timestamps

It intentionally does not invent metadata that cannot reliably be recovered from pixels.

## Live Hand Tracking

The live pipeline connects detection components through:

```text
ScreenFrameSource
       ↓
LiveVisionSession
       ↓
LiveTableStateProcessor
       ↓
LiveBoardProcessor
       ↓
LivePlayerActionProcessor
       ↓
LiveHandTracker
       ↓
VideoHand
```

A complete live hand can therefore be reconstructed incrementally as screen frames arrive.

## VideoHand → HandHistory

Vision integrates with the canonical PokerVision analysis model through:

```text
VideoHand
   ↓
videoHandToHandHistory()
   ↓
HandHistory
```

Metadata that cannot safely be inferred from vision is supplied explicitly:

* Player ID
* Player name
* Position
* Starting stack
* Optional hole cards
* Game format
* Small blind
* Big blind
* Ante

Example:

```ts
const history =
  videoHandToHandHistory(
    videoHand,
    metadata
  );
```

The adapter handles:

* Seat → player mapping
* Streets
* Board cards
* Player actions
* Forced blinds
* Total bet amounts
* Hand timestamps

Unknown numeric actions are omitted rather than assigned fabricated amounts.

## Decision Analysis Integration

Vision-derived hands now enter the same analysis path as parsed hand histories.

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

Completed integration:

```text
VideoHand → HandHistory       ✅
HandHistory → DecisionPoints  ✅
```

Next:

```text
DecisionPoint
     ↓
DecisionContext
     ↓
Decision Analysis
     ↓
Analysis Report
```

Vision does not implement separate poker-analysis logic.

It feeds reconstructed data into the existing deterministic `hand-history` and `poker-engine` pipeline.

## Package Structure

```text
src/
├── action/
│   ├── bet-chip-detector.ts
│   ├── bet-chip-component-selector.ts
│   ├── bet-amount-detector.ts
│   ├── bet-amount-ocr.ts
│   ├── bet-amount-parser.ts
│   ├── player-action-region.ts
│   └── ...
├── board/
│   ├── board-card-detector.ts
│   ├── board-state.ts
│   ├── board-state-tracker.ts
│   └── ...
├── card/
│   ├── card-detector.ts
│   ├── card-recognizer.ts
│   ├── white-card-detector.ts
│   └── ...
├── hand/
│   ├── video-hand.ts
│   ├── video-hand-builder.ts
│   └── video-hand-to-hand-history.ts
├── seat/
│   ├── seat-detector.ts
│   ├── seat-layout.ts
│   └── ...
├── source/
│   ├── frame-source.ts
│   ├── video-frame-source.ts
│   └── screen-frame-source.ts
├── table/
│   ├── crop-frame.ts
│   └── ...
├── live/
│   └── ...
└── index.ts
```

The exact internal structure may evolve as recognition and live analysis become more sophisticated.

## Integration with Other Packages

### `@poker-vision/hand-history`

Vision produces the canonical model consumed by replay:

```text
vision
  ↓
VideoHand
  ↓
HandHistory
  ↓
hand-history
```

### `@poker-vision/poker-engine`

Vision does not call poker mathematics directly for visual inference.

The normal path is:

```text
vision
   ↓
HandHistory
   ↓
hand-history
   ↓
DecisionContext
   ↓
poker-engine
```

This prevents visual recognition logic from becoming coupled to poker strategy calculations.

## Testing

Run Vision tests:

```bash
pnpm --filter @poker-vision/vision test
```

Type-check the package:

```bash
pnpm --filter @poker-vision/vision exec tsc --noEmit
```

Run a focused test:

```bash
pnpm exec vitest run packages/vision/src/<path>.test.ts
```

Build the macOS capture helper:

```bash
packages/screen-capture-macos/build.sh
```

Run its focused integration test:

```bash
pnpm exec vitest run \
  packages/vision/src/source/screen-frame-source.test.ts
```

## Current Status

```text
Vision
├── Video Input                         ✅
├── Frame Extraction                    ✅
├── Table Detection                     ✅
├── Seat Detection                      ✅
├── Hole-Card Presence                  ✅
├── Board Detection                     ✅
├── Street Detection                    ✅
├── Card Recognition Foundation         ✅
├── Bet-Chip Detection                  ✅
├── Bet Amount OCR                      ✅
├── Explicit Action Labels              ✅
├── Player Action Reconstruction        ✅
├── Temporal State Tracking             ✅
├── Hand Lifecycle                      ✅
├── VideoHand Reconstruction            ✅
├── macOS Live Screen Capture           ✅
├── Live Hand Tracking                  ✅
├── VideoHand → HandHistory             ✅
├── HandHistory → Decision Points       ✅
└── Full Decision Analysis Integration  🟡
```

Phase 4 video and live-screen reconstruction is complete.

Current work is Phase 5 integration with the existing decision-analysis pipeline.

## Current Limitations

Vision intentionally favors correctness over aggressive inference.

Current limitations include:

* Arbitrary live card rank/suit recognition is limited.
* Card recognition currently supports a constrained recognition pipeline.
* OCR is designed around known poker UI geometry.
* Player identity is not inferred from arbitrary screen text.
* Starting stacks are not fabricated when unavailable.
* Positions are supplied as metadata when they cannot be determined safely.
* Missing bet amounts remain unknown.
* Card disappearance alone is not considered a fold.
* Chip appearance alone is not considered a bet, call, or raise.
* Absence of chips is not considered a check.
* Ante reconstruction requires additional game-format semantics.

These limitations are deliberate safeguards against creating incorrect poker histories from ambiguous visual information.

## Design Principles

### Conservative Recognition

```text
Unknown > Incorrect
```

If the visual evidence is insufficient, PokerVision should preserve uncertainty rather than invent poker state.

### Deterministic Geometry

Known poker UI regions are preferred over broad OCR or unconstrained image searches.

### Temporal Evidence

Poker state should be based on stable observations across frames rather than isolated detections.

### Source Independence

Vision ultimately produces the same canonical model as text parsers:

```text
Text ──────→ HandHistory
                 ↑
Video → VideoHand
```

### Separation of Concerns

```text
Pixels / OCR        → vision
Canonical Replay    → hand-history
Poker Mathematics   → poker-engine
Strategy / Review   → analysis layer
AI Explanations     → future AI layer
```

### No Invented Poker Actions

Visual changes are observations, not automatically poker actions.

Semantic actions require sufficient evidence and poker context.

## Role in PokerVision

`@poker-vision/vision` is the bridge between **pixels and structured poker data**.

```text
         Video / Live Screen
                  │
                  ↓
          ┌──────────────┐
          │    vision    │
          └──────┬───────┘
                 ↓
             VideoHand
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

The package's job ends once visual gameplay has been converted into reliable structured poker data. Poker rules and strategy remain in the deterministic downstream analysis system.