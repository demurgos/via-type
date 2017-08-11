import {Incident} from "incident";

export namespace ExtraKeysError {
  export type Name = "ExtraKeys";
  export const name: Name = "ExtraKeys";
  export interface Data {
    keys: string[];
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({keys}: Data): string {
    return `Unexpected extra keys: ${JSON.stringify(keys)}`;
  }
  export function create(keys: string[]): Type {
    return Incident(name, {keys}, format);
  }
}

export type ExtraKeysError = ExtraKeysError.Type;

export default ExtraKeysError;
