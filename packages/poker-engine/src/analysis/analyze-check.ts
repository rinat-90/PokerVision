export interface AnalyzeCheckResult {
  action: "check";
  expectedValue: number;
  decision:
    | "profitable"
    | "unprofitable"
    | "break_even";
}

export function analyzeCheck(): AnalyzeCheckResult {
  return {
    action: "check",
    expectedValue: 0,
    decision: "break_even"
  };
}