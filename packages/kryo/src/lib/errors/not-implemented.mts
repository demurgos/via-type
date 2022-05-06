import incident, { Incident } from "incident";

export type Name = "NotImplemented";
export const name: Name = "NotImplemented";

export interface Data {
}

export type Cause = undefined;
export type NotImplementedError = Incident<Data, Name, Cause>;

export function createNotImplementedError(message: string): NotImplementedError {
  return incident.Incident(name, message);
}
