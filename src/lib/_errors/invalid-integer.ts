import {Incident} from "incident";

export namespace InvalidIntegerError {
  export type Name = "InvalidInteger";
  export const name: Name = "InvalidInteger";
  export interface Data {
    value: any;
    source?: any;
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({value, source}: Data): string {
    return `Invalid integer: ${value}` + (source === undefined ? "" : `, from ${source}`);
  }
  export function create(value: number, source?: any): Type {
    return Incident(name, {value, source}, format);
  }
}

export type InvalidIntegerError = InvalidIntegerError.Type;

export default InvalidIntegerError;
