import incident, { Incident } from "incident";

export type Name = "MinCodepoints";
export const name: Name = "MinCodepoints";

export interface Data {
  string: string;
  count: number;
  min: number;
}

export type Cause = undefined;
export type MinCodepointsError = Incident<Data, Name, Cause>;

export function format({count, min}: Data): string {
  return `Expected codepoints count (${count}) to be greater than or equal to ${min}`;
}

export function createMinCodepointsError(string: string, count: number, min: number): MinCodepointsError {
  return incident.Incident(name, {string, count, min}, format);
}
