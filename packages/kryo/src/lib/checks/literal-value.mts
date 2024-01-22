import {CheckKind} from "./check-kind.mjs";

export interface LiteralValueCheck {
  readonly check: CheckKind.LiteralValue,
  readonly children?: null;
}

export function formatLiteralValueCheck(): string {
  return "expected value to match literal value";
}
