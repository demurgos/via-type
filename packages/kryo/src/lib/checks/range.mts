import {CheckKind} from "./check-kind.mjs";

export interface RangeCheck {
  readonly check: CheckKind.Range,
  readonly min: number | null;
  readonly max: number | null;
  readonly actual: number;
  readonly children?: null;
}

export function formatRangeCheck(check: RangeCheck): string {
  if (check.min === check.max) {
    return `expected value: ${check.min}, actual: ${check.actual}`;
  }
  const lowerBound = typeof check.min === "number" ? `${check.min} <= ` : "";
  const upperBound = typeof check.max === "number" ? ` <= ${check.max}` : "";
  return `expected value: ${lowerBound}actual${upperBound}, actual: ${check.actual}`;
}
