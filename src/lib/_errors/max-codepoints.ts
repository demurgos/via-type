import {Incident} from "incident";

export namespace MaxCodepointsError {
  export type Name = "MaxCodepoints";
  export const name: Name = "MaxCodepoints";
  export interface Data {
    string: string;
    count: number;
    max: number;
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({count, max}: Data): string {
    return `Expected codepoints count (${count}) to be less than or equal to ${max}`;
  }
  export function create(string: string, count: number, max: number): Type {
    return Incident(name, {string, count, max}, format);
  }
}

export type MaxCodepointsError = MaxCodepointsError.Type;

export default MaxCodepointsError;
