import {CheckId} from "../index.mjs";
import {CheckKind} from "./check-kind.mjs";

export interface LiteralTypeCheck {
  readonly check: CheckKind.LiteralType,
  readonly children: [CheckId];
}

export function formatLiteralTypeCheck(): string {
  return "expected value to have literal type";
}
