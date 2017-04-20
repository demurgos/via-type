import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `MaxLengthError`.
 */
export interface MinCodepointLengthErrorData {
  string: string;
  minLength: number;
}

export class MinCodepointLengthError extends KryoError<MinCodepointLengthErrorData> {
  constructor(string: string, maxLength: number) {
    super(
      "MinCodepointLengthError",
      {string: string, minLength: maxLength},
      `Expected string codepoint-length to be greater than or equal to ${maxLength}`
    );
  }
}
