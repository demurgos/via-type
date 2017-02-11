import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `MinLengthError`.
 */
export interface MinLengthErrorData {
  string: string | any[];
  minLength: number;
}

export class MinLengthError extends KryoError<MinLengthErrorData> {
  constructor(string: string | any[], minLength: number) {
    super(
      "MaxLengthError",
      {string: string, minLength: minLength},
      `Expected string length (${string.length}) to be greater than or equal to ${minLength}`
    );
  }
}
