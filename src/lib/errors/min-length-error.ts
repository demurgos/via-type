import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `MinLengthError`.
 */
export interface MinLengthErrorData {
  string: string;
  minLength: number;
}

export class MinLengthError extends KryoError<MinLengthErrorData> {
  constructor(string: string, minLength: number) {
    super(
      "MinLengthError",
      {string: string, minLength: minLength},
      `Expected string length (${string.length}) to be greater than or equal to ${minLength}`
    );
  }
}
