import {Incident} from "incident";

export namespace MinUcs2StringLengthError {
  export type Name = "MinUcs2StringLength";
  export const name: Name = "MinUcs2StringLength";
  export interface Data {
    string: string;
    min: number;
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({string, min}: Data): string {
    return `Expected length of UCS2 string (${string.length}) to be greater than or equal to ${min}`;
  }
  export function create(string: string, min: number): Type {
    return Incident(name, {string, min}, format);
  }
}

export type MinUcs2StringLengthError = MinUcs2StringLengthError.Type;

export default MinUcs2StringLengthError;
