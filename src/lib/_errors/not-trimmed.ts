import {Incident} from "incident";

export namespace NotTrimmedError {
  export type Name = "NotTrimmed";
  export const name: Name = "NotTrimmed";
  export interface Data {
    string: string;
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({string}: Data): string {
    return `Expected the following string to be trimmed: ${JSON.stringify(string)}`;
  }
  export function create(string: string): Type {
    return Incident(name, {string}, format);
  }
}

export type NotTrimmedError = NotTrimmedError.Type;

export default NotTrimmedError;
