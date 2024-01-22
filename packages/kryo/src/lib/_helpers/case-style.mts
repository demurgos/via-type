/**
 * This module defines utility functions to detect and change case styles.
 *
 * @module kryo/case-style
 */

import { CaseStyle } from "../index.mjs";

export function detectCaseStyle(identifier: string): CaseStyle {
  if (/^[A-Z]+[0-9]*(?:_[A-Z]+[0-9]*)*$/.test(identifier)) {
    return CaseStyle.ScreamingSnakeCase;
  } else if (/^[a-z]+[0-9]*(?:_[a-z]+[0-9]*)+$/.test(identifier)) {
    return CaseStyle.SnakeCase;
  } else if (/^[a-z]+[0-9]*(?:-[a-z]+[0-9]*)+$/.test(identifier)) {
    return CaseStyle.KebabCase;
  } else if (/^[A-Z]/.test(identifier)) {
    return CaseStyle.PascalCase;
  } else {
    return CaseStyle.CamelCase;
  }
}

export function split(caseStyle: CaseStyle, identifier: string): string[] {
  switch (caseStyle) {
    case CaseStyle.ScreamingSnakeCase:
      return identifier.toLowerCase().split("_");
    case CaseStyle.SnakeCase:
      return identifier.toLowerCase().split("_");
    case CaseStyle.KebabCase:
      return identifier.toLowerCase().split("-");
    case CaseStyle.CamelCase:
      return identifier.split(/(?=[A-Z])/).map((part: string): string => part.toLowerCase());
    case CaseStyle.PascalCase:
      return identifier.split(/(?=[A-Z])/).map((part: string): string => part.toLowerCase());
    default:
      throw new Error(`IncompleteSwitch: Received unexpected variant for caseStyle: ${caseStyle as string}`);
  }
}

export function join(caseStyle: CaseStyle, parts: string[]): string {
  switch (caseStyle) {
    case CaseStyle.ScreamingSnakeCase:
      return parts.join("_").toUpperCase();
    case CaseStyle.SnakeCase:
      return parts.join("_").toLowerCase();
    case CaseStyle.KebabCase:
      return parts.join("-").toLowerCase();
    case CaseStyle.CamelCase:
      return parts.map((part: string, index: number): string => {
        const upperLength: number = index === 0 ? 0 : 1;
        return part.substring(0, upperLength).toUpperCase() + part.substring(upperLength).toLowerCase();
      }).join("");
    case CaseStyle.PascalCase:
      return parts.map((part: string): string => {
        return part.substring(0, 1).toUpperCase() + part.substring(1).toLowerCase();
      }).join("");
    default:
      throw new Error(`IncompleteSwitch: Received unexpected variant for caseStyle: ${caseStyle as string}`);
  }
}

export function rename(identifier: string, to: CaseStyle): string;
// tslint:disable-next-line:unified-signatures
export function rename(identifier: string, from: CaseStyle, to: CaseStyle): string;
export function rename(identifier: string, from: CaseStyle, to?: CaseStyle): string {
  if (to === undefined) {
    to = from;
    from = detectCaseStyle(identifier);
  }
  return join(to, split(from, identifier));
}

export function renameMap<K extends string>(keys: Iterable<K>, to?: CaseStyle): Map<string, K> {
  const result: Map<string, K> = new Map();
  const outKeys: Set<string> = new Set();
  for (const key of keys) {
    const renamed: string = to === undefined ? key : rename(key, to);
    result.set(renamed, key);
    if (outKeys.has(renamed)) {
      throw new Error("NonBijectiveKeyRename: Some keys are the same after renaming");
    }
    outKeys.add(renamed);
  }
  return result;
}
