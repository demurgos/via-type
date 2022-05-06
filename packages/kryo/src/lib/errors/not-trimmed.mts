import incident, { Incident } from "incident";

export type Name = "NotTrimmed";
export const name: Name = "NotTrimmed";

export interface Data {
  string: string;
}

export type Cause = undefined;
export type NotTrimmedError = Incident<Data, Name, Cause>;

export function format({string}: Data): string {
  return `Expected the following string to be trimmed: ${JSON.stringify(string)}`;
}

export function createNotTrimmedError(string: string): NotTrimmedError {
  return incident.Incident(name, {string}, format);
}
