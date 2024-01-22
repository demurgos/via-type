import {CheckKind} from "./check-kind.mjs";

export interface UnixTimestampCheck {
  readonly check: CheckKind.UnixTimestamp,
  readonly children?: null;
}

export function formatUnixTimestampCheck(): string {
  return "expected unix timestamp to be a finite Float64 in the safe integer range";
}
