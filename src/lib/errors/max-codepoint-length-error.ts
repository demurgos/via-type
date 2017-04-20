import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `MaxLengthError`.
 */
export interface MaxCodepointLengthErrorData {
  string: string;
  maxLength: number;
}

export class MaxCodepointLengthError extends KryoError<MaxCodepointLengthErrorData> {
  constructor(string: string, maxLength: number) {
    super(
      "MaxCodepointLengthError",
      {string: string, maxLength: maxLength},
      `Expected string codepoint-length to be less than or equal to ${maxLength}`
    );
  }
}
