import {Incident} from "incident";

export namespace InvalidArrayItemError {
  export type Name = "InvalidArrayItem";
  export const name: Name = "InvalidArrayItem";
  export interface Data {
    index: number;
    value: any;
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({index, value}: Data): string {
    return `Invalid value ${value} for the item at index ${index}`;
  }
  export function create(index: number, value: any): Type {
    return Incident(name, {index, value}, format);
  }
}

export type InvalidArrayItemError = InvalidArrayItemError.Type;

export default InvalidArrayItemError;
