# PokerVision

PokerVision is a poker hand analysis platform that turns recorded hand data into structured hands, replayable game states, and actionable analysis.

The project is designed to eventually connect hand histories, video, computer vision, and AI-assisted review into a single analysis workflow.

```text id="u6b3e1"
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

## Packages

### `@poker-vision/poker-engine`

Core poker logic and calculations.

* Cards and decks
* Hand evaluation
* Game state
* Betting rules
* Pots and showdown
* Ranges and equity
* Pot odds
* EV
* Decision analysis

### `@poker-vision/hand-history`

Canonical hand model and replay layer.

* Hand-history model
* Validation
* Replay
* Betting state
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

### Planned Packages

```text id="a7qf4j"
video
vision
card-recognition
strategy
database
shared
```

These packages will support the future video → hand → analysis pipeline.

## Architecture

```text id="w6y0jk"
                 ┌─────────────────┐
                 │  Hand Sources   │
                 │ TXT / Video     │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │  hand-parser    │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │  hand-history   │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │  poker-engine   │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │    Analysis     │
                 └─────────────────┘
```

Future video processing will feed the same `HandHistory` model:

```text id="cm4d5m"
Video
  ↓
Frame Extraction
  ↓
Computer Vision
  ↓
HandHistory
  ↓
Poker Engine
  ↓
Analysis
```

## Repository Structure

```text id="tqv9pc"
PokerVision/
├── apps/
│   ├── desktop/
│   └── api/
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
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```

## Development

Install dependencies:

```bash id="6j3h0p"
pnpm install
```

Run tests:

```bash id="t7e6uy"
pnpm test
```

Run the full build:

```bash id="m1r0e5"
pnpm build
```

Run a specific package:

```bash id="5w9e2h"
pnpm --filter @poker-vision/poker-engine test
pnpm --filter @poker-vision/hand-history test
pnpm --filter @poker-vision/hand-parser test
```

## Current Status

```text id="4n1h5a"
Phase 1  — Poker Engine              ✅
Phase 2  — Hand History + Replay     ✅
Phase 3  — Decision Analysis         🟡
Phase 4  — Video / Recording         ⬜
Phase 5  — Desktop UI                ⬜
Phase 6  — Video → HandHistory       ⬜
Phase 7  — Analysis + Video Review   ⬜
Phase 8  — Database                  ⬜
Phase 9  — AI Assistance             ⬜
Phase 10 — Production                ⬜
```

## Design Principles

* **Deterministic** — poker calculations should be reproducible.
* **Source-independent models** — all inputs eventually produce `HandHistory`.
* **Separation of concerns** — parsing, poker logic, vision, UI, and AI remain separate.
* **Testable** — core logic should be covered by automated tests.
* **Composable** — packages should be usable independently.
* **AI as an assistant** — deterministic poker calculations remain the source of truth.

## Roadmap

See [`ROADMAP.md`](./ROADMAP.md) for the detailed project plan and implementation checklist.
