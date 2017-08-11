import {Incident} from "incident";

export namespace UnknownFormatError {
  export type Name = "UnknownFormat";
  export const name: Name = "UnknownFormat";
  export interface Data {
    /**
     * The unknown format.
     */
    format: string;
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({format}: Data): string {
    return `Unknown format ${JSON.stringify(format)}, supported formats: bson, json or qs`;
  }
  export function create(unknownFormat: string): Type {
    return new Incident(name, {format: unknownFormat}, format);
  }
}

/**
 * This error is thrown when the provided format for serialization or deserialization is unsupported.
 *
 * Currently, only the two format "json-doc" and "bson-doc" are supported.
 */
export type UnknownFormatError = UnknownFormatError.Type;

export default UnknownFormatError;
