import { Incident } from "incident";

export type Name = "InvalidDocument";
export const name: Name = "InvalidDocument";

export interface Data {
  /**
   * Extra properties.
   * If this error is thrown during a read operation, the keys in this set correspond to the
   * raw keys of the input document (even if a `rename` is applied).
   */
  extra?: Set<string>;

  /**
   * Missing properties.
   */
  missing: Set<string>;

  /**
   * Invalid properties (and associated error).
   */
  invalid: Map<string, Error>;
}

export type Cause = undefined;
export type InvalidDocumentError = Incident<Data, Name, Cause>;

export function createInvalidDocumentError(data: Data): InvalidDocumentError {
  return Incident(name, data);
}
