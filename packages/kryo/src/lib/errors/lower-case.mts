import incident, { Incident } from "incident";

export type Name = "LowerCase";
export const name: Name = "LowerCase";

export interface Data {
  string: string;
}

export type Cause = undefined;
export type LowerCaseError = Incident<Data, Name, Cause>;

export function format({string}: Data): string {
  return `Expected the following string to be lowercase: ${JSON.stringify(string)}`;
}

export function createLowerCaseError(string: string): LowerCaseError {
  return incident.Incident(name, {string}, format);
}
