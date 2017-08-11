import {Incident} from "incident";

export namespace NullPropertyError {
  export type Name = "NullProperty";
  export const name: Name = "NullProperty";
  export interface Data {
    key: string;
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({key}: Data): string {
    return `The property ${key} is not allowed to be null`;
  }
  export function create(key: string): Type {
    return Incident(name, {key}, format);
  }
}

export type NullPropertyError = NullPropertyError.Type;

export default NullPropertyError;
