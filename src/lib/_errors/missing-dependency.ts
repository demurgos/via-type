import {Incident} from "incident";

export namespace MissingDependencyError {
  export type Name = "MissingDependency";
  export const name: Name = "MissingDependency";
  export interface Data {
    name: string;
    role: string;
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({name, role}: Data): string {
    return `Missing optional dependencies ${JSON.stringify(name)}: ${role}`;
  }
  export function create(depName: string, role: string): Type {
    return Incident(name, {name: depName, role}, format);
  }
}

export type MissingDependencyError = MissingDependencyError.Type;

export default MissingDependencyError;
