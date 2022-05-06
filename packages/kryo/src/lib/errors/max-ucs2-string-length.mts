import incident, { Incident } from "incident";

export type Name = "MaxUcs2StringLength";
export const name: Name = "MaxUcs2StringLength";

export interface Data {
  string: string;
  max: number;
}

export type Cause = undefined;
export type MaxUcs2StringLengthError = Incident<Data, Name, Cause>;

export function format({string, max}: Data): string {
  return `Expected length of UCS2 string (${string.length}) to be less than or equal to ${max}`;
}

export function createMaxUcs2StringLengthError(string: string, max: number): MaxUcs2StringLengthError {
  return incident.Incident(name, {string, max}, format);
}
