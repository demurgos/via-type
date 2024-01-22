import {CheckId} from "../index.mjs";
import {CheckKind} from "./check-kind.mjs";

export interface UnionMatchCheck {
  readonly check: CheckKind.UnionMatch,
  readonly children: [CheckId];
}

export function formatUnionMatchCheck(): string {
  return "at least one variant of the `TaggedUnion` must match";
}
