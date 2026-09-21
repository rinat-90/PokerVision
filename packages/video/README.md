# @poker-vision/video

Video input and frame-extraction layer for PokerVision.

This package provides deterministic access to recorded poker video, including metadata, timestamps, and decoded frames used by `@poker-vision/vision`.

```text
MP4 / MOV
    ↓
Video Metadata
    ↓
Frame Extraction
    ↓
Timestamped Frames
    ↓
@poker-vision/vision
```

## Responsibilities

* Open recorded video files
* Read video metadata
* Determine duration and FPS
* Extract individual frames
* Preserve frame timestamps
* Decode video frames into image data
* Provide deterministic frame access
* Supply frames to the computer-vision pipeline

## Non-Responsibilities

This package does **not** handle:

* Poker table detection
* Seat detection
* Card detection or recognition
* OCR
* Player-action recognition
* Temporal poker-state tracking
* Hand reconstruction
* Live screen capture
* Poker rules
* Hand-history replay
* Decision analysis
* UI
* Database persistence

Those responsibilities belong to other PokerVision packages.

## Architecture

```text
             Video File
                 ↓
        ┌─────────────────┐
        │      video      │
        └────────┬────────┘
                 ↓
          Video Metadata
                 +
         Timestamped Frames
                 ↓
        ┌─────────────────┐
        │     vision      │
        └────────┬────────┘
                 ↓
             VideoHand
                 ↓
            HandHistory
                 ↓
        Decision Analysis
```

The package deliberately knows nothing about poker.

Its job is to convert compressed video into reliable frames that downstream vision code can analyze.

## Video Input

Recorded poker footage can be processed from supported video containers such as:

```text
MP4
MOV
```

The video layer exposes information required by downstream processing:

* Width
* Height
* Duration
* FPS
* Frame index
* Frame timestamp
* Encoded or decoded frame data

## Metadata

Video metadata is extracted before processing begins.

Conceptually:

```ts
interface VideoMetadata {
  width: number;
  height: number;
  durationSeconds: number;
  fps: number;
}
```

Metadata allows the vision pipeline to reason about timing without coupling itself to the underlying video decoder.

## Frame Extraction

The package converts video into timestamped frames.

```text
Video
  ↓
Decoder
  ↓
Frame 0  — 0.000s
Frame 1  — 0.033s
Frame 2  — 0.067s
...
```

Each frame preserves enough information for downstream processing to know:

```text
frame index
timestamp
width
height
image data
```

## Frame Timing

Timestamps are important because PokerVision reconstructs temporal poker events.

```text
Frame
  ↓
timestampSeconds
  ↓
Vision Observation
  ↓
Stable State Change
  ↓
Poker Event
```

The video layer provides timing information but does not interpret what happened at that timestamp.

## Integration with Vision

`@poker-vision/vision` consumes video frames and performs poker-specific recognition.

```text
@poker-vision/video
        ↓
      Frames
        ↓
@poker-vision/vision
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

This separation keeps video decoding independent from computer vision.

## Recorded vs Live Input

Recorded video and live capture are intentionally separate concerns.

### Recorded

```text
MP4 / MOV
    ↓
@poker-vision/video
    ↓
vision
```

### Live macOS Capture

```text
macOS Screen
    ↓
screen-capture-macos
    ↓
ScreenFrameSource
    ↓
vision
```

The `video` package does not own live screen capture.

Both sources eventually provide frames to the same vision pipeline.

## Relationship to FrameSource

Vision uses a common frame abstraction:

```text
Recorded Video ──→ VideoFrameSource ──┐
                                     │
Live Screen ─────→ ScreenFrameSource ─┼──→ Vision Pipeline
                                     │
Future Source ────────────────────────┘
```

The video package provides the recorded-video side of this architecture.

This allows detection code to remain independent of where frames originated.

## Processing Pipeline

A typical recorded-hand workflow looks like:

```text
poker-session.mp4
        ↓
   Video Metadata
        ↓
   Frame Extraction
        ↓
@poker-vision/vision
        ↓
  Table Detection
        ↓
  Poker State
        ↓
    VideoHand
        ↓
   HandHistory
        ↓
Decision Analysis
```

Only the first two processing stages belong to `@poker-vision/video`.

## Package Structure

The exact structure may evolve, but the package should remain focused on video I/O:

```text
src/
├── metadata/
├── frame/
├── video-reader.ts
├── video-metadata.ts
├── frame-extractor.ts
└── index.ts
```

Poker-specific detectors should not be added to this package.

## Testing

Run package tests:

```bash
pnpm --filter @poker-vision/video test
```

Type-check the package:

```bash
pnpm --filter @poker-vision/video exec tsc --noEmit
```

Run the full repository test suite:

```bash
pnpm test
```

## Current Status

```text
Video
├── MP4 Input              ✅
├── MOV Input              ✅
├── Metadata Extraction    ✅
├── Duration               ✅
├── FPS                     ✅
├── Frame Extraction        ✅
├── Frame Timestamps        ✅
└── Vision Integration      ✅
```

The recorded-video input layer required for Phase 4 is complete.

Further work in video reconstruction belongs primarily to `@poker-vision/vision`.

## Design Principles

### Poker Independent

This package should not understand poker concepts.

```text
video → pixels
vision → poker observations
hand-history → poker replay
poker-engine → poker mathematics
```

### Deterministic

Given the same video and requested timestamp/frame, extraction should produce consistent input for the vision pipeline.

### Timestamp Preserving

Timing information must remain attached to frames because downstream temporal tracking depends on it.

### Source Separation

Recorded video decoding and live screen capture remain separate implementations while sharing a common downstream frame abstraction.

### Minimal Boundary

The package should expose only what computer vision needs:

```text
Video
  ↓
Metadata + Frames
```

Poker-specific logic belongs downstream.

## Role in PokerVision

`@poker-vision/video` is the bridge between **recorded video files and image frames**.

```text
       MP4 / MOV
           │
           ↓
    ┌─────────────┐
    │    video    │
    └──────┬──────┘
           ↓
        Frames
           ↓
    ┌─────────────┐
    │   vision    │
    └──────┬──────┘
           ↓
       VideoHand
           ↓
      HandHistory
           ↓
       Analysis
```

Its responsibility ends once reliable timestamped frames are available to the vision pipeline.