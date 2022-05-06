import incident, { Incident } from "incident";

export type Name = "PatternNotMatched";
export const name: Name = "PatternNotMatched";

export interface Data {
  string: string;
  pattern: RegExp;
}

export type Cause = undefined;
export type PatternNotMatchedError = Incident<Data, Name, Cause>;

export function format({pattern, string}: Data): string {
  return `The regular expression ${pattern} does not match the string ${JSON.stringify(string)}`;
}

export function createPatternNotMatchedError(pattern: RegExp, string: string): PatternNotMatchedError {
  return incident.Incident(name, {pattern, string}, format);
}
