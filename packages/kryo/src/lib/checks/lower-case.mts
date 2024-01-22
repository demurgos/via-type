import {CheckKind} from "./check-kind.mjs";

export interface LowerCaseCheck {
  readonly check: CheckKind.LowerCase,
  readonly children?: null;
}

export function formatLowerCaseCheck(): string {
  return "string must be lowerCase";
}
