import {NumericDictionary} from "../interfaces";
import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `InvalidItemsError`.
 */
export interface InvalidItemsErrorData {
  items: NumericDictionary<Error>;
}

export class InvalidItemsError extends KryoError<InvalidItemsErrorData> {
  constructor(errors: NumericDictionary<Error>) {
    //noinspection TypeScriptValidateTypes
    super(
      "invalid-items",
      {items: errors},
      "There are some invalid items"
    );
  }
}
