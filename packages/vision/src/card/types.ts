export interface CardRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CardDetection {
  found: boolean;
  confidence: number;
  regions: CardRegion[];
}