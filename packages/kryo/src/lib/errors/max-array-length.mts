import incident, { Incident } from "incident";

export type Name = "MaxArrayLength";
export const name: Name = "MaxArrayLength";

export interface Data {
  array: ArrayLike<any>;
  max: number;
}

export type Cause = undefined;
export type MaxArrayLengthError = Incident<Data, Name, Cause>;

export function format({array, max}: Data): string {
  return `Expected array length (${array.length}) to be less than or equal to ${max}`;
}

export function createMaxArrayLengthError(array: ArrayLike<any>, max: number): MaxArrayLengthError {
  return incident.Incident(name, {array, max}, format);
}
