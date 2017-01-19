import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `UnsupportedFormatError`.
 */
export interface UnsupportedFormatErrorData {
  /**
   * The provided format.
   */
  provided: string;

  /**
   * The list of supported formats.
   */
  supported: string[];
}

/**
 * This error is thrown when the provided format for serialization or deserialization is unsupported.
 *
 * Currently, only the two format "json-doc" and "bson-doc" are supported.
 */
export class UnsupportedFormatError extends KryoError<UnsupportedFormatErrorData> {
  /**
   * @param providedFormat The format provided by the user.
   */
  constructor(providedFormat: string) {
    super(
      "unsupported-format",
      {provided: providedFormat, supported: ["json-doc", "bson-doc"]},
      `Unsupported format ${JSON.stringify(providedFormat)}`
    );
  }
}
