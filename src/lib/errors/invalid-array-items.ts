import { Incident } from "incident";

export type Name = "InvalidArrayItems";
export const name: Name = "InvalidArrayItems";

export interface Data {
  /**
   * Map from item index to error.
   */
  invalid: Map<number, Error>;
}

export type Cause = undefined;
export type InvalidArrayItemsError = Incident<Data, Name, Cause>;

export function createInvalidArrayItemsError(invalid: Map<number, Error>): InvalidArrayItemsError {
  return Incident(name, {invalid});
}
