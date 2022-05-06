import incident, { Incident } from "incident";

export type Name = "FiniteNumber";
export const name: Name = "FiniteNumber";

export interface Data {
  value: number;
}

export type Cause = undefined;
export type FiniteNumberError = Incident<Data, Name, Cause>;

export function format({value}: Data): string {
  return `Expected a finite number, received ${value}`;
}

export function createFiniteNumberError(value: number): FiniteNumberError {
  return incident.Incident(name, {value}, format);
}
