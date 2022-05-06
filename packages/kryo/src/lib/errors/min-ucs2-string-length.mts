import incident, { Incident } from "incident";

export type Name = "MinUcs2StringLength";
export const name: Name = "MinUcs2StringLength";

export interface Data {
  string: string;
  min: number;
}

export type Cause = undefined;
export type MinUcs2StringLengthError = Incident<Data, Name, Cause>;

export function format({string, min}: Data): string {
  return `Expected length of UCS2 string (${string.length}) to be greater than or equal to ${min}`;
}

export function createMinUcs2StringLengthError(string: string, min: number): MinUcs2StringLengthError {
  return incident.Incident(name, {string, min}, format);
}
