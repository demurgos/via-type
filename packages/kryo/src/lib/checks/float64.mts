import {CheckKind} from "./check-kind.mjs";

export interface Float64Check {
  readonly check: CheckKind.Float64,
  readonly allowNaN: boolean;
  readonly allowInfinity: boolean;
  readonly allowNegativeZero: boolean;
  readonly children?: null;
}

export function formatFloat64Check(check: Float64Check): string {
  const forbidden: string[] = [];
  if (!check.allowNaN) {
    forbidden.push("NaN");
  }
  if (!check.allowInfinity) {
    forbidden.push("-Infinity");
    forbidden.push("+Infinity");
  }
  if (!check.allowNegativeZero) {
    forbidden.push("-0");
  }
  if (forbidden.length === 0) {
    return "value must be Float64";
  } else {
    return `value must be Float64 except ${forbidden.join(" | ")}`;
  }
}
