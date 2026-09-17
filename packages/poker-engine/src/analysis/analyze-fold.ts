export interface AnalyzeFoldResult {
  action: "fold";
  expectedValue: number;
  decision:
    | "profitable"
    | "unprofitable"
    | "break_even";
}

export function analyzeFold(): AnalyzeFoldResult {
  return {
    action: "fold",
    expectedValue: 0,
    decision: "break_even"
  };
}