import incident, { Incident } from "incident";

export type Name = "MissingDependency";
export const name: Name = "MissingDependency";

export interface Data {
  name: string;
  role: string;
}

export type Cause = undefined;
export type MissingDependencyError = Incident<Data, Name, Cause>;

export function format({name, role}: Data): string {
  return `Missing optional dependencies ${JSON.stringify(name)}: ${role}`;
}

export function createMissingDependencyError(depName: string, role: string): MissingDependencyError {
  return incident.Incident(name, {name: depName, role}, format);
}
