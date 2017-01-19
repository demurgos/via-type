import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `NumericError`.
 */
export interface NumericErrorData {
  value: any;
}

export class NumericError extends KryoError<NumericErrorData> {
  constructor (value: any) {
    super (
      "NumericError",
      {value: value},
      "Value is not a number"
    );
  }
}
