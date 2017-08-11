import {Incident} from "incident";

export namespace InvalidTimestampError {
  export type Name = "InvalidTimestamp";
  export const name: Name = "InvalidTimestamp";
  export interface Data {
    date: Date;
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({date}: Data): string {
    return `Invalid timestamp for the date: ${JSON.stringify(date)}`;
  }
  export function create(date: Date): Type {
    return Incident(name, {date}, format);
  }
}

export type InvalidTimestampError = InvalidTimestampError.Type;

export default InvalidTimestampError;
