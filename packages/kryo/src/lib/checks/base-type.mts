import {CheckKind} from "./check-kind.mjs";

export interface BaseTypeCheck {
  readonly check: CheckKind.BaseType;
  readonly expected: readonly ("Boolean" | "Sint53" | "Float64" | "Null" | "Record" | "Bytes" | "Array" | "UsvString" | "Ucs2String" | "Object")[];
  readonly children?: null;
}

export function formatBaseTypeCheck(check: BaseTypeCheck): string {
  switch (check.expected.length) {
    case 0:
      return "expected type: Never";
    case 1:
      return `expected type: ${check.expected[0]}`;
    default:
      return `expected type: ${check.expected.join(" | ")}`;
  }
}
