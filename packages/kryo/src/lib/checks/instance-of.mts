import {CheckKind} from "./check-kind.mjs";

export interface InstanceOfCheck {
  readonly check: CheckKind.InstanceOf,
  readonly class: string,
  readonly children?: null;
}

export function formatInstanceOfCheck(check: InstanceOfCheck): string {
  return `expected instance of ${check.class}`;
}
