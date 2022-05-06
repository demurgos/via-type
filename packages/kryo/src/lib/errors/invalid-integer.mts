import incident, { Incident } from "incident";

export type Name = "InvalidInteger";
export const name: Name = "InvalidInteger";

export interface Data {
  value: any;
  source?: any;
}

export type Cause = undefined;
export type InvalidIntegerError = Incident<Data, Name, Cause>;

export function format({value, source}: Data): string {
  return `Invalid integer: ${value}` + (source === undefined ? "" : `, from ${source}`);
}

export function createInvalidIntegerError(value: number, source?: any): InvalidIntegerError {
  return incident.Incident(name, {value, source}, format);
}
