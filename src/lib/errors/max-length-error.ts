import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `MaxLengthError`.
 */
export interface MaxLengthErrorData {
  string: string | any[];
  maxLength: number;
}

export class MaxLengthError extends KryoError<MaxLengthErrorData> {
  constructor(string: string | any[], maxLength: number) {
    super(
      "MaxLengthError",
      {string: string, maxLength: maxLength},
      `Expected string length (${string.length}) to be less than or equal to ${maxLength}`
    );
  }
}
