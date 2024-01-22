import type {CheckId} from "../index.mjs";
import {CheckKind} from "./check-kind.mjs";

export interface CustomCheck {
  readonly check: CheckKind.Custom,
  readonly message: string,
  readonly children?: null | CheckId[];
}

export function formatCustomCheck(check: CustomCheck): string {
  return check.message;
}
