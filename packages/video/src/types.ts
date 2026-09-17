export interface VideoMetadata {
  width: number;
  height: number;
  fps: number;
  durationSeconds: number;
  frameCount: number;
  codec: string;
  format: string;
}

export interface VideoFrame {
  index: number;
  timestampSeconds: number;
  data: Uint8Array;
  width: number;
  height: number;
}

export interface VideoFrameRequest {
  startSeconds?: number;
  endSeconds?: number;
  fps?: number;
}