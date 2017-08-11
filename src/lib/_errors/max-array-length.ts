import {Incident} from "incident";

export namespace MaxArrayLengthError {
  export type Name = "MaxArrayLength";
  export const name: Name = "MaxArrayLength";
  export interface Data {
    array: ArrayLike<any>;
    max: number;
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({array, max}: Data): string {
    return `Expected array length (${array.length}) to be less than or equal to ${max}`;
  }
  export function create(array: ArrayLike<any>, max: number): Type {
    return Incident(name, {array, max}, format);
  }
}

export type MaxArrayLengthError = MaxArrayLengthError.Type;

export default MaxArrayLengthError;
