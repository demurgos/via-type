import incident, { Incident } from "incident";

export type Name = "MaxCodepoints";
export const name: Name = "MaxCodepoints";

export interface Data {
  string: string;
  count: number;
  max: number;
}

export type Cause = undefined;
export type MaxCodepointsError = Incident<Data, Name, Cause>;

export function format({count, max}: Data): string {
  return `Expected codepoints count (${count}) to be less than or equal to ${max}`;
}

export function createMaxCodepointsError(string: string, count: number, max: number): MaxCodepointsError {
  return incident.Incident(name, {string, count, max}, format);
}
