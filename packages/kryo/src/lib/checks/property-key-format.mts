import {CheckKind} from "./check-kind.mjs";
import {CheckId} from "../index.mjs";

export interface PropertyKeyFormatCheck {
  readonly check: CheckKind.PropertyKeyFormat,
  readonly children?: readonly CheckId[];
}

export function formatPropertyKeyFormatCheck(): string {
  return `record property key must be valid`;
}
