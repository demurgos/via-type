export enum CaseStyle {
  CamelCase,
  PascalCase,
  SnakeCase,
  ScreamingSnakeCase,
  KebabCase,
}

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
        return part.substr(0, upperLength).toUpperCase() + part.substring(upperLength).toLowerCase();
      }).join("");
    case CaseStyle.PascalCase:
      return parts.map((part: string): string => {
        return part.substr(0, 1).toUpperCase() + part.substring(1).toLowerCase();
      }).join("");
  }
}

export function rename(identifier: string, to: CaseStyle): string;
export function rename(identifier: string, from: CaseStyle, to: CaseStyle): string;
export function rename(identifier: any, from: any, to?: any): any {
  if (to === undefined) {
    to = from;
    from = detectCaseStyle(identifier);
  }
  return join(to, split(from, identifier));
}
