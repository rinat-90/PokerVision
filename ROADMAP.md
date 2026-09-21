# PokerVision Roadmap

PokerVision is a modular poker analysis platform that converts hand histories, recorded video, and live poker gameplay into structured hands and deterministic decision analysis.

## Project Architecture

```text
        Input Sources
             │
     ┌───────┴────────┐
     ↓                ↓
Hand History      Video / Live
     ↓                ↓
 hand-parser          video
     │                ↓
     │              vision
     │                ↓
     │            VideoHand
     │                ↓
     └────────┬───────┘
              ↓
         HandHistory
              ↓
            Replay
              ↓
       Decision Points
              ↓
       Decision Context
              ↓
         Poker Engine
              ↓
      Decision Analysis
              ↓
       Reports / Review
```

---

# Phase 1 — Poker Engine ✅

## Card System

* [x] Card type
* [x] Suit and rank types
* [x] Card validation
* [x] Deck creation
* [x] Deck shuffling
* [x] Card removal

## Hand Evaluation

* [x] High card
* [x] Pair
* [x] Two pair
* [x] Three of a kind
* [x] Straight
* [x] Flush
* [x] Full house
* [x] Four of a kind
* [x] Straight flush
* [x] Royal flush
* [x] Best 5-card hand from 5–7 cards
* [x] Hand comparison

## Equity

* [x] Heads-up equity
* [x] Range parsing
* [x] Range combinations
* [x] Range-vs-hand equity
* [x] Configurable iterations
* [x] Invalid-combination filtering

## Betting / Game State

* [x] Game state
* [x] Player status
* [x] Betting rounds
* [x] Betting rules
* [x] Minimum bet
* [x] Minimum raise
* [x] Calls
* [x] Checks
* [x] Bets
* [x] Raises
* [x] Folds
* [x] All-ins
* [x] Street transitions

## Pots

* [x] Main pot
* [x] Side pots
* [x] Folded-player exclusion
* [x] All-in players
* [x] Split pots
* [x] Showdown settlement

## Decision Mathematics

* [x] Pot odds
* [x] Call EV
* [x] Bet EV
* [x] Raise EV
* [x] Decision classification
* [x] Valid villain combinations

---

# Phase 2 — Hand History + Replay ✅

## HandHistory Model

* [x] Hand metadata
* [x] Game format
* [x] Blinds
* [x] Antes
* [x] Players
* [x] Positions
* [x] Hole cards
* [x] Forced bets
* [x] Streets
* [x] Actions
* [x] Board cards
* [x] Contribution amount semantics
* [x] Total amount semantics

## Validation

* [x] Validate players
* [x] Validate positions
* [x] Validate cards
* [x] Validate blinds
* [x] Validate actions
* [x] Validate streets
* [x] Validate hand structure

## Replay

* [x] Convert HandHistory to game state
* [x] Replay actions
* [x] Replay to specific action
* [x] Track total contributions
* [x] Track street contributions
* [x] Normalize contribution amounts
* [x] Normalize total bet amounts
* [x] Track current player
* [x] Track current bet
* [x] Track pot
* [x] Track player status
* [x] Handle street transitions
* [x] Handle all-ins
* [x] Handle side pots
* [x] Handle split pots
* [x] Correct heads-up preflop order
* [x] Correct heads-up postflop order

## Decision Points

* [x] Detect player actions
* [x] Detect Hero decision points
* [x] Verify expected player
* [x] Build decision context
* [x] Determine legal actions
* [x] Determine call amount
* [x] Determine minimum bet
* [x] Determine minimum raise
* [x] Resolve decision points

---

# Phase 2B — PokerStars Parser ✅

## Detection

* [x] Detect PokerStars format
* [x] Reject unsupported formats

## Header

* [x] Hand ID
* [x] Game format
* [x] Stakes
* [x] Table information
* [x] Timestamp

## Players

* [x] Parse player names
* [x] Parse stacks
* [x] Parse positions
* [x] Determine button
* [x] Support 2-max
* [x] Support 6-max

## Cards

* [x] Parse hole cards
* [x] Parse flop
* [x] Parse turn
* [x] Parse river

## Betting

* [x] Parse folds
* [x] Parse checks
* [x] Parse calls
* [x] Parse bets
* [x] Parse raises
* [x] Parse all-ins

## Forced Bets

* [x] Small blind
* [x] Big blind
* [x] Antes
* [x] Forced-bet actions

## Showdown

* [x] Parse showdown
* [x] Parse revealed cards
* [x] Parse winning hand information

## Multiple Hands

* [x] Detect hand boundaries
* [x] Parse multiple hands
* [x] Validate multi-hand parsing

## Pipeline

* [x] PokerStars → HandHistory
* [x] Parser → Replay
* [x] Parser → Decision Points
* [x] Parser → Analysis
* [x] Real hand-history fixtures

---

# Phase 2C — CLI ✅

* [x] CLI entry point
* [x] Read hand-history file
* [x] Parse hands
* [x] Display parsed hand
* [x] Display decision points
* [x] Display analysis
* [x] Test with real PokerStars data

---

# Phase 3 — Decision Analysis ✅

## Unified Analysis

* [x] Unified decision-analysis interface
* [x] Standardized analysis results
* [x] Standardized decision context
* [x] Call analysis
* [x] Bet analysis
* [x] Raise analysis
* [x] Unified decision analysis
* [x] Analysis/report pipeline

## Call Analysis

* [x] Detect call
* [x] Calculate call amount
* [x] Calculate pot odds
* [x] Calculate equity
* [x] Calculate EV
* [x] Classify decision

## Bet Analysis

* [x] Capture bet amount
* [x] Calculate bet EV
* [x] Model opponent response
* [x] Integrate with unified analysis

## Raise Analysis

* [x] Capture raise amount
* [x] Calculate raise EV
* [x] Model opponent response
* [x] Integrate with unified analysis

## Opponent Modeling Foundation

* [x] Opponent model types
* [x] Response model
* [x] Opponent model
* [x] Opponent action history

## Reports

* [x] Decision analysis result
* [x] Hand analysis pipeline
* [x] Analysis report foundation

### Future Analysis Expansion

* [ ] Deeper fold-alternative analysis
* [ ] Check-vs-bet analysis
* [ ] All-in scenario analysis
* [ ] Advanced alternative-action comparison
* [ ] Range narrowing
* [ ] Advanced opponent modeling
* [ ] Leak detection
* [ ] Session aggregation

---

# Phase 4 — Video / Live Vision ✅

Phase 4 established the complete recorded-video and live-screen reconstruction pipeline.

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
```

## 4.1 Video Input

* [x] Video metadata
* [x] MP4 support
* [x] MOV support
* [x] Frame extraction
* [x] Frame timestamps
* [x] FPS
* [x] Frame sampling
* [x] Video frame source

## 4.2 Frame Processing

* [x] Frame abstraction
* [x] Frame decoding
* [x] Frame cropping
* [x] Region abstraction
* [x] Timestamp preservation

## 4.3 Table Detection

* [x] Poker table detection
* [x] Table region abstraction
* [x] Recorded-video table detection
* [x] Live-screen table detection
* [x] Table-relative geometry

### Future

* [ ] Multi-table support
* [ ] Advanced table tracking

## 4.4 Seat / Hole-Card Detection

* [x] Six-max seat geometry
* [x] Hole-card component detection
* [x] Card-back detection
* [x] Active-seat detection
* [x] Stable seat-state tracking

## 4.5 Board Detection

* [x] Community-card region
* [x] Board card detection
* [x] Board state
* [x] Board state tracking
* [x] Flop detection
* [x] Turn detection
* [x] River detection
* [x] Stable street events

## 4.6 Card Recognition

* [x] Card symbol preprocessing
* [x] Suit recognition foundation
* [x] Rank recognition foundation
* [x] Full-card recognition
* [x] Recognized community-card events
* [x] Foreground IoU symbol comparison

### Current Limitation

* [ ] Generalize rank recognition across arbitrary live tables
* [ ] Generalize suit recognition across arbitrary live tables
* [ ] Improve confidence calibration

## 4.7 Player Action Regions

* [x] Seat-relative action regions
* [x] Bet-chip detection
* [x] Connected chip components
* [x] Seat-aware component selection
* [x] Static UI edge rejection
* [x] Chip-relative amount region

## 4.8 Bet Amount OCR

* [x] Amount preprocessing
* [x] Tesseract OCR
* [x] Bet amount parsing
* [x] Numeric amount detection
* [x] Stable amount transitions
* [x] Total contribution semantics

## 4.9 Action Recognition

* [x] Explicit Check label
* [x] Explicit Call label
* [x] Explicit Fold label
* [x] Place Bet label
* [x] Check reconstruction
* [x] Fold reconstruction
* [x] Call reconstruction
* [x] Bet reconstruction
* [x] Raise reconstruction
* [x] Street-aware action context
* [x] Contribution snapshots
* [x] Suppress unsafe amount-derived actions

### Conservative Semantics

* [x] Do not infer fold from card disappearance
* [x] Do not infer check from chip absence
* [x] Do not infer bet/call/raise from chip appearance alone
* [x] Do not treat cleared amount as poker action

## 4.10 Temporal State

* [x] Table state
* [x] Table state diff
* [x] Table state tracker
* [x] Stable card events
* [x] Board state tracker
* [x] Bet amount state tracker
* [x] Hand lifecycle detection
* [x] Hand-start detection
* [x] Hand-end detection

## 4.11 VideoHand Reconstruction

* [x] VideoHand model
* [x] Players
* [x] Streets
* [x] Board cards
* [x] Player actions
* [x] Action timestamps
* [x] Hand start timestamp
* [x] Hand completion timestamp
* [x] VideoHandBuilder

## 4.12 Live macOS Capture

* [x] FrameSource abstraction
* [x] VideoFrameSource
* [x] ScreenFrameSource
* [x] Native Swift capture helper
* [x] ScreenCaptureKit integration
* [x] JPEG frame stream
* [x] Direct `swiftc` build
* [x] LiveVisionSession
* [x] Live table-state processing
* [x] Live board processing
* [x] Live action processing
* [x] Live hand lifecycle
* [x] LiveHandTracker
* [x] End-to-end live hand reconstruction

---

# Phase 5 — Analysis Integration 🟡

Phase 5 connects reconstructed `VideoHand` objects to the existing deterministic analysis pipeline.

```text
VideoHand
   ↓
HandHistory
   ↓
Replay
   ↓
Decision Points
   ↓
Decision Context
   ↓
Decision Analysis
   ↓
Analysis Report
```

## 5.1 VideoHand → HandHistory ✅

* [x] Add hand-history dependency to vision
* [x] Add poker-engine dependency to vision
* [x] Define video-hand metadata
* [x] Map seat index → player
* [x] Map player identity
* [x] Map positions
* [x] Map starting stacks
* [x] Support optional hole cards
* [x] Map board cards
* [x] Map player actions
* [x] Preserve timestamps
* [x] Use `amountType: "total"` for OCR-derived amounts
* [x] Skip unsafe unknown numeric actions
* [x] Generate small-blind forced bet
* [x] Generate big-blind forced bet
* [x] Support heads-up BTN/SB convention
* [x] Fix replay of total amounts with forced bets

## 5.2 HandHistory → Decision Points ✅

* [x] Feed adapted VideoHand into `findDecisionPoints`
* [x] Verify Hero decision points
* [x] Correct heads-up preflop action order
* [x] Correct heads-up postflop action order
* [x] Add betting-state regression tests
* [x] Add Vision → DecisionPoint integration test

## 5.3 Decision Analysis Pipeline 🟡

Current development focus.

```text
VideoHand
   ↓
videoHandToHandHistory()
   ↓
HandHistory
   ↓
findDecisionPoints()
   ↓
DecisionPoint
   ↓
DecisionContext
   ↓
analyzeDecisionPoint()
   ↓
Analysis Result
```

* [ ] Build DecisionContext from vision-derived decision
* [ ] Verify Hero hole-card requirements
* [ ] Verify board state at decision
* [ ] Verify pot and contribution state
* [ ] Supply villain range
* [ ] Run existing decision analyzer
* [ ] Verify call analysis
* [ ] Verify bet analysis
* [ ] Verify raise analysis
* [ ] Add focused Vision → Analysis integration test
* [ ] Produce analysis result from reconstructed hand

## 5.4 Analysis Report Integration

* [ ] Generate report from reconstructed hand
* [ ] Preserve decision timestamp
* [ ] Preserve street
* [ ] Preserve source action
* [ ] Link analysis result to video timestamp
* [ ] Support multiple decisions per hand

## 5.5 End-to-End Vision Analysis

Target:

```text
Recorded / Live Poker
        ↓
      Vision
        ↓
    VideoHand
        ↓
    HandHistory
        ↓
      Replay
        ↓
 Decision Context
        ↓
 Decision Analysis
        ↓
      Report
```

* [ ] Run complete recorded-video analysis
* [ ] Run complete live-hand analysis
* [ ] Verify no fabricated poker state
* [ ] Handle partially recognized hands
* [ ] Handle unavailable analysis inputs cleanly

---

# Phase 6 — Desktop Review Application ⬜

Build the review UI using React + TypeScript.

Potential stack:

```text
Tauri / Electron
       +
     React
       +
   TypeScript
```

## Application

* [ ] Application shell
* [ ] Video import
* [ ] Video player
* [ ] Hand list
* [ ] Hand details
* [ ] Decision list
* [ ] Analysis panel
* [ ] Timeline
* [ ] Settings

## Video Review

* [ ] Jump to hand
* [ ] Jump to decision
* [ ] Jump to street
* [ ] Show Hero cards
* [ ] Show board
* [ ] Show pot
* [ ] Show action history
* [ ] Show analysis
* [ ] Add notes

## Live Review

* [ ] Start live capture
* [ ] Show detected table
* [ ] Show current hand
* [ ] Show detected actions
* [ ] Show completed hands
* [ ] Analyze completed decisions

---

# Phase 7 — Video Review + Analysis ⬜

Connect decision analysis directly to source timestamps.

## Timestamp Integration

* [x] Store hand timestamps in VideoHand
* [x] Store action timestamps in VideoHand
* [ ] Carry decision timestamp into analysis result
* [ ] Link DecisionContext to timestamp
* [ ] Link AnalysisReport to timestamp

## Review Workflow

* [ ] Click decision → seek video
* [ ] Show analysis beside video
* [ ] Show action timeline
* [ ] Highlight Hero decisions
* [ ] Review entire hand
* [ ] Review session

Target workflow:

```text
Video
  ↓
Detected Hand
  ↓
Decision
  ↓
Analysis
  ↓
Click Decision
  ↓
Jump to Exact Video Moment
```

---

# Phase 8 — Database ⬜

Potential stack:

```text
PostgreSQL
    +
  Prisma
```

## Models

* [ ] User
* [ ] Session
* [ ] Video
* [ ] Hand
* [ ] Player
* [ ] Action
* [ ] Decision
* [ ] Analysis
* [ ] Range
* [ ] Report
* [ ] Note

## Storage

* [ ] Database abstraction
* [ ] File storage abstraction
* [ ] Video metadata
* [ ] Analysis persistence
* [ ] Session persistence

Raw video should remain outside PostgreSQL and be referenced through storage metadata.

---

# Phase 9 — AI Assistance ⬜

AI should explain and organize deterministic analysis rather than replace the poker engine.

## Explanations

* [ ] Explain decisions
* [ ] Explain EV
* [ ] Explain pot odds
* [ ] Explain equity
* [ ] Explain ranges
* [ ] Explain mistakes

## Session Analysis

* [ ] Summarize session
* [ ] Identify recurring patterns
* [ ] Explain common decision types
* [ ] Generate review notes

## Natural Language

* [ ] Ask questions about hands
* [ ] Ask questions about sessions
* [ ] Search decisions
* [ ] Search analysis
* [ ] Generate summaries

Important principle:

```text
Poker Engine
     ↓
Facts / Numbers
     ↓
AI
     ↓
Explanation
```

AI should not invent poker calculations.

---

# Phase 10 — Production ⬜

## Application

* [ ] Desktop packaging
* [ ] macOS build
* [ ] Windows build
* [ ] Auto-update
* [ ] Application settings

## Reliability

* [ ] Error handling
* [ ] Logging
* [ ] Crash reporting
* [ ] Recovery
* [ ] Large-video handling
* [ ] Performance optimization

## Security

* [ ] Secure local storage
* [ ] API authentication
* [ ] Data protection
* [ ] Safe file handling
* [ ] Permission handling

## Documentation

* [x] Root README
* [x] Poker engine README
* [x] Hand history README
* [x] Hand parser README
* [x] Video README
* [x] Vision README
* [x] Architecture documentation
* [x] Roadmap
* [ ] API documentation
* [ ] User documentation
* [ ] Development guide

---

# Repository Structure

```text
PokerVision/
├── apps/
│   ├── desktop/
│   └── api/
│
├── packages/
│   ├── poker-engine/
│   ├── hand-history/
│   ├── hand-parser/
│   ├── video/
│   ├── vision/
│   ├── screen-capture-macos/
│   └── ...
│
├── ROADMAP.md
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```

---

# Design Principles

* [x] Keep poker calculations deterministic
* [x] Keep source parsing separate from poker logic
* [x] Use `HandHistory` as the canonical analysis model
* [x] Keep packages independently testable
* [x] Keep video processing separate from poker analysis
* [x] Keep AI separate from deterministic calculations
* [x] Prefer reusable domain abstractions
* [x] Maintain strong TypeScript types
* [x] Add regression tests for discovered poker-state bugs
* [x] Preserve uncertainty instead of fabricating vision results

---

# Definition of Done

A feature is considered complete when:

* [ ] Implementation is complete
* [ ] TypeScript passes
* [ ] Focused unit tests pass
* [ ] Integration tests pass where applicable
* [ ] Relevant edge cases are covered
* [ ] Public API is documented where necessary
* [ ] README / roadmap is updated when necessary
* [ ] No unrelated files are changed

For vision features:

* [ ] Real fixture is tested where applicable
* [ ] Temporal behavior is tested where applicable
* [ ] Ambiguous visual state does not fabricate poker actions

---

# Immediate Next Steps

The current development focus is **Phase 5.3 — Decision Analysis Pipeline**:

1. [ ] Build `DecisionContext` from a vision-derived decision point
2. [ ] Verify Hero hole-card requirements
3. [ ] Verify replayed pot, board, and contribution state
4. [ ] Supply a villain range
5. [ ] Run the existing Phase 3 decision analyzer
6. [ ] Verify call analysis end-to-end
7. [ ] Verify bet and raise analysis
8. [ ] Add a focused Vision → Analysis integration test
9. [ ] Connect the result to `AnalysisReport`
10. [ ] Preserve the source video timestamp

After Phase 5 is complete, begin the desktop review application.