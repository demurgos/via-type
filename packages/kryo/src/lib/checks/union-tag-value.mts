import {CheckKind} from "./check-kind.mjs";

export interface UnionTagValueCheck {
  readonly check: CheckKind.UnionTagValue,
  readonly tag: string,
  readonly allowed: readonly string[],
  readonly actual: string,
  readonly children?: null;
}

export function formatUnionTagValueCheck(check: UnionTagValueCheck): string {
  return `record tag ${JSON.stringify(check.tag)} value must be valid; actual = ${JSON.stringify(check.actual)}, allowed = ${JSON.stringify(check.allowed)}`;
}
