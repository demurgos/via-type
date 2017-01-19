import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `InvalidTimestampError`.
 */
export interface InvalidTimestampErrorData {
  date: Date;
}

export class InvalidTimestampError extends KryoError<InvalidTimestampErrorData> {
  constructor(date: Date) {
    super("invalid-timestamp", {date: date}, "Invalid timestamp");
  }
}
