import incident, { Incident } from "incident";

export type Name = "InvalidRecord";
export const name: Name = "InvalidRecord";

export interface Data {
  /**
   * Extra properties.
   * If this error is thrown during a read operation, the keys in this set correspond to the
   * raw keys of the input record (even if a `rename` is applied).
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
export type InvalidRecord = Incident<Data, Name, Cause>;

export function createInvalidRecordError(data: Data): InvalidRecord {
  if (data.extra === undefined) {
    Reflect.deleteProperty(data, "extra");
  }
  return incident.Incident(name, data);
}
