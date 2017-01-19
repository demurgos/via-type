import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `ForbiddenNullError`.
 */
export interface ForbiddenNullErrorData {
  key: string;
}

export class ForbiddenNullError extends KryoError<ForbiddenNullErrorData> {
  constructor(key: string) {
    super(
      "forbidden-null",
      {key: key},
      `The value \`null\` is forbidden for the key ${key}`
    );
  }
}
