import {CheckKind} from "./check-kind.mjs";

export interface UnicodeNormalizationCheck {
  readonly check: CheckKind.UnicodeNormalization,
  readonly normalization: "NFC" | "NFD" | "NFKC" | "NFKD",
  readonly children?: null;
}

export function formatUnicodeNormalizationCheck(check: UnicodeNormalizationCheck): string {
  return `string must be unicode-normalized with ${check.normalization}`;
}
