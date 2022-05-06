import incident, { Incident } from "incident";

export type Name = "NullProperty";
export const name: Name = "NullProperty";

export interface Data {
  key: string;
}

export type Cause = undefined;
export type NullPropertyError = Incident<Data, Name, Cause>;

export function format({key}: Data): string {
  return `The property ${key} is not allowed to be null`;
}

export function createNullPropertyError(key: string): NullPropertyError {
  return incident.Incident(name, {key}, format);
}
