import {Dictionary} from "../interfaces";
import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `InvalidPropertiesError`.
 */
export interface InvalidPropertiesData {
  errors: Dictionary<Error>;
}

export class InvalidPropertiesError extends KryoError<InvalidPropertiesData> {
  constructor(errors: Dictionary<Error>) {
    super(
      "invalid-properties",
      {errors: errors},
      `The following properties are invalid: ${JSON.stringify(errors)}`
    );
  }
}
