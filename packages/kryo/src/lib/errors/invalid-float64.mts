import incident, { Incident } from "incident";

export type Name = "InvalidFloat64";
export const name: Name = "InvalidFloat64";

export interface Data {
  value: any;
  source?: any;
}

export type Cause = undefined;
export type InvalidFloat64Error = Incident<Data, Name, Cause>;

export function format({value, source}: Data): string {
  return `Invalid float64: ${value}` + (source === undefined ? "" : `, from ${source}`);
}

export function createInvalidFloat64Error(value: any, source?: any): InvalidFloat64Error {
  return incident.Incident(name, {value, source}, format);
}
