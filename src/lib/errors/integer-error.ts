import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `IntegerError`.
 */
export interface IntegerErrorData {
  value: any;
}

export class IntegerError extends KryoError<IntegerErrorData> {
  constructor (value: number) {
    super (
      "NumericError",
      {value: value},
      "Value is not a number"
    );
  }
}
