import incident, { Incident } from "incident";

export type Name = "UnknownFormat";
export const name: Name = "UnknownFormat";

export interface Data {
  /**
   * Name of the unknown format.
   */
  format: string;
}

export type Cause = undefined;

/**
 * This error is thrown when the provided format for serialization or deserialization is unsupported.
 *
 * Currently, only the two format "json-doc" and "bson-doc" are supported.
 */
export type UnknownFormatError = Incident<Data, Name, Cause>;

export function format({format}: Data): string {
  return `Unknown format ${JSON.stringify(format)}, supported formats: bson, json or qs`;
}

export function createUnknownFormatError(unknownFormat: string): UnknownFormatError {
  return new incident.Incident(name, {format: unknownFormat}, format);
}
