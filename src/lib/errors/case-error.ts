import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `LowerCaseError`.
 */
export interface LowerCaseErrorData {
  string: string;
}

export class LowerCaseError extends KryoError<LowerCaseErrorData> {
  constructor(string: string) {
    super(
      "CaseError",
      {string: string},
      "Expected string to be lowercase"
    );
  }
}
