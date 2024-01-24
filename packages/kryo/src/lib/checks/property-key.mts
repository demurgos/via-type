import {CheckKind} from "./check-kind.mjs";

export interface PropertyKeyCheck {
  readonly check: CheckKind.PropertyKey,
  readonly children?: null;
}

export function formatPropertyKeyCheck(): string {
  return `record property key must be valid`;
}
