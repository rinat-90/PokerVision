export interface TableRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TableDetection {
  found: boolean;
  confidence: number;
  region?: TableRegion;
}