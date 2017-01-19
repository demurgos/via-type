import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `MissingKeysError`.
 */
export interface MissingKeysErrorData {
  missingKeys: string[];
}

export class MissingKeysError extends KryoError<MissingKeysErrorData> {
  constructor(missingKeys: string[]) {
    super(
      "missing-keys",
      {missingKeys: missingKeys},
      `The following keys are missing: ${JSON.stringify(missingKeys)}`
    );
  }
}
