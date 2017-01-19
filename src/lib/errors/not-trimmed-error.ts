import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `TrimError`.
 */
export interface TrimErrorData {
  string: string;
}

export class TrimError extends KryoError<TrimErrorData> {
  constructor(string: string) {
    super(
      "TrimError",
      {string: string},
      "Expected string to be trimmed"
    );
  }
}
