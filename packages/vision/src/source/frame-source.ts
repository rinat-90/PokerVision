export interface SourceFrame {
  index: number;
  width: number;
  height: number;
  timestampSeconds: number;
  data: Buffer;
}

export interface FrameSource
  extends AsyncIterable<SourceFrame> {
  start(): Promise<void>;
  stop(): Promise<void>;
}