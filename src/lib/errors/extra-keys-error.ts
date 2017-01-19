import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `ExtraKeysError`.
 */
export interface ExtraKeysErrorData {
  extraKeys: string[];
}

export class ExtraKeysError extends KryoError<ExtraKeysErrorData> {
  constructor(extraKeys: string[]) {
    super(
      "extra-keys",
      {extraKeys: extraKeys},
      `The following keys are extraneous: ${JSON.stringify(extraKeys)}`
    );
  }
}
