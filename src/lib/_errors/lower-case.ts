import {Incident} from "incident";

export namespace LowerCaseError {
  export type Name = "LowerCase";
  export const name: Name = "LowerCase";
  export interface Data {
    string: string;
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({string}: Data): string {
    return `Expected the following string to be lowercase: ${JSON.stringify(string)}`;
  }
  export function create(string: string): Type {
    return Incident(name, {string}, format);
  }
}

export type LowerCaseError = LowerCaseError.Type;

export default LowerCaseError;
