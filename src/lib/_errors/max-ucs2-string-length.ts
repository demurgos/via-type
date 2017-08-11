import {Incident} from "incident";

export namespace MaxUcs2StringLengthError {
  export type Name = "MaxUcs2StringLength";
  export const name: Name = "MaxUcs2StringLength";
  export interface Data {
    string: string;
    max: number;
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({string, max}: Data): string {
    return `Expected length of UCS2 string (${string.length}) to be less than or equal to ${max}`;
  }
  export function create(string: string, max: number): Type {
    return Incident(name, {string, max}, format);
  }
}

export type MaxUcs2StringLengthError = MaxUcs2StringLengthError.Type;

export default MaxUcs2StringLengthError;
