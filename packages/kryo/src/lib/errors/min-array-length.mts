import incident, { Incident } from "incident";

export type Name = "MinArrayLength";
export const name: Name = "MinArrayLength";

export interface Data {
  array: ArrayLike<any>;
  min: number;
}

export type Cause = undefined;
export type MinArrayLengthError = Incident<Data, Name, Cause>;

export function format({array, min}: Data): string {
  return `Expected array length (${array.length}) to be greater than or equal to ${min}`;
}

export function createMinArrayLengthError(array: ArrayLike<any>, min: number): MinArrayLengthError {
  return incident.Incident(name, {array, min}, format);
}
