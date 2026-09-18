import type {
  FrameSource,
  SourceFrame
} from "../source/frame-source.js";

export interface LiveVisionFrameProcessor {
  process(
    frame: SourceFrame
  ): Promise<void>;
}

export class LiveVisionSession {
  private running = false;

  constructor(
    private readonly source:
    FrameSource,

    private readonly processor:
    LiveVisionFrameProcessor
  ) {}

  async start(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    await this.source.start();

    try {
      for await (
        const frame of this.source
        ) {
        if (!this.running) {
          break;
        }

        await this.processor.process(
          frame
        );
      }
    } finally {
      this.running = false;

      await this.source.stop();
    }
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    this.running = false;

    await this.source.stop();
  }

  isRunning(): boolean {
    return this.running;
  }
}