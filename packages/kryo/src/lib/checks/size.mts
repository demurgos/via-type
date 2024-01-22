import {CheckKind} from "./check-kind.mjs";

export interface SizeCheck {
  readonly check: CheckKind.Size,
  readonly min: number;
  readonly max: number | null;
  readonly actual?: number;
  readonly children?: null;
}

export function formatSizeCheck(check: SizeCheck): string {
  if (check.min === check.max) {
    return `expected size: ${check.min}, actual size: ${check.actual}`;
  } else if (check.max !== null) {
    return `expected size: ${check.min} <= actual <= ${check.max}, actual size: ${check.actual}`;
  } else {
    return `expected size: ${check.min} <= actual, actual size: ${check.actual}`;
  }
}
