# PokerVision Roadmap

PokerVision is being built as a modular poker analysis platform that can process hand histories and, eventually, recorded poker video.

## Project Architecture

```text
Hand History / Video
        ↓
     Parsing
        ↓
   HandHistory
        ↓
      Replay
        ↓
  Poker Engine
        ↓
 Decision Analysis
        ↓
 Reports / Review
```

---

# Phase 1 — Poker Engine

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

## Decision Analysis

* [x] Pot odds
* [x] Call EV
* [x] Call decision analysis
* [x] Decision classification
* [x] Valid villain combinations

---

# Phase 2 — Hand History + Replay

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
* [x] Track contributions
* [x] Track current player
* [x] Track current bet
* [x] Track pot
* [x] Track player status
* [x] Handle street transitions
* [x] Handle all-ins
* [x] Handle side pots
* [x] Handle split pots

## Decision Points

* [x] Detect player actions
* [x] Detect Hero decision points
* [x] Build decision context
* [x] Determine legal actions
* [x] Determine call amount
* [x] Determine minimum bet
* [x] Determine minimum raise
* [x] Resolve decision points

---

# Phase 2B — PokerStars Parser

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
* [x] Parser → Analysis
* [x] Real hand-history fixture

---

# Phase 2C — CLI

* [x] CLI entry point
* [x] Read hand-history file
* [x] Parse hands
* [x] Display parsed hand
* [x] Display decision points
* [x] Display analysis
* [x] Test with real PokerStars data

---

# Phase 2D — Current Checkpoint

* [x] Poker engine tests passing
* [x] Hand-history tests passing
* [x] Hand-parser tests passing
* [x] Integration tests passing
* [x] Real hand-history parsing
* [x] End-to-end analysis pipeline

Current pipeline:

```text
PokerStars TXT
      ↓
PokerStars Parser
      ↓
HandHistory
      ↓
Replay
      ↓
DecisionContext
      ↓
Villain Range
      ↓
Range Equity
      ↓
Pot Odds
      ↓
Call EV
      ↓
CLI Report
```

---

# Phase 3 — Decision Analysis

## Unified Analysis

* [ ] Create unified decision-analysis interface
* [ ] Standardize analysis results
* [ ] Standardize decision context
* [ ] Support alternative actions
* [ ] Support action comparisons

## Call

* [x] Detect call
* [x] Calculate call amount
* [x] Calculate pot odds
* [x] Calculate equity
* [x] Calculate EV
* [x] Classify decision
* [x] Generate report

## Fold

* [ ] Detect fold decisions
* [ ] Identify available alternatives
* [ ] Calculate hypothetical call EV
* [ ] Calculate hypothetical raise scenarios
* [ ] Compare alternatives
* [ ] Generate fold analysis

## Check

* [ ] Detect check decisions
* [ ] Identify betting opportunities
* [ ] Calculate equity
* [ ] Analyze board texture
* [ ] Analyze position
* [ ] Compare check vs bet

## Bet

* [ ] Capture bet size
* [ ] Calculate bet-to-pot ratio
* [ ] Calculate SPR
* [ ] Calculate equity
* [ ] Analyze board
* [ ] Analyze position
* [ ] Compare bet sizes

## Raise

* [ ] Capture previous bet
* [ ] Capture raise amount
* [ ] Calculate raise-to-pot ratio
* [ ] Calculate SPR
* [ ] Calculate equity
* [ ] Compare raise/call/fold

## All-In

* [ ] Detect all-in
* [ ] Calculate effective stack
* [ ] Calculate pot odds
* [ ] Calculate equity
* [ ] Calculate EV
* [ ] Analyze shove scenarios

## Alternative Actions

* [ ] Generate legal alternatives
* [ ] Analyze alternatives
* [ ] Store alternative results
* [ ] Compare outcomes
* [ ] Create decision summary

---

# Phase 3B — Reports

* [ ] Decision report
* [ ] Hand report
* [ ] Session report
* [ ] Action frequency report
* [ ] Position report
* [ ] Street report
* [ ] Preflop report
* [ ] Postflop report

---

# Phase 3C — Leak Detection

* [ ] Track decisions
* [ ] Track actions by position
* [ ] Track actions by street
* [ ] Track preflop frequencies
* [ ] Track continuation bets
* [ ] Track calling frequencies
* [ ] Track folding frequencies
* [ ] Track bet sizing
* [ ] Track river decisions
* [ ] Identify repeated patterns
* [ ] Generate leak candidates

---

# Phase 3D — Session Analysis

* [ ] Analyze multiple hands
* [ ] Aggregate decisions
* [ ] Aggregate EV
* [ ] Aggregate equity
* [ ] Group by position
* [ ] Group by street
* [ ] Group by action
* [ ] Generate session summary
* [ ] Generate detailed session report

---

# Phase 4 — Video / Screen Recording

Create the `@poker-vision/video` package.

## Video Sources

* [ ] Video file source
* [ ] MP4 support
* [ ] MOV support
* [ ] WebM support
* [ ] Screen recording source
* [ ] macOS screen capture
* [ ] Application/window capture

## Frame Processing

* [ ] Frame abstraction
* [ ] Frame buffer
* [ ] Frame extraction
* [ ] Frame timestamps
* [ ] Configurable FPS
* [ ] Frame sampling

## Table Detection

* [ ] Table region abstraction
* [ ] Table detector
* [ ] Multi-table support
* [ ] Table tracking

---

# Phase 5 — Desktop Application

Build the desktop UI using React + TypeScript.

Potential stack:

```text
Tauri / Electron
        +
      React
        +
   TypeScript
```

## UI

* [ ] Application shell
* [ ] Video player
* [ ] Hand list
* [ ] Hand details
* [ ] Decision markers
* [ ] Analysis panel
* [ ] Timeline
* [ ] Settings
* [ ] Import workflow

## Review

* [ ] Jump to decision
* [ ] Jump to street
* [ ] Show Hero cards
* [ ] Show board
* [ ] Show pot
* [ ] Show action history
* [ ] Show analysis
* [ ] Add notes

---

# Phase 6 — Video → HandHistory

Create the computer-vision pipeline.

```text
Video
  ↓
Frame Extraction
  ↓
Table Detection
  ↓
Card Recognition
  ↓
Player Detection
  ↓
Action Detection
  ↓
Street Detection
  ↓
Pot / Stack Detection
  ↓
Hand Reconstruction
  ↓
HandHistory
```

## Table

* [ ] Detect poker table
* [ ] Detect table boundaries
* [ ] Detect player regions
* [ ] Detect community-card region
* [ ] Detect action region

## Cards

* [ ] Detect cards
* [ ] Recognize rank
* [ ] Recognize suit
* [ ] Track cards across frames
* [ ] Confidence scores

## Players

* [ ] Detect player names
* [ ] Detect stacks
* [ ] Detect player positions
* [ ] Track players

## Actions

* [ ] Detect fold
* [ ] Detect check
* [ ] Detect call
* [ ] Detect bet
* [ ] Detect raise
* [ ] Detect all-in
* [ ] Detect action amounts

## Street Detection

* [ ] Detect preflop
* [ ] Detect flop
* [ ] Detect turn
* [ ] Detect river
* [ ] Detect showdown

## Reconstruction

* [ ] Build actions
* [ ] Reconstruct betting order
* [ ] Reconstruct pot
* [ ] Reconstruct stacks
* [ ] Validate reconstructed hand
* [ ] Generate confidence score

---

# Phase 7 — Video Review + Analysis

Connect video timestamps with decisions.

* [ ] Store hand timestamp
* [ ] Store decision timestamp
* [ ] Link DecisionContext to timestamp
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

# Phase 8 — Database

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

# Phase 9 — AI Assistance

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

# Phase 10 — Production

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
* [x] Architecture documentation
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
│   ├── shared/
│   ├── poker-engine/
│   ├── hand-history/
│   ├── hand-parser/
│   ├── video/
│   ├── vision/
│   ├── card-recognition/
│   ├── strategy/
│   └── database/
│
├── ROADMAP.md
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```

# Design Principles

* [ ] Keep poker calculations deterministic
* [ ] Keep source parsing separate from poker logic
* [ ] Use `HandHistory` as the canonical model
* [ ] Keep packages independently testable
* [ ] Keep video processing separate from analysis
* [ ] Keep AI separate from deterministic calculations
* [ ] Prefer reusable domain abstractions
* [ ] Maintain strong TypeScript types
* [ ] Add tests before major refactors

# Definition of Done

A feature is considered complete when:

* [ ] Implementation is complete
* [ ] TypeScript passes
* [ ] Unit tests pass
* [ ] Integration tests pass where applicable
* [ ] Edge cases are covered
* [ ] Public API is documented
* [ ] README is updated when necessary
* [ ] No unrelated files are changed

# Immediate Next Steps

The next development focus is **Phase 3 — Decision Analysis**:

1. [ ] Create unified decision-analysis interface
2. [ ] Implement fold analysis
3. [ ] Implement check analysis
4. [ ] Implement bet analysis
5. [ ] Implement raise analysis
6. [ ] Implement all-in analysis
7. [ ] Add alternative-action analysis
8. [ ] Expand decision reports
9. [ ] Add leak detection
10. [ ] Add session analysis

After Phase 3, begin the video and desktop architecture.
