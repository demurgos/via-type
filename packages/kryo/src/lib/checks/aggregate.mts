import {CheckId} from "../index.mjs";
import {CheckKind} from "./check-kind.mjs";

export interface AggregateCheck {
  readonly check: CheckKind.Aggregate,
  readonly children: readonly CheckId[],
}

export function formatAggregateCheck(check: AggregateCheck): string {
  return `check has ${check.children.length} child checks`;
}
